import React, { useContext } from "react";
import type { Task } from "../interfaces";
import styles from "./AskUser.module.css";
import { useConversationStream } from "../../chat-stream/useConversationStream";
import { TaskContext } from "../TaskContext";
import { UserMessage } from "../../chat-stream/UserMessage/UserMessage";
import { AssistantMessage } from "../../chat-stream/AssistantMessage/AssistantMessage";
import { DONE_STATES } from "../constants";
import { ChatBox } from "../ChatBox/ChatBox";

export interface AskUserProps {
  task: Task | undefined;
}

export function AskUser({ task }: AskUserProps) {
  const { conversationState, tasks, errors, finished, earlyFinished, replay } =
    useContext(TaskContext);
  const canChat =
    DONE_STATES.includes(conversationState) ||
    conversationState === "input-required";

  const { messages } = useConversationStream(
    !!task,
    task?.state,
    tasks,
    errors,
    {
      skipActivitySubTasks: true,
      rootTaskId: task?.id,
    }
  );

  const done = DONE_STATES.includes(task?.state);
  if (!done) {
    return null;
  }

  return (
    <div className={styles.container}>
      {messages.map((msg, index, list) => (
        <div className={styles.message} key={index}>
          {msg.role === "user" ? (
            <UserMessage content={msg.content} files={msg.files} />
          ) : (
            <AssistantMessage
              chunks={msg.chunks}
              scopeState={task?.state}
              isLatest={index === list.length - 1 && !earlyFinished}
              finished={finished}
            />
          )}
        </div>
      ))}
      {!replay && (
        <ChatBox
          state={conversationState}
          canChat={canChat}
          showInput="always"
          className={styles.input}
        />
      )}
    </div>
  );
}
