import { useEffect, useMemo, useState } from "react";
import { createSSEStream } from "@next-core/utils/general";
import { isMatch, pick } from "lodash";
import type { RawEdge, RawNode } from "./interfaces";

export function useRunDetail(taskId: string | undefined) {
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);

  useEffect(() => {
    setTaskDetail(null);
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
          const content = messages.flatMap((msg) => msg.parts.map((part) => (part as TextPart).text)).join("");
          const jobNodeId = `job:${job.id}`;
          nodes.push({
            id: jobNodeId,
            jobId: job.id,
            type: "tool",
            tag: job.tag,
            content,
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

interface Task {
  // Task ID
  id: string;

  // User requirement
  requirement: string;

  // attachments?: File[];

  state: TaskState;

  plan: Step[];

  jobs: Job[];
}

interface Step {
  // Pre-generated Job ID for this step
  id: string;

  // The instruction for this step
  instruction: string;
}

interface Job {
  // Job ID
  id: string;

  // Parent job ID
  parent?: string[];

  // Instruction from plan
  instruction?: string;

  // The agent/tool tag used for this job
  // E.g., "online-search" or "generate-image"
  tag: string;

  state: JobState;

  messages?: Message[];
}

interface TaskPatch extends Omit<Partial<Task>, "jobs"> {
  jobs?: JobPatch[];
}

interface JobPatch extends Partial<Job> {
  id: string;
}

type TaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed"
  | "unknown";

type JobState = TaskState;

interface Message {
  role: string;
  parts: Part[];
}

type Part = TextPart | FilePart | DataPart;

interface TextPart {
  type: "text";
  text: string;
}

interface FilePart {
  type: "file";
  file: {
    name?: string;
    mimeType?: string;
    // oneof {
    bytes?: string; // base64 encoded content
    uri?: string;
    // }
  };
}

// 自定义结构化信息，用于个性化 UI 显示
interface DataPart {
  type: "data";
  data: Record<string, any>;
}
