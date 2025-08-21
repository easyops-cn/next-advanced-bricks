import { useMemo } from "react";
import type { Job, TaskBaseDetail } from "../cruise-canvas/interfaces.js";
import type { ChatMessage } from "./interfaces.js";
import { getOrderedJobs } from "../cruise-canvas/getOrderedJobs.js";

export function useChatStream(
  task: TaskBaseDetail | null | undefined,
  jobs: Job[] | null | undefined
) {
  return useMemo(() => {
    if (!task) {
      return {
        messages: [],
        inputRequiredJobId: null,
        lastToolCallJobId: null,
      };
    }

    const messages: ChatMessage[] = [
      {
        role: "user",
        content: task.requirement,
      },
    ];

    const { list, jobMap } = getOrderedJobs(jobs);

    let prevAssistantMessage: ChatMessage = {
      role: "assistant",
      jobs: [],
    };
    let inputRequiredJobId: string | null = null;
    let lastToolCallJobId: string | null = null;
    for (const jobId of list) {
      const job = jobMap.get(jobId)!;

      if (job.toolCall) {
        lastToolCallJobId = jobId;
      }

      if (
        job.state === "completed" &&
        job.messages?.length &&
        job.messages.every((msg) => msg.role === "user")
      ) {
        if (prevAssistantMessage.jobs.length > 0) {
          messages.push(prevAssistantMessage);
        }
        messages.push({
          role: "user",
          content: job.messages
            .flatMap((msg) =>
              msg.parts.map((part) => (part.type === "text" ? part.text : ""))
            )
            .join(""),
        });
        prevAssistantMessage = {
          role: "assistant",
          jobs: [],
        };
        continue;
      }

      prevAssistantMessage.jobs.push(job);

      const toolName = job.toolCall?.name;
      const askUser = toolName === "ask_human";
      if (askUser && job.state === "completed") {
        messages.push(prevAssistantMessage);

        loop: for (const msg of job.messages ?? []) {
          if (msg.role === "tool") {
            for (const part of msg.parts) {
              if (part.type === "text") {
                try {
                  const { human_answer } = JSON.parse(part.text);
                  messages.push({
                    role: "user",
                    content: human_answer,
                  });
                } catch (error) {
                  // eslint-disable-next-line no-console
                  console.error("Error parsing human answer:", error);
                }
              }
              break loop;
            }
          }
        }

        prevAssistantMessage = {
          role: "assistant",
          jobs: [],
        };
      }

      if (askUser && job.state === "input-required") {
        inputRequiredJobId = jobId;
      }
    }

    messages.push(prevAssistantMessage);

    return { messages, inputRequiredJobId, lastToolCallJobId };
  }, [task, jobs]);
}
