import { useMemo } from "react";
import type { ChatMessage } from "./interfaces.js";
import type { ConversationBaseDetail, Task } from "../shared/interfaces.js";
import { getFlatOrderedJobs } from "../cruise-canvas/getFlatOrderedJobs.js";

export function useConversationStream(
  conversation: ConversationBaseDetail | null | undefined,
  tasks: Task[]
) {
  return useMemo(() => {
    if (!conversation) {
      return {
        messages: [],
        inputRequiredJobId: null,
        lastToolCallJobId: null,
      };
    }

    const messages: ChatMessage[] = [];

    const {
      list,
      // roots: jobRoots,
      map: jobMap,
      // levels: jobLevels,
      // downstreamMap,
    } = getFlatOrderedJobs(tasks);

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

    return { messages, jobMap, inputRequiredJobId, lastToolCallJobId };
  }, [conversation, tasks]);
}
