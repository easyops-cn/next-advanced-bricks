import { useMemo } from "react";
import type { Job, TaskBaseDetail } from "../cruise-canvas/interfaces.js";
import type { ChatMessage } from "./interfaces.js";
import { getOrderedJobs } from "../cruise-canvas/getOrderedJobs.js";

export function useChatStream(
  task: TaskBaseDetail | null | undefined,
  jobs: Job[] | null | undefined
): ChatMessage[] | null {
  return useMemo(() => {
    if (!task) {
      return null;
    }

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: task.requirement,
      },
    ];

    const { list, jobMap } = getOrderedJobs(jobs);
    messages.push({
      role: "assistant",
      jobs: list.map((jobId) => jobMap.get(jobId)!),
    });

    return messages;
  }, [task, jobs]);
}
