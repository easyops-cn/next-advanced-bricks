/* eslint-disable no-console */
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

    humanInputRef.current = async (jobId: string, input: string) => {
      const response = await fetch(
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
      if (response.ok) {
        console.log("human input ok");
      } else {
        console.error("human input failed", response.status, response.statusText);
      }
    };

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

    // Get BFS order of jobs
    const list: string[] = [];
    const visitedJobs = new Set<string>();
    const queue: string[] = [...rootChildren];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visitedJobs.has(id)) {
        continue;
      }
      visitedJobs.add(id);
      list.push(id);
      const children = childrenMap.get(id);
      if (children) {
        queue.push(...children);
      }
    }

    const jobNodesMap = new Map<string, string[]>([[requirementNodeId, [requirementNodeId]]]);

    for (const jobId of list) {
      const job = jobMap.get(jobId)!;
      const { messages } = job;
      const hasMessages = Array.isArray(messages) && messages.length > 0;

      const nodeIds: string[] = [];

      if (job.instruction) {
        const instructionNodeId = `instruction:${jobId}`;
        nodes.push({
          id: instructionNodeId,
          jobId: jobId,
          type: "instruction",
          content: job.instruction,
          state: job.state === "working" && hasMessages ? "completed" : job.state,
        });

        nodeIds.push(instructionNodeId);
      }

      if (hasMessages || !job.instruction) {
        const jobNodeId = `job:${job.id}`;
        nodes.push({
          id: jobNodeId,
          jobId: job.id,
          type: "job",
          tag: job.tag,
          messages: hasMessages ? mergeMessages(messages) : [{
            role: "assistant",
            parts: [{ type: "text", text: "..." }]
          }],
          state: job.state,
        });
        nodeIds.push(jobNodeId);
      }

      jobNodesMap.set(jobId, nodeIds);
    }

    for (const jobId of list) {
      const job = jobMap.get(jobId)!;
      const nodeIds = jobNodesMap.get(jobId)!;

      for (const parent of job.parent?.length ? job.parent : [requirementNodeId]) {
        const parentNodeIds = jobNodesMap.get(parent)!;
        edges.push({
          source: parentNodeIds[parentNodeIds.length - 1],
          target: nodeIds[0],
        });
      }

      for (let i = 1; i < nodeIds.length; i++) {
        edges.push({
          source: nodeIds[i - 1],
          target: nodeIds[i],
        });
      }
    }

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
