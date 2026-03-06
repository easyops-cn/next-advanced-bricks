// istanbul ignore file
import React, {
  createRef,
  forwardRef,
  useCallback,
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
import type { UseBrickConf } from "@next-core/types";
import type {
  ChatPayload,
  CommandPayload,
  FileInfo,
  RequestStore,
  UploadOptions,
} from "../shared/interfaces";
import { handleHttpError } from "@next-core/runtime";
import backgroundImage from "../home-container/images/background.png";
import { ChatPanelContent, type ChatPanelContentRef } from "./ChatPanelContent";

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
 * 弹出式 AI 对话面板，以模态框形式展示对话界面，支持与 AI 助手进行多轮对话。
 *
 * @description 弹出式 AI 对话面板，以模态框形式展示对话界面，支持与 AI 助手进行多轮对话。
 * @category ai-portal
 */
export
@defineElement("ai-portal.chat-panel", {
  shadowOptions: false,
})
class ChatPanel extends ReactNextElement implements ChatPanelProps {
  /**
   * 面板标题
   */
  @property()
  accessor panelTitle: string | undefined;

  /**
   * 预设数字人 ID，对话提交时会携带该 ID
   */
  @property()
  accessor aiEmployeeId: string | undefined;

  /**
   * 预设命令载荷，对话提交时会携带该命令
   */
  @property({ attribute: false })
  accessor cmd: CommandPayload | undefined;

  /**
   * 面板宽度
   */
  @property({ attribute: false }) accessor width: string | number | undefined;

  /**
   * 面板高度
   */
  @property({ attribute: false }) accessor height: string | number | undefined;

  /**
   * 输入框占位文字
   */
  @property()
  accessor placeholder: string | undefined;

  /**
   * 文件上传配置
   */
  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  /**
   * 无对话时显示的帮助内容配置
   */
  @property({ attribute: false })
  accessor help: { useBrick: UseBrickConf } | undefined;

  /**
   * 是否点击遮罩关闭面板
   *
   * @default false
   */
  @property({ type: Boolean })
  accessor maskClosable: boolean | undefined;

  #ref = createRef<ChatPanelRef>();

  /**
   * 打开对话面板
   */
  @method()
  open() {
    this.#ref.current?.open();
  }

  /**
   * 关闭对话面板
   */
  @method()
  close() {
    this.#ref.current?.close();
  }

  /**
   * 设置输入框的内容
   * @param content 要设置的文本内容
   */
  @method()
  setInputValue(content: string) {
    this.#ref.current?.setInputValue(content);
  }

  /**
   * 直接发送一条消息
   * @param payload 消息载荷，包含文本内容及可选的文件、命令等
   */
  @method()
  send(payload: ChatPayload) {
    this.#ref.current?.send(payload);
  }

  /**
   * 在面板中显示文件预览
   * @param file 要预览的文件信息
   */
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
  const contentRef = useRef<ChatPanelContentRef>(null);

  const [submitDisabled, setSubmitDisabled] = useState(false);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [initialRequest, setInitialRequest] = useState<RequestStore | null>(
    null
  );

  const handleChatSubmit = useCallback(
    async (payload: ChatPayload) => {
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
    [aiEmployeeId, cmd]
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
        contentRef.current?.setInputValue(content);
      },
      send: (payload: ChatPayload) => {
        handleChatSubmit(payload);
      },
      showFile: (file: FileInfo) => {
        contentRef.current?.showFile(file);
      },
    }),
    [handleChatSubmit]
  );

  return (
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
          contentRef.current?.focus();
        }, 100);
      }}
      ref={modalRef}
    >
      <ChatPanelContent
        fromModal
        ref={contentRef}
        conversationId={conversationId}
        initialRequest={initialRequest}
        placeholder={placeholder}
        uploadOptions={uploadOptions}
        help={help}
        submitDisabled={submitDisabled}
        onChatSubmit={handleChatSubmit}
      />
    </WrappedModal>
  );
}
