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
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  Modal,
  ModalProps,
  ModalEvents,
  ModalMapEvents,
} from "@next-bricks/containers/modal";
import { http } from "@next-core/http";
import type { UseBrickConf } from "@next-core/types";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import styles from "./styles.module.css";
import type { ChatInput } from "../chat-input";
import type {
  ActiveImages,
  ChatPayload,
  CommandPayload,
  ExtraChatPayload,
  FileInfo,
  RequestStore,
  UploadOptions,
} from "../shared/interfaces";
import { handleHttpError } from "@next-core/runtime";
import { useConversationDetail } from "../cruise-canvas/useConversationDetail";
import { useConversationStream } from "../chat-stream/useConversationStream";
import { preloadHighlighter } from "@next-shared/markdown";
import { useAutoScroll } from "../chat-stream/useAutoScroll";
import { UserMessage } from "../chat-stream/UserMessage/UserMessage";
import { AssistantMessage } from "../chat-stream/AssistantMessage/AssistantMessage";
import scrollStyles from "../chat-stream/ScrollDownButton.module.css";
import floatingStyles from "../shared/FloatingButton.module.css";
import backgroundImage from "../home-container/images/background.png";
import { DONE_STATES, NON_WORKING_STATES } from "../shared/constants";
import { WrappedChatInput, WrappedIcon } from "../shared/bricks";
import { FilePreview } from "../shared/FilePreview/FilePreview.js";
import { ImagesPreview } from "../shared/FilePreview/ImagesPreview.js";
import { TaskContext, type TaskContextValue } from "../shared/TaskContext";
import { StreamContext } from "../chat-stream/StreamContext";

const WrappedModal = wrapBrick<
  Modal,
  ModalProps & {
    themeVariant?: "default" | "elevo";
    height?: string | number;
    noFooter?: boolean;
    headerBordered?: boolean;
    background?: string;
    fullscreenButton?: boolean;
  },
  ModalEvents,
  ModalMapEvents
>("eo-modal", {
  onClose: "close",
  onConfirm: "confirm",
  onCancel: "cancel",
  onOpen: "open",
});

const { defineElement, property, method } = createDecorators();

export interface ChatPanelProps {
  panelTitle?: string;
  aiEmployeeId?: string;
  cmd?: CommandPayload;
  width?: string | number;
  height?: string | number;
  placeholder?: string;
  uploadOptions?: UploadOptions;
  help?: { useBrick: UseBrickConf };
  maskClosable?: boolean;
}

const ChatPanelComponent = forwardRef(LegacyChatPanelComponent);

/**
 * 弹出式对话面板。
 */
export
@defineElement("ai-portal.chat-panel", {
  shadowOptions: false,
})
class ChatPanel extends ReactNextElement implements ChatPanelProps {
  @property()
  accessor panelTitle: string | undefined;

  @property()
  accessor aiEmployeeId: string | undefined;

  @property({ attribute: false })
  accessor cmd: CommandPayload | undefined;

  @property({ attribute: false }) accessor width: string | number | undefined;

  @property({ attribute: false }) accessor height: string | number | undefined;

  @property()
  accessor placeholder: string | undefined;

  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  /**
   * Show help messages when no conversation exists.
   */
  @property({ attribute: false })
  accessor help: { useBrick: UseBrickConf } | undefined;

  /**
   * Whether to close the panel when clicking the mask.
   *
   * @default false
   */
  @property({ type: Boolean })
  accessor maskClosable: boolean | undefined;

  #ref = createRef<ChatPanelRef>();

  @method()
  open() {
    this.#ref.current?.open();
  }

  @method()
  close() {
    this.#ref.current?.close();
  }

  @method()
  setInputValue(content: string) {
    this.#ref.current?.setInputValue(content);
  }

  @method()
  send(payload: ChatPayload) {
    this.#ref.current?.send(payload);
  }

  @method()
  showFile(file: FileInfo) {
    this.#ref.current?.showFile(file);
  }

  render() {
    return (
      <ChatPanelComponent
        ref={this.#ref}
        panelTitle={this.panelTitle}
        aiEmployeeId={this.aiEmployeeId}
        cmd={this.cmd}
        width={this.width}
        height={this.height}
        placeholder={this.placeholder}
        uploadOptions={this.uploadOptions}
        help={this.help}
        maskClosable={this.maskClosable}
      />
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ChatPanelComponentProps extends ChatPanelProps {
  // Define react event handlers here.
}

interface ChatPanelRef {
  open: () => void;
  close: () => void;
  setInputValue: (content: string) => void;
  send: (payload: ChatPayload) => void;
  showFile: (file: FileInfo) => void;
}

function LegacyChatPanelComponent(
  {
    panelTitle,
    aiEmployeeId,
    cmd,
    width,
    height,
    placeholder,
    uploadOptions,
    help,
    maskClosable,
  }: ChatPanelComponentProps,
  ref: React.Ref<ChatPanelRef>
) {
  const modalRef = useRef<Modal>(null);
  const inputRef = useRef<ChatInput>(null);

  const [submitDisabled, setSubmitDisabled] = useState(false);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialRequest, setInitialRequest] = useState<RequestStore | null>(
    null
  );

  const { conversation, tasks, errors, humanInputRef } = useConversationDetail(
    conversationId,
    initialRequest
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
      setSubmitDisabled(true);
      try {
        const res = await http.post<{
          data: { conversationId: string };
        }>(
          "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
          {}
        );
        const conversationId = res.data.conversationId;
        setConversationId(conversationId);
        setInitialRequest({
          ...payload,
          ...(aiEmployeeId ? { aiEmployeeId } : null),
          ...(cmd ? { cmd } : null),
          conversationId: conversationId,
        });
      } catch (e) {
        handleHttpError(e);
      } finally {
        setSubmitDisabled(false);
      }
    },
    [aiEmployeeId, cmd, conversationId, humanInput]
  );

  const [activeFile, setActiveFile] = useState<FileInfo | null>(null);
  const [activeImages, setActiveImages] = useState<ActiveImages | null>(null);

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
      open: () => {
        modalRef.current?.open();
      },
      close: () => {
        modalRef.current?.close();
      },
      setInputValue: (content: string) => {
        inputRef.current?.setValue(content);
      },
      send: (payload: ChatPayload) => {
        handleChatSubmit(payload);
      },
      showFile: (file: FileInfo) => {
        setActiveFile(file);
      },
    }),
    [handleChatSubmit]
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
    <TaskContext.Provider value={taskContextValue}>
      <StreamContext.Provider value={streamContextValue}>
        <WrappedModal
          modalTitle={panelTitle}
          width={width}
          height={height}
          themeVariant="elevo"
          maskClosable={maskClosable}
          noFooter
          headerBordered
          fullscreenButton
          background={`fixed url(${backgroundImage}) center center / cover no-repeat`}
          onOpen={() => {
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }}
          ref={modalRef}
        >
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
        </WrappedModal>
        {activeFile && <FilePreview file={activeFile} fromModal />}
        {activeImages && <ImagesPreview images={activeImages} fromModal />}
      </StreamContext.Provider>
    </TaskContext.Provider>
  );
}
