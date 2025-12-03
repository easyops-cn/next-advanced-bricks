import React, { useContext, useRef } from "react";
import styles from "./TaskApp.module.css";
import { WrappedIcon } from "../../../shared/bricks";
import type { Task } from "../../../shared/interfaces";
import { TaskContext } from "../../../shared/TaskContext";
import { useConversationStream } from "../../useConversationStream";
import { UserMessage } from "../../UserMessage/UserMessage";
import { AssistantMessage } from "../../AssistantMessage/AssistantMessage";
import { useAutoScroll } from "../../useAutoScroll";
import scrollStyles from "../../ScrollDownButton.module.css";
import floatingStyles from "../../../shared/FloatingButton.module.css";

export interface TaskAppProps {
  task: Task;
}

export function TaskApp({ task }: TaskAppProps) {
  const { tasks, errors, flowMap, activityMap } = useContext(TaskContext);
  const { messages } = useConversationStream(
    !!task,
    task.state,
    tasks,
    errors,
    {
      flowMap,
      activityMap,
      rootTaskId: task.id,
    }
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const { scrollable, scrollToBottom } = useAutoScroll(
    true,
    scrollContainerRef,
    scrollContentRef
  );

  return (
    <div className={styles.body}>
      <div className={styles.chat} ref={scrollContainerRef}>
        <div className={styles.messages} ref={scrollContentRef}>
          {messages.map((msg, index, list) => (
            <div className={styles.message} key={index}>
              {msg.role === "user" ? (
                <UserMessage
                  content={msg.content}
                  mentionedAiEmployeeId={msg.mentionedAiEmployeeId}
                  cmd={msg.cmd}
                  files={msg.files}
                />
              ) : (
                <AssistantMessage
                  chunks={msg.chunks}
                  scopeState={task.state}
                  isLatest={index === list.length - 1}
                  isSubTask
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <button
        className={`${scrollStyles["scroll-down"]} ${floatingStyles["floating-button"]}`}
        style={{ bottom: "30px" }}
        hidden={!scrollable}
        onClick={scrollToBottom}
      >
        <WrappedIcon lib="antd" icon="down" />
      </button>
    </div>
  );
}
