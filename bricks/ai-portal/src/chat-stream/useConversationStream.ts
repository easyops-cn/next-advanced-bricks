import { useMemo } from "react";
import type { ChatMessage, MessageFromAssistant } from "./interfaces.js";
import type {
  ActiveDetail,
  ActivityWithFlow,
  ConversationError,
  Job,
  ServiceFlowRun,
  Task,
} from "../shared/interfaces.js";
import { getFlatChunks } from "../shared/getFlatChunks.js";

export function useConversationStream(
  conversationAvailable: boolean,
  tasks: Task[],
  errors: ConversationError[],
  flowMap?: Map<string, ServiceFlowRun>,
  activityMap?: Map<string, ActivityWithFlow>,
  options?: {
    showHumanActions?: boolean;
  }
) {
  const showHumanActions = options?.showHumanActions;

  return useMemo(() => {
    if (!conversationAvailable) {
      return {
        messages: [],
        lastDetail: null,
      };
    }

    const chunks = getFlatChunks(tasks, errors, flowMap, activityMap, true);
    const jobMap = new Map<string, Job>();
    const messages: ChatMessage[] = [];

    let prevAssistantMessage: MessageFromAssistant = {
      role: "assistant",
      chunks: [],
    };
    let lastDetail: ActiveDetail | null = null;
    for (const chunk of chunks) {
      if (chunk.type === "job") {
        const job = chunk.job;
        jobMap.set(job.id, job);
        if (job.toolCall) {
          lastDetail = {
            type: "job",
            id: job.id,
          };
        }

        if (
          job.state === "completed" &&
          job.messages?.length &&
          job.messages.every((msg) => msg.role === "user")
        ) {
          if (prevAssistantMessage.chunks.length > 0) {
            messages.push(prevAssistantMessage);
          }
          messages.push({
            role: "user",
            content: job.messages
              .flatMap((msg) =>
                msg.parts.map((part) => (part.type === "text" ? part.text : ""))
              )
              .join(""),
            cmd: job.cmd,
            fromSkippedSubTask: chunk.fromSkippedSubTask,
          });
          prevAssistantMessage = {
            role: "assistant",
            chunks: [],
          };
        } else {
          prevAssistantMessage.chunks.push(chunk);
        }

        if (job.humanAction) {
          if (prevAssistantMessage.chunks.length > 0) {
            messages.push(prevAssistantMessage);
          }
          if (showHumanActions) {
            messages.push({
              role: "user",
              content: job.humanAction,
            });
          }
          prevAssistantMessage = {
            role: "assistant",
            chunks: [],
          };
        }
      } else {
        prevAssistantMessage.chunks.push(chunk);
        if (chunk.type !== "error") {
          lastDetail = {
            type: chunk.type,
            id: chunk.task.id,
          };
        }
      }
    }

    let shouldAppendMessage = messages.length > 0;
    if (
      shouldAppendMessage &&
      prevAssistantMessage.role === "assistant" &&
      prevAssistantMessage.chunks.length === 0
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user" && lastMessage.fromSkippedSubTask) {
        shouldAppendMessage = false;
      }
    }

    if (shouldAppendMessage) {
      messages.push(prevAssistantMessage);
    }

    return { messages, jobMap, lastDetail };
  }, [
    conversationAvailable,
    tasks,
    flowMap,
    activityMap,
    errors,
    showHumanActions,
  ]);
}
