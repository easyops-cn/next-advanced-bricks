import type { Reducer } from "react";
import { isMatch, pick } from "lodash";
import type {
  DataPart,
  GeneratedView,
  Job,
  JobPatch,
  Message,
  Part,
  Task,
  TextPart,
} from "../../shared/interfaces";
import type { CruiseCanvasAction } from "./interfaces";
import { getAsyncConstructedView } from "../../shared/getAsyncConstructedView";

export const tasks: Reducer<Task[], CruiseCanvasAction> = (state, action) => {
  switch (action.type) {
    case "sse": {
      const tasksPatch = action.payload.tasks;
      let tasks = state;

      if (!Array.isArray(tasksPatch) || tasksPatch.length === 0) {
        return state;
      }

      for (const task of tasksPatch) {
        const taskPatch = pick(task, [
          "id",
          "upstream",
          "parent",
          "state",
          "plan",
          "startTime",
          "endTime",
          "jobs",
          "aiEmployeeId",
        ]);
        const previousTaskIndex = tasks.findIndex(
          (task) => task.id === taskPatch.id
        );
        const previousTask = tasks[previousTaskIndex];
        taskPatch.jobs = mergeJobs(
          previousTask?.jobs,
          taskPatch.jobs,
          action.workspace,
          taskPatch.aiEmployeeId ?? previousTask?.aiEmployeeId
        );

        if (previousTaskIndex === -1) {
          tasks = [...tasks, taskPatch as Task];
        } else {
          if (!isMatch(previousTask, taskPatch)) {
            tasks = [
              ...tasks.slice(0, previousTaskIndex),
              { ...previousTask, ...taskPatch } as Task,
              ...tasks.slice(previousTaskIndex + 1),
            ];
          }
        }
      }

      return tasks;
    }

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};

function mergeJobs(
  previousJobs: Job[] | undefined,
  jobsPatch: JobPatch[] | undefined,
  workspace: string,
  aiEmployeeId: string | undefined
): Job[] {
  let jobs = previousJobs ?? [];
  for (const jobPatch of jobsPatch ?? []) {
    const previousJobIndex =
      jobs?.findIndex((job) => job.id === jobPatch.id) ?? -1;
    const { messages: messagesPatch, toolCall } = jobPatch;

    if (typeof toolCall?.arguments === "string") {
      toolCall.originalArguments = toolCall.arguments;
      try {
        toolCall.arguments = JSON.parse(toolCall.arguments);
      } catch (e) {
        // Failed to parse toolCall arguments
        toolCall.arguments = {};
        toolCall.argumentsParseFailed = true;
        toolCall.argumentsParseError = e;
      }
    }

    if (previousJobIndex === -1) {
      const patch = {
        ...jobPatch,
      };
      if (aiEmployeeId !== undefined) {
        patch.aiEmployeeId = aiEmployeeId;
      }

      if (
        patch.toolCall?.name === "create_view" &&
        patch.state === "completed"
      ) {
        const generatedView = getJobGeneratedView(messagesPatch, workspace);
        if (generatedView) {
          patch.generatedView = generatedView;
        }
      }
      if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
        jobs = [
          ...jobs,
          {
            ...patch,
            messages: mergeMessages(messagesPatch),
          } as Job,
        ];
      } else {
        jobs = [...jobs, patch as Job];
      }
    } else {
      const previousJob = jobs[previousJobIndex];
      const restMessagesPatch: JobPatch = pick(jobPatch, [
        "id",
        "upstream",
        "parent",
        "state",
        "instruction",
        "toolCall",
        "isError",
        "hidden",
        "startTime",
        "endTime",
        "requestHumanAction",
        "humanAction",
        "username",
        "cmd",
      ]);
      if (aiEmployeeId !== undefined) {
        restMessagesPatch.aiEmployeeId = aiEmployeeId;
      }
      if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
        restMessagesPatch.messages = mergeMessages([
          ...(previousJob.messages ?? []),
          ...messagesPatch,
        ]);
      }

      if (
        !previousJob.generatedView &&
        (["create_view"] as (string | undefined)[]).includes(
          restMessagesPatch.toolCall?.name ?? previousJob.toolCall?.name
        ) &&
        (restMessagesPatch.state ?? previousJob.state) === "completed"
      ) {
        const generatedView = getJobGeneratedView(messagesPatch, workspace);
        if (generatedView) {
          restMessagesPatch.generatedView = generatedView;
        }
      }

      if (!previousJob.generatedView && !restMessagesPatch.generatedView) {
        const view = getJobStaticDataView(messagesPatch);
        if (view) {
          view.withContexts = {
            RESPONSE: getJobStaticDataResponse(restMessagesPatch.messages!),
          };
          view.asyncConstructedView = getAsyncConstructedView(view, workspace);
          restMessagesPatch.generatedView = view;
        }
      }

      if (!isMatch(previousJob, restMessagesPatch)) {
        jobs = [
          ...jobs.slice(0, previousJobIndex),
          {
            ...previousJob,
            ...restMessagesPatch,
          },
          ...jobs.slice(previousJobIndex + 1),
        ];
      }
    }
  }
  return jobs;
}

function mergeMessages(messages: Message[]): Message[] {
  const merged: Message[] = [];
  let previousRole: Message["role"] | undefined;
  for (const message of messages) {
    if (!previousRole || previousRole !== message.role) {
      merged.push({ ...message });
    } else {
      const lastMessage = merged[merged.length - 1];
      lastMessage.parts = [...lastMessage.parts, ...message.parts];
    }
    previousRole = message.role;
  }

  for (const message of merged) {
    message.parts = mergeMessageParts(message.parts);
  }

  return merged;
}

function mergeMessageParts(parts: Part[]): Part[] {
  const merged: Part[] = [];
  let previousType: Part["type"] | undefined;
  let previousDataType: string | undefined;
  for (const part of parts) {
    if (previousType === "text" && part.type === "text") {
      const lastPart = merged[merged.length - 1] as TextPart;
      lastPart.text += part.text;
    } else if (
      // Assert: previousType is data when previousDataType is defined
      previousDataType === "stream" &&
      part.type === "data" &&
      part.data?.type === "stream"
    ) {
      const lastPart = merged[merged.length - 1] as DataPart;
      lastPart.data.message += part.data.message;
    } else {
      merged.push({ ...part });
    }

    previousType = part.type;
    previousDataType = part.type === "data" ? part.data?.type : undefined;
  }
  return merged;
}

function getJobGeneratedView(
  messages: Message[] | undefined,
  workspace: string
): GeneratedView | undefined {
  if (!messages) {
    return;
  }

  for (const message of messages) {
    if (message.role === "tool") {
      for (const part of message.parts) {
        if (part.type === "text") {
          try {
            const view = JSON.parse(part.text) as GeneratedView;
            view.asyncConstructedView = getAsyncConstructedView(
              view,
              workspace
            );
            return view;
          } catch {
            // Do nothing, continue to next part
          }
        }
      }
    }
  }
}

function getJobStaticDataView(
  messages: Message[] | undefined
): GeneratedView | undefined {
  if (!messages) {
    return;
  }

  for (const message of messages) {
    if (message.role === "tool") {
      for (const part of message.parts) {
        if (part.type === "data" && part.data?.type === "static_data_view") {
          const view: GeneratedView = {
            viewId: part.data.viewId,
            code: part.data.code,
            from: part.data.from,
            isStaticData: true,
          };
          return view;
        }
      }
    }
  }
}

function getJobStaticDataResponse(messages: Message[]) {
  for (const message of messages) {
    if (message.role === "tool") {
      for (const part of message.parts) {
        if (part.type === "text") {
          try {
            return JSON.parse(part.text);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to parse static data response as JSON:", e);
          }
        }
      }
    }
  }

  return null;
}
