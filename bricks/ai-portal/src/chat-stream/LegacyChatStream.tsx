// istanbul ignore file: experimental
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getRuntime, handleHttpError } from "@next-core/runtime";
import ResizeObserver from "resize-observer-polyfill";
import classNames from "classnames";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { useTaskDetail } from "../cruise-canvas/useTaskDetail.js";
import { useTaskStream } from "./useTaskStream.js";
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
import type { ChatStreamProps, ChatStreamRef } from ".";
import styles from "./styles.module.css";

const ICON_SHARE: GeneralIconProps = {
  lib: "easyops",
  icon: "share",
};

interface ChatStreamComponentProps extends ChatStreamProps {
  onShare: () => void;
  onTerminate: () => void;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  onSwitchToCanvas: () => void;
  onFeedbackOnView: (viewId: string) => void;
}

export function LegacyChatStreamComponent(
  {
    taskId,
    replay,
    replayDelay,
    supports,
    showFeedback: propShowFeedback,
    showFeedbackAfterFailed,
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
  const { messages, lastToolCallJobId } = useTaskStream(task, jobs);

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
    (jobId: string, input: string | null) => {
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
                  {showFeedback &&
                    (taskState === "completed" ||
                      (taskState === "failed" && showFeedbackAfterFailed)) && (
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
                  <ChatBox state={taskState} canChat={false} />
                )}
              </div>
            </div>
          ) : null}
        </div>
        <div
          className={classNames(styles.aside, {
            [styles.expanded]: !!activeToolCallJob,
          })}
        >
          {activeToolCallJob && <Aside job={activeToolCallJob!} />}
        </div>
        {activeExpandedViewJobId && <ExpandedView views={views!} />}
      </StreamContext.Provider>
    </TaskContext.Provider>
  );
}
