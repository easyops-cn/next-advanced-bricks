// istanbul ignore file: experimental
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { getRuntime, handleHttpError } from "@next-core/runtime";
import ResizeObserver from "resize-observer-polyfill";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import classNames from "classnames";
import { NS, locales } from "./i18n.js";
import { useTaskDetail } from "../cruise-canvas/useTaskDetail.js";
import { useChatStream } from "./useChatStream.js";
import styles from "./styles.module.css";
import { WrappedIcon, WrappedIconButton } from "../shared/bricks.js";
import { UserMessage } from "./UserMessage/UserMessage.js";
import { AssistantMessage } from "./AssistantMessage/AssistantMessage.js";
import { TaskContext } from "../shared/TaskContext.js";
import { ChatBox } from "../shared/ChatBox/ChatBox.js";
import { DONE_STATES } from "../shared/constants.js";
import { ExpandedView } from "../shared/ExpandedView/ExpandedView.js";
import { ReplayToolbar } from "../shared/ReplayToolbar/ReplayToolbar.js";
import { Aside } from "./Aside/Aside.js";

initializeI18n(NS, locales);

const ICON_SHARE: GeneralIconProps = {
  lib: "fa",
  prefix: "far",
  icon: "share-from-square",
};

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

  @event({ type: "pause" })
  accessor #pauseEvent!: EventEmitter<void>;

  #onPause = () => {
    this.#pauseEvent.emit();
  };

  @event({ type: "resume" })
  accessor #resumeEvent!: EventEmitter<void>;

  #onResume = () => {
    this.#resumeEvent.emit();
  };

  @event({ type: "cancel" })
  accessor #cancelEvent!: EventEmitter<void>;

  #onCancel = () => {
    this.#cancelEvent.emit();
  };

  render() {
    return (
      <ChatStreamComponent
        taskId={this.taskId}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        onShare={this.#onShare}
        onPause={this.#onPause}
        onResume={this.#onResume}
        onCancel={this.#onCancel}
      />
    );
  }
}

interface ChatStreamComponentProps extends ChatStreamProps {
  onShare: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

function ChatStreamComponent({
  taskId,
  replay,
  replayDelay,
  supports,
  onShare,
  onPause,
  onResume,
  onCancel,
}: ChatStreamComponentProps) {
  const {
    task,
    jobs,
    error,
    humanInputRef,
    // resumedRef,
    skipToResults,
    watchAgain,
  } = useTaskDetail(taskId, replay, replayDelay);
  const pageTitle = task?.title ?? "";
  const taskState = task?.state;
  const taskDone = DONE_STATES.includes(taskState ?? "working");
  const messages = useChatStream(task, jobs);

  const views = useMemo(() => {
    return jobs?.flatMap((job) =>
      job.generatedView
        ? {
            id: job.id,
            view: job.generatedView,
          }
        : []
    );
  }, [jobs]);

  const [activeExpandedViewJobId, setActiveExpandedViewJobId] = useState<
    string | null
  >(null);

  const [activeToolCallJobId, setActiveToolCallJobId] = useState<string | null>(
    null
  );

  useEffect(() => {
    getRuntime().applyPageTitle(pageTitle);
  }, [pageTitle]);

  useEffect(() => {
    if (error) {
      handleHttpError(error);
    }
  }, [error]);

  const humanInput = useCallback(
    (jobId: string, input: string) => {
      humanInputRef.current?.(jobId, input);
    },
    [humanInputRef]
  );

  const taskContextValue = useMemo(
    () => ({
      humanInput,
      onShare,
      onPause,
      onResume,
      onCancel,
      supports,
      activeExpandedViewJobId,
      setActiveExpandedViewJobId,
      activeToolCallJobId,
      setActiveToolCallJobId,
    }),
    [
      humanInput,
      onShare,
      onPause,
      onResume,
      onCancel,
      supports,
      activeExpandedViewJobId,
      activeToolCallJobId,
    ]
  );

  const detectScrolledUpRef = useRef(false);
  const manualScrolledRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const taskAvailable = !!task;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const contentContainer = scrollContainer?.firstElementChild;
    if (manualScrolledRef.current || !scrollContainer || !contentContainer) {
      return;
    }

    const handleScroll = () => {
      if (!detectScrolledUpRef.current) {
        return;
      }
      manualScrolledRef.current =
        scrollContainer.scrollTop + scrollContainer.clientHeight! + 6 <
        scrollContainer.scrollHeight;
    };
    scrollContainer.addEventListener("scroll", handleScroll);

    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      if (manualScrolledRef.current) {
        return;
      }
      detectScrolledUpRef.current = false;
      // Scroll to the bottom of the content container
      scrollContainer.scrollTo({
        top: contentContainer.scrollHeight,
        behavior: "instant",
      });
      clearTimeout(timer);
      timer = setTimeout(() => {
        detectScrolledUpRef.current = true;
      }, 100);
    });
    observer.observe(contentContainer);

    return () => {
      observer.disconnect();
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [taskAvailable]);

  const activeToolCallJob = useMemo(() => {
    if (!activeToolCallJobId) {
      return null;
    }
    return jobs?.find((job) => job.id === activeToolCallJobId);
  }, [activeToolCallJobId, jobs]);

  return (
    <TaskContext.Provider value={taskContextValue}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.left} />
          <h1>{pageTitle}</h1>
          <div className={styles.right}>
            <WrappedIconButton
              icon={ICON_SHARE}
              variant="mini"
              onClick={onShare}
            />
          </div>
        </div>
        {taskAvailable ? (
          <div className={styles.main} ref={scrollContainerRef}>
            <div className={styles.narrow}>
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
        {replay || supports?.chat ? (
          <div className={styles.footer}>
            <div className={styles.narrow}>
              {replay ? (
                <ReplayToolbar
                  taskDone={taskDone}
                  skipToResults={skipToResults}
                  watchAgain={watchAgain}
                />
              ) : (
                <ChatBox taskState={taskState} taskDone={taskDone} />
              )}
            </div>
          </div>
        ) : null}
      </div>
      <div
        className={classNames(styles.aside, {
          [styles.expanded]: !!activeToolCallJobId,
        })}
      >
        {activeToolCallJobId && <Aside job={activeToolCallJob!} />}
      </div>
      {activeExpandedViewJobId && <ExpandedView views={views!} />}
    </TaskContext.Provider>
  );
}
