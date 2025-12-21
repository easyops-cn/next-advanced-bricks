// istanbul ignore file
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { UseBrickConf } from "@next-core/types";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import styles from "./styles.module.css";
import type { ChatInput } from "../chat-input";
import type {
  ActiveImages,
  ChatPayload,
  ConversationPatch,
  ExtraChatPayload,
  FileInfo,
  RequestStore,
  UploadOptions,
} from "../shared/interfaces";
import { useConversationDetail } from "../cruise-canvas/useConversationDetail";
import { useConversationStream } from "../chat-stream/useConversationStream";
import { preloadHighlighter } from "@next-shared/markdown";
import { useAutoScroll } from "../chat-stream/useAutoScroll";
import { UserMessage } from "../chat-stream/UserMessage/UserMessage";
import { AssistantMessage } from "../chat-stream/AssistantMessage/AssistantMessage";
import scrollStyles from "../chat-stream/ScrollDownButton.module.css";
import floatingStyles from "../shared/FloatingButton.module.css";
import { DONE_STATES, NON_WORKING_STATES } from "../shared/constants";
import { WrappedChatInput, WrappedIcon } from "../shared/bricks";
import { TaskContext, type TaskContextValue } from "../shared/TaskContext";
import { StreamContext } from "../chat-stream/StreamContext";
import { FilePreview } from "../shared/FilePreview/FilePreview.js";
import { ImagesPreview } from "../shared/FilePreview/ImagesPreview.js";

export interface ChatPanelContentProps {
  conversationId: string | null;
  initialRequest: RequestStore | null;
  placeholder?: string;
  uploadOptions?: UploadOptions;
  help?: { useBrick: UseBrickConf };
  fromModal?: boolean;
  submitDisabled?: boolean;
  onChatSubmit: (payload: ChatPayload) => void;
  onData?: (data: ConversationPatch) => void;
}

export interface ChatPanelContentRef {
  setInputValue: (content: string) => void;
  focus: () => void;
  showFile: (file: FileInfo) => void;
}

export const ChatPanelContent = forwardRef<
  ChatPanelContentRef,
  ChatPanelContentProps
>(function ChatPanelContent(
  {
    conversationId,
    initialRequest,
    placeholder,
    uploadOptions,
    help,
    fromModal,
    submitDisabled,
    onChatSubmit,
    onData,
  },
  ref
) {
  const inputRef = useRef<ChatInput>(null);

  const [activeFile, setActiveFile] = useState<FileInfo | null>(null);
  const [activeImages, setActiveImages] = useState<ActiveImages | null>(null);

  const { conversation, tasks, errors, humanInputRef } = useConversationDetail(
    conversationId,
    initialRequest,
    undefined,
    undefined,
    onData
  );
  const conversationAvailable = !!conversation;
  const conversationState = conversation?.state;
  const conversationDone = DONE_STATES.includes(conversationState!);
  const conversationFinished = conversation?.finished;
  const earlyFinished =
    conversation?.finished &&
    conversation.mode !== "resume" &&
    !NON_WORKING_STATES.includes(conversationState!);

  const canChat =
    !conversationId ||
    conversationDone ||
    conversationState === "input-required";

  const { messages, jobMap } = useConversationStream(
    conversationAvailable,
    conversationState,
    tasks,
    errors,
    { showHumanActions: true, skipActivitySubTasks: true }
  );

  const humanInput = useCallback(
    (input: string | null, action?: string, extra?: ExtraChatPayload) => {
      humanInputRef.current?.(input, action, extra);
    },
    [humanInputRef]
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const { scrollable, scrollToBottom, toggleAutoScroll } = useAutoScroll(
    conversationAvailable && depsReady,
    scrollContainerRef,
    scrollContentRef
  );

  const handleChatSubmit = useCallback(
    async (payload: ChatPayload) => {
      if (conversationId) {
        const { content, ...extra } = payload;
        // For follow-up messages, do not pass aiEmployeeId and cmd again,
        // unless passed explicitly.
        humanInput(content, undefined, extra);
        return;
      }
      onChatSubmit(payload);
    },
    [conversationId, humanInput, onChatSubmit]
  );

  const taskContextValue = useMemo(
    () =>
      ({
        conversationState,
        finished: conversationFinished,
        earlyFinished,
        tasks,
        jobMap,
        errors,
        setActiveFile,
        setActiveImages,
        humanInput,
      }) as TaskContextValue,
    [
      conversationState,
      humanInput,
      jobMap,
      tasks,
      errors,
      conversationFinished,
      earlyFinished,
    ]
  );

  useImperativeHandle(
    ref,
    () => ({
      setInputValue: (content: string) => {
        inputRef.current?.setValue(content);
      },
      focus: () => {
        inputRef.current?.focus();
      },
      showFile: (file: FileInfo) => {
        setActiveFile(file);
      },
    }),
    []
  );

  const streamContextValue = useMemo(
    () => ({
      lastDetail: null,
      planMap: null,
      toggleAutoScroll,
      setUserClosedAside: () => {},
    }),
    [toggleAutoScroll]
  );

  return (
    <>
      <TaskContext.Provider value={taskContextValue}>
        <StreamContext.Provider value={streamContextValue}>
          <div className={styles.panel}>
            {!conversationId ? (
              <div className={styles.main}>
                <div className={styles.chat}>
                  <div className={styles.narrow}>
                    {help ? (
                      <ReactUseMultipleBricks useBrick={help.useBrick} />
                    ) : null}
                  </div>
                </div>
              </div>
            ) : conversationAvailable && depsReady ? (
              <div className={styles.main}>
                <div className={styles.chat} ref={scrollContainerRef}>
                  <div className={styles.narrow}>
                    <div className={styles.messages} ref={scrollContentRef}>
                      {messages.map((msg, index, list) => (
                        <div className={styles.message} key={index}>
                          {msg.role === "user" ? (
                            <UserMessage
                              content={msg.content}
                              files={msg.files}
                            />
                          ) : (
                            <AssistantMessage
                              chunks={msg.chunks}
                              scopeState={conversation.state}
                              isLatest={
                                index === list.length - 1 && !earlyFinished
                              }
                              finished={conversation.finished}
                            />
                          )}
                        </div>
                      ))}
                      {earlyFinished && (
                        <div className={styles.message}>
                          <AssistantMessage earlyFinished />
                        </div>
                      )}
                    </div>
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
            <div className={styles.narrow}>
              <WrappedChatInput
                ref={inputRef}
                placeholder={placeholder}
                suggestionsPlacement="top"
                submitDisabled={submitDisabled || !canChat}
                supportsTerminate
                uploadOptions={uploadOptions}
                onChatSubmit={(e) => handleChatSubmit(e.detail)}
              />
            </div>
          </div>
          {activeFile && (
            <FilePreview file={activeFile} fromModal={fromModal} />
          )}
          {activeImages && (
            <ImagesPreview images={activeImages} fromModal={fromModal} />
          )}
        </StreamContext.Provider>
      </TaskContext.Provider>
    </>
  );
});
