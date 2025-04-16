import { useEffect, useMemo, useRef, useState } from "react";
import { createSSEStream } from "@next-core/utils/general";
import { isMatch, pick } from "lodash";
import type { RawEdge, RawNode, Task, TaskPatch, Job, JobPatch, Message, Part, TextPart } from "./interfaces";

export function useRunDetail(taskId: string | undefined) {
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);

  const humanInputRef = useRef<((jobId: string, input: string) => void)>();

  useEffect(() => {
    setTaskDetail(null);
    humanInputRef.current = undefined;
    if (!taskId) {
      return;
    }

    let task: Task | null = null;
    let ignore = false;
    (async () => {
      const request = await createSSEStream<TaskPatch>(
        `/api/mocks/task/get?${new URLSearchParams({ id: taskId })}`
      );
      const stream = await request;
      for await (const value of stream) {
        if (ignore) {
          return;
        }
        task = mergeTask(task, value);
        setTaskDetail(task);
      }
    })();

    humanInputRef.current = async (jobId: string, input: string) => {
      const request = await createSSEStream<TaskPatch>(
        `/api/mocks/task/input`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: taskId,
            jobId: jobId,
            input,
          }),
        }
      );
      const stream = await request;
      for await (const value of stream) {
        task = mergeTask(task, value);
        setTaskDetail(task);
      }
    };

    return () => {
      ignore = true;
    };
  }, [taskId]);

  return useMemo(() => {
    if (!taskDetail) {
      return null;
    }
    const nodes: RawNode[] = [];
    const edges: RawEdge[] = [];
    const jobs = taskDetail.jobs ?? [];

    const requirementNodeId = "requirement";
    nodes.push({
      id: requirementNodeId,
      type: "requirement",
      content: taskDetail.requirement,
      state: jobs.length === 0 ? "working" : "completed",
    });

    const jobMap = new Map<string, Job>();
    const childrenMap = new Map<string, string[]>();
    const rootChildren: string[] = [];

    for (const job of jobs) {
      jobMap.set(job.id, job);
      if (job.parent?.length) {
        for (const p of job.parent) {
          let children = childrenMap.get(p);
          if (!children) {
            children = [];
            childrenMap.set(p, children);
          }
          children.push(job.id);
        }
      } else {
        rootChildren.push(job.id);
      }
    }

    const walk = (childJobs: string[], parent: string) => {
      for (const jobId of childJobs) {
        const job = jobMap.get(jobId)!;
        const { messages } = job;
        const hasMessages = Array.isArray(messages) && messages.length > 0;

        let parentNodeId = parent;

        if (job.instruction) {
          const instructionNodeId = `instruction:${jobId}`;
          nodes.push({
            id: instructionNodeId,
            jobId: jobId,
            type: "instruction",
            content: job.instruction,
            state: job.state === "working" && hasMessages ? "completed" : job.state,
          });

          edges.push({ source: parentNodeId, target: instructionNodeId });
          parentNodeId = instructionNodeId;
        }

        if (hasMessages) {
          const jobNodeId = `job:${job.id}`;
          nodes.push({
            id: jobNodeId,
            jobId: job.id,
            type: "job",
            tag: job.tag,
            messages: mergeMessages(messages),
            state: job.state,
          });
          edges.push({
            source: parentNodeId,
            target: jobNodeId,
          });
          parentNodeId = jobNodeId;
        }

        if (parentNodeId === parent) {
          continue;
        }

        const children = childrenMap.get(jobId);
        if (children) {
          walk(children, parentNodeId);
        }
      }
    };

    walk(rootChildren, requirementNodeId);

    return {
      task: taskDetail,
      nodes,
      edges,
      humanInput: humanInputRef.current,
    };
  }, [taskDetail]);
}

function mergeTask(previousTask: Task | null, taskPatch: TaskPatch): Task {
  if (!previousTask) {
    return taskPatch as Task;
  }

  const jobsPatch = taskPatch.jobs;

  const restTaskPatch = pick(taskPatch, [
    "id",
    "requirement",
    "state",
    "plan",
  ]);

  if (Array.isArray(jobsPatch) && jobsPatch.length > 0) {
    let jobs = previousTask.jobs;

    for (const jobPatch of jobsPatch) {
      const previousJobIndex = jobs?.findIndex((job) => job.id === jobPatch.id) ?? -1;
      if (previousJobIndex === -1) {
        jobs = [...(jobs ?? []), jobPatch as Job];
      } else {
        const previousJob = jobs[previousJobIndex];
        const { messages: messagesPatch } = jobPatch;
        const restMessagesPatch: JobPatch = pick(jobPatch, [
          "id",
          "parent",
          "state",
          "instruction",
          "tag",
        ]);
        if (Array.isArray(messagesPatch) && messagesPatch.length > 0) {
          restMessagesPatch.messages = [...(previousJob.messages ?? []), ...messagesPatch];
        }
        if (!isMatch(previousJob, restMessagesPatch)) {
          jobs = [...jobs.slice(0, previousJobIndex), {
            ...previousJob,
            ...restMessagesPatch,
          }, ...jobs.slice(previousJobIndex + 1)];
        }
      }
    }

    (restTaskPatch as TaskPatch).jobs = jobs;
  }

  if (isMatch(previousTask, restTaskPatch)) {
    return previousTask;
  }

  return { ...previousTask, ...restTaskPatch };
}

function mergeMessages(messages: Message[]): Message[] {
  const merged: Message[] = [];
  let previousRole: Message["role"] | undefined;
  for (const message of messages) {
    if (!previousRole || previousRole !== message.role) {
      merged.push({...message});
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
  for (const part of parts) {
    if (!previousType || previousType !== part.type || part.type !== "text") {
      merged.push({...part});
    } else {
      const lastPart = merged[merged.length - 1] as TextPart;
      lastPart.text += part.text;
    }
    previousType = part.type;
  }
  return merged;
}
