// istanbul ignore file: experimental
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getRuntime } from "@next-core/runtime";
import ResizeObserver from "resize-observer-polyfill";
import classNames from "classnames";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { useConversationDetail } from "../cruise-canvas/useConversationDetail.js";
import { useConversationStream } from "./useConversationStream.js";
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
import type { ChatStreamProps, ChatStreamRef, ConversationDetail } from ".";
import styles from "./styles.module.css";
import toolbarStyles from "../cruise-canvas/toolbar.module.css";
import { K, t } from "./i18n.js";

const ICON_SHARE: GeneralIconProps = {
  lib: "easyops",
  icon: "share",
};

interface ChatStreamComponentProps extends ChatStreamProps {
  conversationId: string;
  onShare: () => void;
  onTerminate: () => void;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  onSwitchToCanvas: () => void;
  onFeedbackOnView: (viewId: string) => void;
  onDetailChange: (detail: ConversationDetail) => void;
}

export function ChatStreamComponent(
  {
    conversationId,
    initialRequest,
    replay,
    replayDelay,
    supports,
    showHumanActions,
    showFeedback: propShowFeedback,
    showFeedbackAfterFailed,
    showFeedbackOnView,
    showUiSwitch,
    previewUrlTemplate,
    onShare,
    onTerminate,
    onSubmitFeedback,
    onSwitchToCanvas,
    onFeedbackOnView,
    onDetailChange,
  }: ChatStreamComponentProps,
  ref: React.Ref<ChatStreamRef>
) {
  const {
    conversation,
    tasks,
    error,
    humanInputRef,
    skipToResults,
    watchAgain,
  } = useConversationDetail(
    conversationId,
    initialRequest,
    replay,
    replayDelay
  );
  const pageTitle = conversation?.title ?? "";
  const conversationState = conversation?.state;
  const conversationDone = DONE_STATES.includes(conversationState!);
  const canChat = conversationDone || conversationState === "input-required";
  const { messages, jobMap, lastToolCallJobId } = useConversationStream(
    conversation,
    tasks,
    error,
    { showHumanActions }
  );

  useEffect(() => {
    onDetailChange({
      projectId: conversation?.projectId,
    });
  }, [onDetailChange, conversation?.projectId]);

  const views = useMemo(() => {
    if (!jobMap) {
      return [];
    }
    return [...jobMap.values()].flatMap((job) =>
      job.generatedView
        ? {
            id: job.id,
            view: job.generatedView,
          }
        : []
    );
  }, [jobMap]);

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
    []
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

  const conversationAvailable = !!conversation;
  useEffect(() => {
    if (conversationAvailable) {
      const timer = setTimeout(() => {
        delayRef.current = true;
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [conversationAvailable]);

  useEffect(() => {
    if (delayRef.current && lastToolCallJobId && !userClosedAside) {
      setActiveToolCallJobId(lastToolCallJobId);
    }
  }, [lastToolCallJobId, userClosedAside]);

  useEffect(() => {
    getRuntime().applyPageTitle(pageTitle);
  }, [pageTitle]);

  const humanInput = useCallback(
    (jobId: string, input: string | null, action?: string) => {
      humanInputRef.current?.(jobId, input, action);
    },
    [humanInputRef]
  );

  const workspace = conversation?.id;

  const taskContextValue = useMemo(
    () => ({
      conversationId,
      workspace,
      previewUrlTemplate,
      replay,

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
      conversationId,
      workspace,
      previewUrlTemplate,
      replay,

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
  }, [conversationAvailable]);

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
    return jobMap?.get(activeToolCallJobId) || null;
  }, [activeToolCallJobId, jobMap]);

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
                  className={styles["navbar-switch-ui"]}
                  icon={ICON_CANVAS}
                  variant="mini"
                  title={t(K.SWITCH_TO_CANVAS)}
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
          {conversationAvailable ? (
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
                          taskState={conversationState}
                          error={msg.error}
                          isLatest={index === list.length - 1}
                        />
                      )}
                    </div>
                  ))}
                  {showFeedback &&
                    (conversationState === "completed" ||
                      (conversationState === "failed" &&
                        showFeedbackAfterFailed)) && (
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
              {replay || supports?.chat ? (
                <div className={styles.footer}>
                  <div className={styles.narrow}>
                    {replay ? (
                      <ReplayToolbar
                        taskDone={conversationDone}
                        skipToResults={skipToResults}
                        watchAgain={watchAgain}
                      />
                    ) : (
                      <ChatBox state={conversationState} canChat={canChat} />
                    )}
                  </div>
                </div>
              ) : null}
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
        </div>
        <div
          className={classNames(styles.aside, {
            [styles.expanded]: !!activeToolCallJob,
          })}
        >
          {activeToolCallJob && <Aside job={activeToolCallJob!} />}
        </div>
        {activeExpandedViewJobId && <ExpandedView views={views!} />}
        {showUiSwitch && (
          <div className={classNames(toolbarStyles.toolbar, styles.toolbar)}>
            <WrappedIconButton
              icon={ICON_CANVAS}
              variant="mini"
              title={t(K.SWITCH_TO_CANVAS)}
              onClick={onSwitchToCanvas}
            />
          </div>
        )}
      </StreamContext.Provider>
    </TaskContext.Provider>
  );
}
