import type { Reducer } from "react";
import { isEqual, isMatchWith, pick } from "lodash";
import type {
  DataPart,
  Job,
  JobPatch,
  Message,
  Part,
  TextPart,
} from "../interfaces";
import type { CruiseCanvasAction } from "./interfaces";

export const jobs: Reducer<Job[], CruiseCanvasAction> = (state, action) => {
  switch (action.type) {
    case "sse": {
      const jobsPatch = action.payload.jobs;
      let jobs = action.isInitial ? [] : state;

      if (!Array.isArray(jobsPatch) || jobsPatch.length === 0) {
        return jobs;
      }

      for (const jobPatch of jobsPatch) {
        if ((jobPatch as any).state === "blocked") {
          jobPatch.state = "working";
        }

        const previousJobIndex =
          jobs?.findIndex((job) => job.id === jobPatch.id) ?? -1;
        const { messages: messagesPatch, toolCall } = jobPatch;

        if (typeof toolCall?.arguments === "string") {
          toolCall.originalArguments = toolCall.arguments;
          try {
            toolCall.arguments = JSON.parse(toolCall.arguments);
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to parse toolCall arguments:", e);
            toolCall.arguments = {};
            toolCall.argumentsParseFailed = true;
            toolCall.argumentsParseError = e;
          }
        }

        if (previousJobIndex === -1) {
          if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
            jobs = [
              ...jobs,
              {
                ...jobPatch,
                messages: mergeMessages(messagesPatch),
              } as Job,
            ];
          } else {
            jobs = [...jobs, jobPatch as Job];
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
            "startTime",
            "endTime",
          ]);
          if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
            restMessagesPatch.messages = mergeMessages([
              ...(previousJob.messages ?? []),
              ...messagesPatch,
            ]);
          }
          if (!isMatchWith(previousJob, restMessagesPatch, isEqual)) {
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

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};

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
