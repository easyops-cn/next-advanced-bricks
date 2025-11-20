import React, {
  createRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
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
import styles from "./styles.module.css";
import type { ChatInput } from "../chat-input";
import type {
  ChatPayload,
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
import { DONE_STATES } from "../shared/constants";
import { WrappedChatInput, WrappedIcon } from "../shared/bricks";

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
  width?: string | number;
  height?: string | number;
  placeholder?: string;
  uploadOptions?: UploadOptions;
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

  @property({ attribute: false }) accessor width: string | number | undefined;

  @property({ attribute: false }) accessor height: string | number | undefined;

  @property()
  accessor placeholder: string | undefined;

  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  #ref = createRef<ChatPanelRef>();

  @method()
  open() {
    this.#ref.current?.open();
  }

  @method()
  close() {
    this.#ref.current?.close();
  }

  render() {
    return (
      <ChatPanelComponent
        ref={this.#ref}
        panelTitle={this.panelTitle}
        width={this.width}
        height={this.height}
        placeholder={this.placeholder}
        uploadOptions={this.uploadOptions}
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
}

function LegacyChatPanelComponent(
  {
    panelTitle,
    width,
    height,
    placeholder,
    uploadOptions,
  }: ChatPanelComponentProps,
  ref: React.Ref<ChatPanelRef>
) {
  const modalRef = useRef<Modal>(null);
  const inputRef = useRef<ChatInput>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      modalRef.current?.open();
    },
    close: () => {
      modalRef.current?.close();
    },
  }));

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
  const canChat =
    !conversationId ||
    conversationDone ||
    conversationState === "input-required";

  const { messages } = useConversationStream(
    conversationAvailable,
    conversationState,
    tasks,
    errors
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

  const { scrollable, scrollToBottom } = useAutoScroll(
    conversationAvailable && depsReady,
    scrollContainerRef,
    scrollContentRef
  );

  const handleChatSubmit = async (e: CustomEvent<ChatPayload>) => {
    if (conversationId) {
      const { content, ...extra } = e.detail;
      humanInputRef.current?.(e.detail.content, undefined, extra);
      return;
    }
    setSubmitDisabled(true);
    try {
      const res = await http.post<{
        data: { conversationId: string };
      }>("api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations", {});
      const conversationId = res.data.conversationId;
      setConversationId(conversationId);
      setInitialRequest({
        ...e.detail,
        conversationId: conversationId,
      });
    } catch (e) {
      handleHttpError(e);
    } finally {
      setSubmitDisabled(false);
    }
  };

  return (
    <WrappedModal
      modalTitle={panelTitle}
      width={width}
      height={height}
      themeVariant="elevo"
      maskClosable
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
          <div className={styles.main} />
        ) : conversationAvailable && depsReady ? (
          <div className={styles.main}>
            <div className={styles.chat} ref={scrollContainerRef}>
              <div className={styles.messages} ref={scrollContentRef}>
                {messages.map((msg, index, list) => (
                  <div className={styles.message} key={index}>
                    {msg.role === "user" ? (
                      <UserMessage
                        content={msg.content}
                        cmd={msg.cmd}
                        files={msg.files}
                      />
                    ) : (
                      <AssistantMessage
                        chunks={msg.chunks}
                        scopeState={conversation.state}
                        isLatest={index === list.length - 1}
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
        <div className={styles.input}>
          <WrappedChatInput
            ref={inputRef}
            placeholder={placeholder}
            suggestionsPlacement="top"
            submitDisabled={submitDisabled || !canChat}
            supportsTerminate
            uploadOptions={uploadOptions}
            onChatSubmit={handleChatSubmit}
          />
        </div>
      </div>
    </WrappedModal>
  );
}
