// istanbul ignore file: experimental
import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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
import { DONE_STATES, ICON_CANVAS } from "../shared/constants.js";
import { ExpandedView } from "../shared/ExpandedView/ExpandedView.js";
import { ReplayToolbar } from "../shared/ReplayToolbar/ReplayToolbar.js";
import { Aside } from "./Aside/Aside.js";
import { StreamContext } from "./StreamContext.js";
import type { FeedbackDetail } from "../cruise-canvas/interfaces.js";
import { NodeFeedback } from "../shared/NodeFeedback/NodeFeedback.js";

initializeI18n(NS, locales);

const ICON_SHARE: GeneralIconProps = {
  lib: "easyops",
  icon: "share",
};

const { defineElement, property, event, method } = createDecorators();

export interface ChatStreamProps {
  taskId?: string;
  replay?: boolean;
  replayDelay?: number;
  supports?: Record<string, boolean>;
  showFeedback?: boolean;
  showFeedbackOnView?: boolean;
  showUiSwitch?: boolean;
}

const ChatStreamComponent = forwardRef(LegacyChatStreamComponent);

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

  @property({ type: Boolean })
  accessor showFeedback: boolean | undefined;

  @property({ type: Boolean })
  accessor showFeedbackOnView: boolean | undefined;

  @property({ type: Boolean })
  accessor showUiSwitch: boolean | undefined;

  @property({ type: Boolean, render: false })
  accessor hideMermaid: boolean | undefined;

  @event({ type: "share" })
  accessor #shareEvent!: EventEmitter<void>;

  #onShare = () => {
    this.#shareEvent.emit();
  };

  @event({ type: "terminate" })
  accessor #terminateEvent!: EventEmitter<void>;

  #onTerminate = () => {
    this.#terminateEvent.emit();
  };

  @event({ type: "feedback.submit" })
  accessor #feedbackSubmitEvent!: EventEmitter<FeedbackDetail>;

  #onSubmitFeedback = (detail: FeedbackDetail) => {
    this.#feedbackSubmitEvent.emit(detail);
  };

  @event({ type: "feedback.on.view" })
  accessor #feedbackOnViewEvent!: EventEmitter<string>;

  #onFeedbackOnView = (viewId: string) => {
    this.#feedbackOnViewEvent.emit(viewId);
  };

  @event({ type: "ui.switch" })
  accessor #switch!: EventEmitter<"canvas">;

  #onSwitchToCanvas = () => {
    this.#switch.emit("canvas");
  };

  #ref = createRef<ChatStreamRef>();

  @method()
  resumed() {
    this.#ref.current?.resumed();
  }

  @method()
  feedbackSubmitDone() {
    this.#ref.current?.feedbackSubmitDone();
  }

  @method()
  feedbackSubmitFailed() {
    this.#ref.current?.feedbackSubmitFailed();
  }

  @method()
  feedbackOnViewDone(viewId: string) {
    this.#ref.current?.feedbackOnViewDone(viewId);
  }

  render() {
    return (
      <ChatStreamComponent
        taskId={this.taskId}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        showFeedback={this.showFeedback}
        showFeedbackOnView={this.showFeedbackOnView}
        showUiSwitch={this.showUiSwitch}
        onShare={this.#onShare}
        onTerminate={this.#onTerminate}
        onSubmitFeedback={this.#onSubmitFeedback}
        onSwitchToCanvas={this.#onSwitchToCanvas}
        onFeedbackOnView={this.#onFeedbackOnView}
      />
    );
  }
}

interface ChatStreamComponentProps extends ChatStreamProps {
  onShare: () => void;
  onTerminate: () => void;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  onSwitchToCanvas: () => void;
  onFeedbackOnView: (viewId: string) => void;
}

interface ChatStreamRef {
  resumed: () => void;
  feedbackSubmitDone: () => void;
  feedbackSubmitFailed: () => void;
  feedbackOnViewDone: (viewId: string) => void;
}

function LegacyChatStreamComponent(
  {
    taskId,
    replay,
    replayDelay,
    supports,
    showFeedback: propShowFeedback,
    showFeedbackOnView,
    showUiSwitch,
    onShare,
    onTerminate,
    onSubmitFeedback,
    onSwitchToCanvas,
    onFeedbackOnView,
  }: ChatStreamComponentProps,
  ref: React.Ref<ChatStreamRef>
) {
  const {
    task,
    jobs,
    error,
    humanInputRef,
    resumedRef,
    skipToResults,
    watchAgain,
  } = useTaskDetail(taskId, replay, replayDelay);
  const pageTitle = task?.title ?? "";
  const taskState = task?.state;
  const taskDone = DONE_STATES.includes(taskState!);
  const { messages, inputRequiredJobId, lastToolCallJobId } = useChatStream(
    task,
    jobs
  );

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

  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(!!propShowFeedback);
  useEffect(() => {
    setShowFeedback(!!propShowFeedback);
  }, [propShowFeedback]);
  const [feedbackDoneViews, setFeedbackDoneViews] = useState<
    Set<string> | undefined
  >();

  const handleSubmitFeedback = useCallback(
    (detail: FeedbackDetail) => {
      setSubmittingFeedback(true);
      onSubmitFeedback(detail);
    },
    [onSubmitFeedback]
  );

  useImperativeHandle(
    ref,
    () => ({
      resumed: () => resumedRef.current?.(),
      feedbackSubmitDone: () => {
        setSubmittedFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
        }, 3000);
      },
      feedbackSubmitFailed: () => {
        setSubmittingFeedback(false);
      },
      feedbackOnViewDone: (viewId: string) => {
        setFeedbackDoneViews((prev) => {
          const newSet = new Set(prev);
          newSet.add(viewId);
          return newSet;
        });
      },
    }),
    [resumedRef]
  );

  const [activeExpandedViewJobId, setActiveExpandedViewJobId] = useState<
    string | null
  >(null);

  const [activeToolCallJobId, setActiveToolCallJobId] = useState<string | null>(
    null
  );
  const [userClosedAside, setUserClosedAside] = useState(false);
  // Delay flag to prevent aside from auto opened for a completed task
  const delayRef = useRef(false);

  const taskAvailable = !!task;
  useEffect(() => {
    if (taskAvailable) {
      const timer = setTimeout(() => {
        delayRef.current = true;
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [taskAvailable]);

  useEffect(() => {
    if (delayRef.current && lastToolCallJobId && !userClosedAside) {
      setActiveToolCallJobId(lastToolCallJobId);
    }
  }, [lastToolCallJobId, userClosedAside]);

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
      onTerminate,
      supports,

      activeExpandedViewJobId,
      setActiveExpandedViewJobId,
      activeToolCallJobId,
      setActiveToolCallJobId,

      submittingFeedback,
      submittedFeedback,
      onSubmitFeedback: handleSubmitFeedback,
      setShowFeedback,
      showFeedbackOnView,
      onFeedbackOnView,
      feedbackDoneViews,
    }),
    [
      humanInput,
      onShare,
      onTerminate,
      supports,

      activeExpandedViewJobId,
      activeToolCallJobId,

      submittingFeedback,
      submittedFeedback,
      handleSubmitFeedback,
      showFeedbackOnView,
      onFeedbackOnView,
      feedbackDoneViews,
    ]
  );

  const streamContextValue = useMemo(
    () => ({
      lastToolCallJobId,
      setUserClosedAside,
    }),
    [lastToolCallJobId]
  );

  const detectScrolledUpRef = useRef(false);
  const manualScrolledRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const contentContainer = scrollContainer?.firstElementChild;
    if (manualScrolledRef.current || !scrollContainer || !contentContainer) {
      return;
    }

    const handleScroll = () => {
      setScrollable(
        scrollContainer.scrollTop + scrollContainer.clientHeight! + 24 <
          scrollContainer.scrollHeight
      );
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

  const scrollToBottom = useCallback(() => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.scrollTo({
      top: scrollContainer?.scrollHeight,
      behavior: "instant",
    });
  }, []);

  const activeToolCallJob = useMemo(() => {
    if (!activeToolCallJobId) {
      return null;
    }
    return jobs?.find((job) => job.id === activeToolCallJobId);
  }, [activeToolCallJobId, jobs]);

  return (
    <TaskContext.Provider value={taskContextValue}>
      <StreamContext.Provider value={streamContextValue}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.left} />
            <h1>{pageTitle}</h1>
            <div className={styles.right}>
              {showUiSwitch && (
                <WrappedIconButton
                  icon={ICON_CANVAS}
                  variant="mini"
                  style={{
                    transform: "rotate(90deg)",
                  }}
                  onClick={onSwitchToCanvas}
                />
              )}
              <WrappedIconButton
                icon={ICON_SHARE}
                variant="mini"
                onClick={onShare}
              />
            </div>
          </div>
          {taskAvailable ? (
            <>
              <div className={styles.main} ref={scrollContainerRef}>
                <div className={styles.narrow}>
                  {messages.map((msg, index, list) => (
                    <div className={styles.message} key={index}>
                      {msg.role === "user" ? (
                        <UserMessage content={msg.content} />
                      ) : (
                        <AssistantMessage
                          jobs={msg.jobs}
                          taskState={taskState}
                          isLatest={index === list.length - 1}
                        />
                      )}
                    </div>
                  ))}
                  {showFeedback && taskState === "completed" && (
                    <NodeFeedback className={styles.feedback} />
                  )}
                </div>
              </div>
              <div
                className={styles["scroll-down"]}
                hidden={!scrollable}
                onClick={scrollToBottom}
              >
                <WrappedIcon lib="antd" icon="down" />
              </div>
            </>
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
                  <ChatBox
                    state={taskState}
                    canChat={taskDone && !!inputRequiredJobId}
                    inputRequiredJobId={inputRequiredJobId}
                  />
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
      </StreamContext.Provider>
    </TaskContext.Provider>
  );
}
