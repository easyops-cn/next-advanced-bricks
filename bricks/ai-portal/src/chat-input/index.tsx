import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { TextareaAutoResize } from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import ResizeObserver from "resize-observer-polyfill";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  ActionsEvents,
  ActionsEventsMapping,
  ActionsProps,
  EoActions,
} from "@next-bricks/basic/actions";
import classNames from "classnames";
import { K, NS, locales, t } from "./i18n.js";
import type { IconButton, IconButtonProps } from "../icon-button";
import styleText from "./styles.shadow.css";
import { UploadedFiles } from "../shared/FileUpload/UploadedFiles.js";
import UploadedFilesStyleText from "../shared/FileUpload/UploadedFiles.shadow.css";
import { useFilesUploading } from "../shared/useFilesUploading.js";
import {
  UploadButton,
  type UploadButtonRef,
} from "../shared/FileUpload/UploadButton.js";
import type { ChatPayload, UploadOptions } from "../shared/interfaces.js";
import GlobalDragOverlay from "../shared/FileUpload/GlobalDragOverlay.js";
import {
  MAX_SHOWN_COMMANDS,
  useChatCompletions,
  type ActionWithSubCommands,
  type AIEmployee,
  type Command,
} from "../shared/ChatCompletions/useChatCompletions.js";
import { createPortal } from "react-dom";

initializeI18n(NS, locales);

const ICON_LOADING: GeneralIconProps = {
  lib: "antd",
  icon: "loading-3-quarters",
  spinning: true,
};

const ICON_STOP: GeneralIconProps = {
  lib: "fa",
  prefix: "far",
  icon: "circle-stop",
};

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedIconButton = wrapBrick<IconButton, IconButtonProps>(
  "ai-portal.icon-button"
);

export const WrappedActions = wrapBrick<
  EoActions,
  ActionsProps & { activeKeys?: (string | number)[]; footerTips?: string },
  ActionsEvents,
  ActionsEventsMapping
>("eo-actions", {
  onActionClick: "action.click",
  onItemDragEnd: "item.drag.end",
  onItemDragStart: "item.drag.start",
});

const { defineElement, property, event, method } = createDecorators();

export interface ChatInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  submitDisabled?: boolean;
  supportsTerminate?: boolean;
  terminating?: boolean;
  autoFade?: boolean;
  uploadOptions?: UploadOptions;
  aiEmployees?: AIEmployee[];
  commands?: Command[];
  suggestionsPlacement?: "top" | "bottom";
}

export interface ChatInputEvents {
  "chat.submit": CustomEvent<ChatPayload>;
  terminate: Event;
}

export interface ChatInputMapEvents {
  onChatSubmit: "chat.submit";
  onTerminate: "terminate";
}

const ChatInputComponent = forwardRef(LegacyChatInputComponent);

/**
 * 小型聊天输入框，用于对话等页面
 */
export
@defineElement("ai-portal.chat-input", {
  styleTexts: [styleText, UploadedFilesStyleText],
  shadowOptions: {
    delegatesFocus: true,
  },
})
class ChatInput extends ReactNextElement implements ChatInputProps {
  @property()
  accessor placeholder: string | undefined;

  @property({ type: Boolean })
  accessor autoFocus: boolean | undefined;

  @property({ type: Boolean })
  accessor submitDisabled: boolean | undefined;

  @property({ type: Boolean })
  accessor supportsTerminate: boolean | undefined;

  @property({ type: Boolean })
  accessor terminating: boolean | undefined;

  @property({ type: Boolean, render: false })
  accessor autoFade: boolean | undefined;

  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

  @property({ attribute: false })
  accessor aiEmployees: AIEmployee[] | undefined;

  @property({ attribute: false })
  accessor commands: Command[] | undefined;

  /**
   * @default "bottom"
   */
  @property()
  accessor suggestionsPlacement: "top" | "bottom" | undefined;

  /**
   * @deprecated Use `chat.submit` event instead
   */
  @event({ type: "message.submit" })
  accessor #messageSubmit!: EventEmitter<string>;

  #handleMessageSubmit = (value: string) => {
    this.#messageSubmit.emit(value);
  };

  @event({ type: "chat.submit" })
  accessor #chatSubmit!: EventEmitter<ChatPayload>;

  #handleChatSubmit = (payload: ChatPayload) => {
    this.#chatSubmit.emit(payload);
  };

  @event({ type: "terminate" })
  accessor #terminate!: EventEmitter<void>;

  #handleTerminate = () => {
    this.#terminate.emit();
  };

  #ref = createRef<ChatInputRef>();

  @method()
  setValue(value: string) {
    this.#ref.current?.setValue(value);
  }

  render() {
    return (
      <ChatInputComponent
        ref={this.#ref}
        placeholder={this.placeholder}
        autoFocus={this.autoFocus}
        submitDisabled={this.submitDisabled}
        supportsTerminate={this.supportsTerminate}
        terminating={this.terminating}
        uploadOptions={this.uploadOptions}
        aiEmployees={this.aiEmployees}
        commands={this.commands}
        suggestionsPlacement={this.suggestionsPlacement}
        onMessageSubmit={this.#handleMessageSubmit}
        onChatSubmit={this.#handleChatSubmit}
        onTerminate={this.#handleTerminate}
        root={this}
      />
    );
  }
}

interface ChatInputRef {
  setValue: (value: string) => void;
}

interface ChatInputComponentProps extends ChatInputProps {
  root: HTMLElement;
  onMessageSubmit: (value: string) => void;
  onChatSubmit: (payload: ChatPayload) => void;
  onTerminate: () => void;
}

function LegacyChatInputComponent(
  {
    root,
    placeholder,
    autoFocus,
    submitDisabled,
    supportsTerminate,
    terminating,
    uploadOptions,
    aiEmployees,
    commands,
    suggestionsPlacement,
    onMessageSubmit,
    onChatSubmit,
    onTerminate,
  }: ChatInputComponentProps,
  ref: React.Ref<ChatInputRef>
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [wrap, setWrap] = useState(false);
  const uploadEnabled = uploadOptions?.enabled;
  const uploadAccept = uploadOptions?.accept;
  const {
    files,
    resetFiles,
    appendFiles,
    removeFile,
    hasFiles,
    allFilesDone,
    fileInfos,
    exceeded,
    paste,
  } = useFilesUploading(uploadOptions);
  const uploadButtonRef = useRef<UploadButtonRef>(null);

  const {
    textareaRef,
    valueRef,
    value,
    setValue,
    selectionRef,

    mentioned,
    mentionedText,
    mentionPopover,
    mentionOverlay,
    mentionActiveKeys,
    handleMention,

    command,
    commandText,
    commandPrefix,
    commandPopover,
    commandOverlay,
    commandActiveKeys,
    handleSelectCommand,

    handleChange,
    handleKeyDown,
  } = useChatCompletions({
    aiEmployees,
    commands,
    root,
    hasFiles,
    placement: suggestionsPlacement,
  });

  useImperativeHandle(
    ref,
    () => ({
      setValue: (value: string) => {
        valueRef.current = value;
        setValue(value);
        setTimeout(() => {
          textareaRef.current?.focus();
        }, 100);
      },
    }),
    [setValue, textareaRef, valueRef]
  );

  useEffect(() => {
    if (!uploadEnabled) {
      resetFiles();
    }
  }, [uploadEnabled, resetFiles]);

  useEffect(() => {
    if (autoFocus && !submitDisabled) {
      textareaRef.current?.focus();
    }
  }, [autoFocus, submitDisabled, textareaRef]);

  const sendDisabled =
    !value ||
    !allFilesDone ||
    (!!mentionedText && value.length <= mentionedText.length) ||
    (!!commandText && value.length <= commandText.length);

  const doSubmit = useCallback(
    (value: string) => {
      if (sendDisabled) {
        return;
      }
      const content = value.slice(commandText.length || mentionedText.length);
      onMessageSubmit(content);
      onChatSubmit({
        content,
        files: fileInfos,
        cmd: command,
        aiEmployeeId: mentioned,
      });
      valueRef.current = "";
      setValue("");
      resetFiles();
    },
    [
      sendDisabled,
      onMessageSubmit,
      onChatSubmit,
      fileInfos,
      resetFiles,
      valueRef,
      setValue,
      mentioned,
      mentionedText,
      command,
      commandText,
    ]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (e.currentTarget.value) {
        doSubmit(e.currentTarget.value);
      }
    },
    [doSubmit]
  );

  const handleSubmitClick = useCallback(() => {
    doSubmit(valueRef.current);
  }, [doSubmit, valueRef]);

  // istanbul ignore next
  useEffect(() => {
    if (hasFiles) {
      setWrap(true);
      return;
    }
    const container = containerRef?.current;
    if (!container) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          const currentBlockSize = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].blockSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .blockSize
            : entry.contentRect.height;
          if (currentBlockSize > 52) {
            setWrap(true);
          }
        }
      }
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, [hasFiles]);

  useEffect(() => {
    if (!value && !hasFiles) {
      setWrap(false);
    }
  }, [value, hasFiles]);

  const handleContainerClick = useCallback(
    (e: React.MouseEvent) => {
      for (const item of e.nativeEvent.composedPath()) {
        if (
          item instanceof HTMLTextAreaElement ||
          item instanceof HTMLButtonElement
        ) {
          return;
        }
      }
      textareaRef.current?.focus();
    },
    [textareaRef]
  );

  const onFilesDropped = useCallback(
    (files: File[]) => {
      appendFiles(files);
      textareaRef.current?.focus();
    },
    [appendFiles, textareaRef]
  );

  return (
    <>
      <div className="container" onClick={handleContainerClick}>
        <div className={classNames("box", { wrap })}>
          <div className="input" ref={containerRef}>
            <TextareaAutoResize
              containerRef={containerRef}
              ref={textareaRef}
              value={value}
              minRows={1}
              maxRows={4}
              borderSize={0}
              paddingSize={hasFiles ? 86 : 16}
              autoResize
              placeholder={placeholder}
              submitWhen="enter-without-shift"
              desiredSelectionRef={selectionRef}
              onSubmit={handleSubmit}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={paste}
              style={{
                paddingTop: hasFiles ? 78 : 8,
              }}
            />
            {hasFiles && (
              <UploadedFiles
                files={files!}
                className="condensed"
                onRemove={(uid, abortController) => {
                  removeFile(uid);
                  abortController?.abort();
                }}
                onAdd={() => {
                  uploadButtonRef.current?.requestUpload();
                }}
              />
            )}
            {mentionOverlay?.map((overlay, index) => (
              <div key={index} className="mention-overlay" style={overlay} />
            ))}
            {commandOverlay?.map((overlay, index) => (
              <div key={index} className="mention-overlay" style={overlay} />
            ))}
            {mentionPopover &&
              createPortal(
                <WrappedActions
                  actions={mentionPopover.actions}
                  style={mentionPopover.style}
                  activeKeys={mentionActiveKeys!}
                  footerTips={t(K.COMMAND_TIPS)}
                  onActionClick={(e) => handleMention(e.detail)}
                />,
                document.body
              )}
            {commandPopover &&
              createPortal(
                <WrappedActions
                  actions={commandPopover.actions}
                  style={commandPopover.style}
                  activeKeys={commandActiveKeys!}
                  footerTips={
                    commandPrefix === "/"
                      ? t(K.COMMAND_TIPS)
                      : t(K.SEARCH_COMMANDS_TIPS, { count: MAX_SHOWN_COMMANDS })
                  }
                  onActionClick={(e) =>
                    handleSelectCommand(e.detail as ActionWithSubCommands)
                  }
                />,
                document.body
              )}
          </div>
          <div className="toolbar">
            {uploadEnabled ? (
              <>
                <UploadButton
                  ref={uploadButtonRef}
                  accept={uploadAccept}
                  disabled={exceeded}
                  onChange={(files) => {
                    appendFiles(files);
                    textareaRef.current?.focus();
                  }}
                />
                <div className="btn-divider"></div>
              </>
            ) : null}
            {!submitDisabled || !supportsTerminate ? (
              <button
                className="btn-send"
                disabled={submitDisabled || !value || !allFilesDone}
                onClick={handleSubmitClick}
              >
                <WrappedIcon lib="fa" icon="arrow-up" />
              </button>
            ) : (
              <>
                {terminating ? (
                  <WrappedIconButton icon={ICON_LOADING} disabled />
                ) : (
                  <WrappedIconButton
                    icon={ICON_STOP}
                    tooltip={t(K.TERMINATE_THE_TASK)}
                    onClick={onTerminate}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <GlobalDragOverlay
        disabled={!uploadEnabled || exceeded || uploadOptions?.dragDisabled}
        uploadOptions={uploadOptions}
        onFilesDropped={onFilesDropped}
      />
    </>
  );
}
