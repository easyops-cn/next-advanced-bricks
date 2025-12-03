import { useMemo } from "react";
import type { ChatMessage, MessageFromAssistant } from "./interfaces.js";
import type {
  ActiveDetail,
  ActivityWithFlow,
  ConversationError,
  ConversationState,
  ServiceFlowRun,
  Task,
  TaskState,
} from "../shared/interfaces.js";
import { getFlatChunks } from "../shared/getFlatChunks.js";
import { DONE_STATES } from "../shared/constants.js";

export interface UseConversationStreamOptions {
  flowMap?: Map<string, ServiceFlowRun>;
  activityMap?: Map<string, ActivityWithFlow>;
  showHumanActions?: boolean;
  skipActivitySubTasks?: boolean;
  rootTaskId?: string;
}

export function useConversationStream(
  conversationAvailable: boolean,
  state: ConversationState | TaskState | undefined,
  tasks: Task[],
  errors: ConversationError[],
  options?: UseConversationStreamOptions
) {
  const {
    showHumanActions,
    skipActivitySubTasks,
    rootTaskId,
    flowMap,
    activityMap,
  } = options || {};

  return useMemo(() => {
    if (!conversationAvailable) {
      return {
        messages: [],
        lastDetail: null,
        activeAskUser: null,
      };
    }

    const { chunks, jobMap, activeAskUser } = getFlatChunks(tasks, errors, {
      flowMap,
      activityMap,
      skipActivitySubTasks,
      enablePlan: true,
      rootTaskId,
    });
    const messages: ChatMessage[] = [];

    let prevAssistantMessage: MessageFromAssistant = {
      role: "assistant",
      chunks: [],
    };
    let lastDetail: ActiveDetail | null = null;
    for (const chunk of chunks) {
      if (chunk.type === "job") {
        const job = chunk.job;
        if (job.toolCall && !job.ignoreDetails) {
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
            mentionedAiEmployeeId: job.mentionedAiEmployeeId,
            fromSkippedSubTask: chunk.fromSkippedSubTask,
            files: job.messages
              ?.filter((msg) => msg.role === "user")
              .flatMap((msg) => msg.parts)
              .filter((part) => part.type === "file")
              .map((part) => part.file),
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
        if (
          chunk.type !== "error" &&
          chunk.type !== "plan" &&
          chunk.type !== "askUser"
        ) {
          lastDetail = {
            type: chunk.type,
            id: chunk.task.id,
          };
        }
      }
    }

    let shouldAppendEmptyMessage =
      messages.length > 0 && !DONE_STATES.includes(state);
    if (
      shouldAppendEmptyMessage &&
      prevAssistantMessage.role === "assistant" &&
      prevAssistantMessage.chunks.length === 0
    ) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "user" && lastMessage.fromSkippedSubTask) {
        shouldAppendEmptyMessage = false;
      }
    }

    if (prevAssistantMessage.chunks.length > 0 || shouldAppendEmptyMessage) {
      messages.push(prevAssistantMessage);
    }

    return { messages, jobMap, lastDetail, activeAskUser };
  }, [
    conversationAvailable,
    state,
    tasks,
    flowMap,
    activityMap,
    errors,
    showHumanActions,
    skipActivitySubTasks,
    rootTaskId,
  ]);
}
