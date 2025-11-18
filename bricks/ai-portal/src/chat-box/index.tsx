import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  createRef,
} from "react";
import { createPortal } from "react-dom";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { TextareaAutoResize } from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import {
  getChatCommand,
  setChatCommand,
} from "../data-providers/set-chat-command.js";
import type { ChatPayload, UploadOptions } from "../shared/interfaces.js";
import {
  UploadButton,
  type UploadButtonRef,
} from "../shared/FileUpload/UploadButton.js";
import { UploadedFiles } from "../shared/FileUpload/UploadedFiles.js";
import UploadedFilesStyleText from "../shared/FileUpload/UploadedFiles.shadow.css";
import { WrappedActions, WrappedIcon } from "./bricks.js";
import { useFilesUploading } from "../shared/useFilesUploading.js";
import GlobalDragOverlay from "../shared/FileUpload/GlobalDragOverlay.js";
import { getInitialContent } from "../shared/ReadableCommand/ReadableCommand.js";
import {
  useChatCompletions,
  type ActionWithSubCommands,
  type Command,
} from "../shared/ChatCompletions/useChatCompletions.js";

initializeI18n(NS, locales);

const MAX_SHOWN_COMMANDS = 10;

const { defineElement, property, event, method } = createDecorators();

export const ChatBoxComponent = forwardRef(LegacyChatBoxComponent);

export interface ChatBoxProps {
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  aiEmployees?: AIEmployee[];
  commands?: Command[];
  uploadOptions?: UploadOptions;
}

export interface AIEmployee {
  employeeId: string;
  name: string;
}

export interface ChatBoxRef {
  setValue: (value: string) => void;
  getValue: () => string;
  focusOnInput: () => void;
}

/**
 * 大型聊天输入框，用于首页
 */
export
@defineElement("ai-portal.chat-box", {
  styleTexts: [styleText, UploadedFilesStyleText],
  shadowOptions: {
    delegatesFocus: true,
  },
})
class ChatBox extends ReactNextElement implements ChatBoxProps {
  ref = createRef<ChatBoxRef>();

  @property({ type: Boolean })
  accessor disabled: boolean | undefined;

  @property()
  accessor placeholder: string | undefined;

  @property({ type: Boolean })
  accessor autoFocus: boolean | undefined;

  @property({ attribute: false })
  accessor aiEmployees: AIEmployee[] | undefined;

  @property({ attribute: false })
  accessor commands: Command[] | undefined;

  @property({ attribute: false })
  accessor uploadOptions: UploadOptions | undefined;

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

  @method()
  setValue(value: string) {
    this.ref.current?.setValue(value);
  }

  @method()
  getValue() {
    return this.ref.current?.getValue();
  }

  @method()
  focusOnInput() {
    return this.ref.current?.focusOnInput();
  }

  render() {
    return (
      <ChatBoxComponent
        disabled={this.disabled}
        placeholder={this.placeholder}
        autoFocus={this.autoFocus}
        aiEmployees={this.aiEmployees}
        commands={this.commands}
        uploadOptions={this.uploadOptions}
        onMessageSubmit={this.#handleMessageSubmit}
        onChatSubmit={this.#handleChatSubmit}
        root={this}
        ref={this.ref}
      />
    );
  }
}

interface ChatBoxComponentProps extends ChatBoxProps {
  root: HTMLElement;
  onMessageSubmit: (value: string) => void;
  onChatSubmit: (payload: ChatPayload) => void;
  ref?: React.Ref<ChatBoxRef>;
}

function LegacyChatBoxComponent(
  {
    root,
    disabled,
    placeholder,
    autoFocus,
    aiEmployees,
    commands,
    uploadOptions,
    onMessageSubmit,
    onChatSubmit,
  }: ChatBoxComponentProps,
  ref: React.Ref<ChatBoxRef>
) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!uploadEnabled) {
      resetFiles();
    }
  }, [uploadEnabled, resetFiles]);

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
    setInitialMention,
    handleMention,

    command,
    commandText,
    commandPrefix,
    commandPopover,
    commandOverlay,
    commandActiveKeys,
    setInitialCommand,
    handleSelectCommand,

    handleChange,
    handleKeyDown,
  } = useChatCompletions({
    aiEmployees,
    commands,
    root,
    hasFiles,
  });

  useEffect(() => {
    const command = getChatCommand();
    if (command) {
      setChatCommand(null);
    }
    setInitialCommand(command);
  }, [setInitialCommand]);

  useEffect(() => {
    const store = window.__elevo_try_it_out;
    if (store) {
      delete window.__elevo_try_it_out;
    }
    if (typeof store?.content === "string") {
      valueRef.current = store.content;
      setValue(store.content);
      if (store?.cmd) {
        setInitialCommand({
          command: getInitialContent(store.cmd).slice(1),
          payload: store.cmd,
        });
      } else if (store?.mentionedAiEmployeeId) {
        setInitialMention(store.mentionedAiEmployeeId);
      }
    }
  }, [setInitialCommand, setInitialMention, setValue, valueRef]);

  useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      valueRef.current = value;
      setValue(value);
    },
    getValue: () => {
      return valueRef.current;
    },
    focusOnInput: () => {
      textareaRef.current?.focus();
    },
  }));

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
    },
    [
      sendDisabled,
      commandText.length,
      mentionedText.length,
      command,
      fileInfos,
      mentioned,
      onChatSubmit,
      onMessageSubmit,
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

  useEffect(
    () => {
      if (autoFocus) {
        Promise.resolve().then(() => {
          textareaRef.current?.focus();
        });
      }
    },
    // One-time focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const uploadButtonRef = useRef<UploadButtonRef>(null);

  const onFilesDropped = useCallback(
    (files: File[]) => {
      appendFiles(files);
      textareaRef.current?.focus();
    },
    [appendFiles, textareaRef]
  );

  return (
    <>
      <div className="root">
        <div className="container" ref={containerRef}>
          <TextareaAutoResize
            containerRef={containerRef}
            ref={textareaRef}
            value={value}
            minRows={58 / 22}
            paddingSize={hasFiles ? 144 : 60}
            autoResize
            disabled={disabled}
            placeholder={placeholder ?? t(K.ASK_ANY_THING)}
            submitWhen="enter-without-shift"
            desiredSelectionRef={selectionRef}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={paste}
            style={{
              paddingTop: hasFiles ? 94 : 10,
            }}
          />
          {hasFiles && (
            <UploadedFiles
              files={files!}
              onRemove={(uid, abortController) => {
                removeFile(uid);
                abortController?.abort();
              }}
              onAdd={() => {
                uploadButtonRef.current?.requestUpload();
              }}
            />
          )}
          <div className="actions-bar">
            <div>
              <slot name="actions" />
            </div>
            <div className="buttons">
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
              <button
                className="btn-send"
                disabled={sendDisabled}
                onClick={handleSubmitClick}
              >
                <WrappedIcon lib="fa" prefix="fas" icon="arrow-up" />
              </button>
            </div>
          </div>
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
      </div>
      <GlobalDragOverlay
        disabled={!uploadEnabled || exceeded}
        uploadOptions={uploadOptions}
        onFilesDropped={onFilesDropped}
      />
    </>
  );
}
