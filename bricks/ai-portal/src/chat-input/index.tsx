import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import {
  TextareaAutoResize,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import ResizeObserver from "resize-observer-polyfill";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
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

const { defineElement, property, event } = createDecorators();

export interface ChatInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  submitDisabled?: boolean;
  supportsTerminate?: boolean;
  terminating?: boolean;
  uploadOptions?: UploadOptions;
}

export interface ChatInputEvents {
  "chat.submit": CustomEvent<ChatPayload>;
  terminate: Event;
}

export interface ChatInputMapEvents {
  onChatSubmit: "chat.submit";
  onTerminate: "terminate";
}

/**
 * 构件 `ai-portal.chat-input`
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

  @event({ type: "terminate" })
  accessor #terminate!: EventEmitter<void>;

  #handleTerminate = () => {
    this.#terminate.emit();
  };

  render() {
    return (
      <ChatInputComponent
        placeholder={this.placeholder}
        autoFocus={this.autoFocus}
        submitDisabled={this.submitDisabled}
        supportsTerminate={this.supportsTerminate}
        terminating={this.terminating}
        uploadOptions={this.uploadOptions}
        onMessageSubmit={this.#handleMessageSubmit}
        onChatSubmit={this.#handleChatSubmit}
        onTerminate={this.#handleTerminate}
      />
    );
  }
}

interface ChatInputComponentProps extends ChatInputProps {
  onMessageSubmit: (value: string) => void;
  onChatSubmit: (payload: ChatPayload) => void;
  onTerminate: () => void;
}

function ChatInputComponent({
  placeholder,
  autoFocus,
  submitDisabled,
  supportsTerminate,
  terminating,
  uploadOptions,
  onMessageSubmit,
  onChatSubmit,
  onTerminate,
}: ChatInputComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");
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

  useEffect(() => {
    if (!uploadEnabled) {
      resetFiles();
    }
  }, [uploadEnabled, resetFiles]);

  useEffect(() => {
    if (autoFocus && !submitDisabled) {
      textareaRef.current?.focus();
    }
  }, [autoFocus, submitDisabled]);

  const onBeforeSubmit = useCallback(
    (value: string) => {
      if (submitDisabled || !value || !allFilesDone) {
        return;
      }

      onMessageSubmit(value);
      onChatSubmit({ content: value, files: fileInfos });
      valueRef.current = "";
      setValue("");
      resetFiles();
    },
    [
      allFilesDone,
      submitDisabled,
      onMessageSubmit,
      onChatSubmit,
      fileInfos,
      resetFiles,
    ]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      onBeforeSubmit(e.currentTarget.value);
    },
    [onBeforeSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      valueRef.current = e.target.value;
      setValue(e.target.value);
    },
    []
  );

  const handleSubmitClick = useCallback(() => {
    onBeforeSubmit(valueRef.current);
  }, [onBeforeSubmit]);

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

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    for (const item of e.nativeEvent.composedPath()) {
      if (
        item instanceof HTMLTextAreaElement ||
        item instanceof HTMLButtonElement
      ) {
        return;
      }
    }
    textareaRef.current?.focus();
  }, []);

  const onFilesDropped = useCallback(
    (files: File[]) => {
      appendFiles(files);
      textareaRef.current?.focus();
    },
    [appendFiles]
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
              onSubmit={handleSubmit}
              onChange={handleChange}
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
        accept={uploadAccept}
        dragTips={uploadOptions?.dragTips}
        onFilesDropped={onFilesDropped}
      />
    </>
  );
}
