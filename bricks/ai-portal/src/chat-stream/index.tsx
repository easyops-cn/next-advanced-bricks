// istanbul ignore file: experimental
import React, { useEffect } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
// import { initializeI18n } from "@next-core/i18n";
import { getRuntime, handleHttpError } from "@next-core/runtime";
// import { K, NS, locales, t } from "./i18n.js";
import { useTaskDetail } from "../cruise-canvas/useTaskDetail.js";
import { useChatStream } from "./useChatStream.js";
import styles from "./styles.module.css";
import { WrappedIcon } from "../cruise-canvas/bricks.js";
import { UserMessage } from "./UserMessage/UserMessage.js";
import { AssistantMessage } from "./AssistantMessage/AssistantMessage.js";

// initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

export interface ChatStreamProps {
  taskId?: string;
  replay?: boolean;
  replayDelay?: number;
  supports?: Record<string, boolean>;
}

/**
 * 构件 `ai-portal.chat-stream`
 */
export
@defineElement("ai-portal.chat-stream", {
  // Will wrap v2 bricks which don't support in shadow DOM.
  shadowOptions: false,
})
class ChatStream extends ReactNextElement implements ChatStreamProps {
  @property()
  accessor taskId: string | undefined;

  /** 是否启用回放。仅初始设置有效。 */
  @property({ type: Boolean })
  accessor replay: boolean | undefined;

  /**
   * 设置回放时消息之间的时间间隔，单位为秒。仅初始设置有效。
   *
   * @default 2
   */
  @property({ type: Number })
  accessor replayDelay: number | undefined;

  @property({ attribute: false })
  accessor supports: Record<string, boolean> | undefined;

  @event({ type: "share" })
  accessor #shareEvent!: EventEmitter<void>;

  #onShare = () => {
    this.#shareEvent.emit();
  };

  render() {
    return (
      <ChatStreamComponent
        taskId={this.taskId}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        onShare={this.#onShare}
      />
    );
  }
}

interface ChatStreamComponentProps extends ChatStreamProps {
  onShare: () => void;
}

function ChatStreamComponent({
  taskId,
  replay,
  replayDelay,
}: ChatStreamComponentProps) {
  const {
    task,
    jobs,
    error,
    // humanInputRef,
    // resumedRef,
    // skipToResults,
    // watchAgain,
  } = useTaskDetail(taskId, replay, replayDelay);
  const pageTitle = task?.title ?? "";
  const taskState = task?.state;
  const messages = useChatStream(task, jobs);

  useEffect(() => {
    getRuntime().applyPageTitle(pageTitle);
  }, [pageTitle]);

  useEffect(() => {
    if (error) {
      handleHttpError(error);
    }
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.header}>
          <h1>{pageTitle}</h1>
        </div>
        {task ? (
          <div className={styles.chat}>
            {messages?.map((msg, index) => (
              <div className={styles.message} key={index}>
                {msg.role === "user" ? (
                  <UserMessage content={msg.content} />
                ) : (
                  <AssistantMessage jobs={msg.jobs} taskState={taskState} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles["loading-icon"]}>
            <WrappedIcon
              lib="antd"
              theme="outlined"
              icon="loading-3-quarters"
              spinning
            />
          </div>
        )}
      </div>
    </div>
  );
}
