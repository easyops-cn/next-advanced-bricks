// istanbul ignore file: experimental
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getBasePath, getRuntime } from "@next-core/runtime";
import classNames from "classnames";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import { preloadHighlighter } from "@next-shared/markdown";
import { useConversationDetail } from "../cruise-canvas/useConversationDetail.js";
import { useConversationStream } from "./useConversationStream.js";
import {
  WrappedIcon,
  WrappedIconButton,
  WrappedNoticeDropdown,
} from "../shared/bricks.js";
import { UserMessage } from "./UserMessage/UserMessage.js";
import { AssistantMessage } from "./AssistantMessage/AssistantMessage.js";
import { TaskContext } from "../shared/TaskContext.js";
import { ChatBox } from "../shared/ChatBox/ChatBox.js";
import { DONE_STATES, ICON_CANVAS } from "../shared/constants.js";
import { ExpandedView } from "../shared/ExpandedView/ExpandedView.js";
import { Aside } from "./Aside/Aside.js";
import { StreamContext } from "./StreamContext.js";
import type { FeedbackDetail } from "../cruise-canvas/interfaces.js";
import { NodeFeedback } from "../shared/NodeFeedback/NodeFeedback.js";
import type { ChatStreamProps, ChatStreamRef, ConversationDetail } from ".";
import styles from "./styles.module.css";
import toolbarStyles from "../cruise-canvas/toolbar.module.css";
import { K, t } from "./i18n.js";
import { NodeReplay } from "../cruise-canvas/NodeReplay/NodeReplay.js";
import type {
  ActiveDetail,
  ActiveImages,
  ExtraChatPayload,
  FileInfo,
  NoticeItem,
} from "../shared/interfaces.js";
import { useFlowAndActivityMap } from "../shared/useFlowAndActivityMap.js";
import { useFulfilledActiveDetail } from "../shared/useFulfilledActiveDetail.js";
import { useAutoScroll } from "./useAutoScroll.js";
import scrollStyles from "./ScrollDownButton.module.css";
import floatingStyles from "../shared/FloatingButton.module.css";
import { PlanProgress } from "../shared/PlanProgress/PlanProgress.js";
import { useServiceFlowPlan } from "../shared/useServiceFlowPlan.js";
import { FilePreview } from "../shared/FilePreview/FilePreview.js";
import { ImagesPreview } from "../shared/FilePreview/ImagesPreview.js";

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
  onMarkNoticesRead: () => void;
  onNoticeClick: (item: NoticeItem) => void;
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
    showCases,
    showNoticeIcon,
    exampleProjects,
    notices,
    tryItOutUrl,
    uploadOptions,
    onShare,
    onTerminate,
    onSubmitFeedback,
    onSwitchToCanvas,
    onFeedbackOnView,
    onDetailChange,
    onMarkNoticesRead,
    onNoticeClick,
  }: ChatStreamComponentProps,
  ref: React.Ref<ChatStreamRef>
) {
  const {
    conversation,
    tasks,
    serviceFlows,
    errors,
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
  const plan = useServiceFlowPlan(serviceFlows, tasks);
  const { flowMap, activityMap } = useFlowAndActivityMap(serviceFlows);
  const { messages, jobMap, lastDetail } = useConversationStream(
    !!conversation,
    conversation?.state,
    tasks,
    errors,
    flowMap,
    activityMap,
    { showHumanActions, skipActivitySubTasks: true }
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

  const [activeDetail, setActiveDetail] = useState<ActiveDetail | null>(null);
  const [subActiveDetail, setSubActiveDetail] = useState<ActiveDetail | null>(
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
    if (delayRef.current && lastDetail && !userClosedAside) {
      setActiveDetail(lastDetail);
    }
  }, [lastDetail, userClosedAside]);

  useEffect(() => {
    getRuntime().applyPageTitle(pageTitle);
  }, [pageTitle]);

  const humanInput = useCallback(
    (input: string | null, action?: string, extra?: ExtraChatPayload) => {
      humanInputRef.current?.(input, action, extra);
    },
    [humanInputRef]
  );

  const requirementMessage = messages[0];
  const userInput = useMemo(() => {
    if (requirementMessage?.role === "user") {
      return requirementMessage.content;
    }
  }, [requirementMessage]);

  const [activeImages, setActiveImages] = useState<ActiveImages | null>(null);

  const workspace = conversationId;
  const [activeFile, setActiveFile] = useState<FileInfo | null>(null);
  const taskContextValue = useMemo(
    () => ({
      conversationId,
      conversationState,
      tasks,
      errors,
      workspace,
      previewUrlTemplate,
      replay,
      showCases,
      exampleProjects,
      uploadOptions,

      humanInput,
      onShare,
      onTerminate,
      supports,

      activeExpandedViewJobId,
      setActiveExpandedViewJobId,
      activeDetail,
      setActiveDetail,
      subActiveDetail,
      setSubActiveDetail,

      submittingFeedback,
      submittedFeedback,
      onSubmitFeedback: handleSubmitFeedback,
      setShowFeedback,
      showFeedbackOnView,
      onFeedbackOnView,
      feedbackDoneViews,

      skipToResults,
      watchAgain,
      tryItOut() {
        const win = window.open(
          `${getBasePath().slice(0, -1)}${tryItOutUrl ?? "/elevo"}`,
          "_blank"
        );
        if (win) {
          win.__elevo_try_it_out = {
            content: userInput,
          };
        }
      },
      setActiveFile,
      activeImages,
      setActiveImages,
    }),
    [
      conversationId,
      conversationState,
      tasks,
      errors,
      workspace,
      previewUrlTemplate,
      replay,
      showCases,
      exampleProjects,
      uploadOptions,

      humanInput,
      onShare,
      onTerminate,
      supports,

      activeExpandedViewJobId,
      activeDetail,
      subActiveDetail,

      submittingFeedback,
      submittedFeedback,
      handleSubmitFeedback,
      showFeedbackOnView,
      onFeedbackOnView,
      feedbackDoneViews,

      skipToResults,
      watchAgain,
      userInput,
      tryItOutUrl,
      activeImages,
    ]
  );

  const streamContextValue = useMemo(
    () => ({
      lastDetail,
      setUserClosedAside,
    }),
    [lastDetail]
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const { scrollable, scrollToBottom } = useAutoScroll(
    conversationAvailable,
    scrollContainerRef,
    scrollContentRef
  );

  const fulfilledActiveDetail = useFulfilledActiveDetail(
    activeDetail,
    jobMap,
    flowMap,
    activityMap
  );

  const fulfilledSubActiveDetail = useFulfilledActiveDetail(
    subActiveDetail,
    jobMap,
    flowMap,
    activityMap
  );

  const [depsReady, setDepsReady] = useState(false);
  useEffect(() => {
    let ignore = false;
    Promise.race([
      preloadHighlighter("light-plus"),
      // Wait at most 5s
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]).finally(() => {
      if (!ignore) {
        setDepsReady(true);
      }
    });
    return () => {
      ignore = true;
    };
  }, []);

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
              {showNoticeIcon && (
                <WrappedNoticeDropdown
                  dataSource={notices}
                  dropdownContentStyle={{ minWidth: 300 }}
                  hideNotifyCenterButton={true}
                  urlTarget="_blank"
                  urlTemplate="/elevo/conv/{{extInfo.conversationId}}"
                  onNoticeClick={(e) => onNoticeClick(e.detail)}
                  onMarkAllRead={onMarkNoticesRead}
                />
              )}

              <WrappedIconButton
                icon={ICON_SHARE}
                variant="mini"
                onClick={onShare}
              />
            </div>
          </div>
          {conversationAvailable && depsReady ? (
            <>
              <div className={styles.main} ref={scrollContainerRef}>
                <div className={styles.narrow} ref={scrollContentRef}>
                  {messages.map((msg, index, list) => (
                    <div className={styles.message} key={index}>
                      {msg.role === "user" ? (
                        <UserMessage
                          content={msg.content}
                          cmd={msg.cmd}
                          mentionedAiEmployeeId={msg.mentionedAiEmployeeId}
                          files={msg.files}
                        />
                      ) : (
                        <AssistantMessage
                          chunks={msg.chunks}
                          scopeState={conversationState}
                          isLatest={index === list.length - 1}
                        />
                      )}
                    </div>
                  ))}
                  {replay
                    ? conversation?.finished && (
                        <>
                          <PlanProgress
                            plan={plan}
                            conversationState={conversationState}
                            style={{ marginTop: 14 }}
                          />
                          <NodeReplay finished ui="chat" />
                        </>
                      )
                    : showFeedback &&
                      (conversationState === "completed" ||
                        (conversationState === "failed" &&
                          showFeedbackAfterFailed)) &&
                      tasks.length > 0 && (
                        <NodeFeedback className={styles.feedback} />
                      )}
                </div>
              </div>
              <button
                className={`${scrollStyles["scroll-down"]} ${floatingStyles["floating-button"]}`}
                hidden={!scrollable}
                onClick={scrollToBottom}
              >
                <WrappedIcon lib="antd" icon="down" />
              </button>
              {(replay ? !conversation?.finished : supports?.chat) ? (
                <div className={styles.footer}>
                  <div className={styles.narrow}>
                    <PlanProgress
                      plan={plan}
                      conversationState={conversationState}
                    />
                    {replay ? (
                      <NodeReplay />
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
        {
          <div
            className={classNames(styles.aside, {
              [styles.expanded]: !!fulfilledActiveDetail,
            })}
          >
            {fulfilledActiveDetail && (
              <Aside
                detail={fulfilledActiveDetail}
                faded={!!fulfilledSubActiveDetail}
              />
            )}
            {fulfilledSubActiveDetail && (
              <Aside detail={fulfilledSubActiveDetail} isSubTask />
            )}
          </div>
        }
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
        {activeFile && <FilePreview file={activeFile} />}
        {activeImages && <ImagesPreview images={activeImages} />}
      </StreamContext.Provider>
    </TaskContext.Provider>
  );
}
