import { useMemo } from "react";
import type { ChatMessage } from "./interfaces.js";
import type {
  ConversationBaseDetail,
  ConversationError,
  Task,
} from "../shared/interfaces.js";
import { getFlatOrderedJobs } from "../cruise-canvas/getFlatOrderedJobs.js";

export function useConversationStream(
  conversation: ConversationBaseDetail | null | undefined,
  tasks: Task[],
  errors: ConversationError[],
  options?: {
    showHumanActions?: boolean;
  }
) {
  return useMemo(() => {
    if (!conversation) {
      return {
        messages: [],
        lastToolCallJobId: null,
      };
    }

    const messages: ChatMessage[] = [];

    const {
      list,
      map: jobMap,
      jobsWithFollowingErrors,
    } = getFlatOrderedJobs(tasks, errors);

    let prevAssistantMessage: ChatMessage = {
      role: "assistant",
      jobs: [],
    };
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
        if (
          prevAssistantMessage.jobs.length > 0 ||
          prevAssistantMessage.error
        ) {
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
      } else {
        prevAssistantMessage.jobs.push(job);
      }

      const followingError = jobsWithFollowingErrors.get(jobId);
      if (followingError) {
        prevAssistantMessage.error = followingError;
      }

      if (options?.showHumanActions && job.humanAction) {
        if (
          prevAssistantMessage.jobs.length > 0 ||
          prevAssistantMessage.error
        ) {
          messages.push(prevAssistantMessage);
        }
        messages.push({
          role: "user",
          content: job.humanAction,
        });
        prevAssistantMessage = {
          role: "assistant",
          jobs: [],
        };
      }
    }

    messages.push(prevAssistantMessage);

    return { messages, jobMap, lastToolCallJobId };
  }, [conversation, tasks, errors]);
}
