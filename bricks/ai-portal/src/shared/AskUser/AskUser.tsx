import React, { useContext } from "react";
import { initializeI18n } from "@next-core/i18n";
import type { Job, Task } from "../interfaces";
import styles from "./AskUser.module.css";
import { useConversationStream } from "../../chat-stream/useConversationStream";
import { TaskContext } from "../TaskContext";
import { UserMessage } from "../../chat-stream/UserMessage/UserMessage";
import { AssistantMessage } from "../../chat-stream/AssistantMessage/AssistantMessage";
import { DONE_STATES } from "../constants";
import { ChatBox } from "../ChatBox/ChatBox";
import { K, locales, NS, t } from "./i18n";
import { WrappedIcon } from "../bricks";
import { StreamContext } from "../../chat-stream/StreamContext";

initializeI18n(NS, locales);

export interface AskUserProps {
  task: Task | undefined;
  parentJob: Job | undefined;
  parentTask: Task;
}

export function AskUser({ task, parentJob, parentTask }: AskUserProps) {
  const {
    conversationState,
    tasks,
    errors,
    finished,
    earlyFinished,
    replay,
    activityMap,
  } = useContext(TaskContext);
  const { planMap } = useContext(StreamContext);
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
  if (done) {
    return null;
  }

  const stepName =
    activityMap?.get(parentTask.id)?.activity.name ??
    (parentJob ? planMap?.get(parentJob.id)?.name : undefined);

  return (
    <div className={styles.container}>
      <div className={styles.tips}>
        <WrappedIcon lib="antd" icon="info-circle" theme="filled" />
        {t(K.ASK_USER_TIPS, { name: stepName })}
      </div>
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
