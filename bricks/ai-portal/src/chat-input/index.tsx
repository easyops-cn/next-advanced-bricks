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
}

export interface ChatInputEvents {
  "message.submit": CustomEvent<string>;
  terminate: Event;
}

export interface ChatInputMapEvents {
  onMessageSubmit: "message.submit";
  onTerminate: "terminate";
}

/**
 * 构件 `ai-portal.chat-input`
 */
export
@defineElement("ai-portal.chat-input", {
  styleTexts: [styleText],
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

  @event({ type: "message.submit" })
  accessor #messageSubmit!: EventEmitter<string>;

  #handleMessageSubmit = (value: string) => {
    this.#messageSubmit.emit(value);
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
        onSubmit={this.#handleMessageSubmit}
        onTerminate={this.#handleTerminate}
      />
    );
  }
}

interface ChatInputComponentProps extends ChatInputProps {
  onSubmit: (value: string) => void;
  onTerminate: () => void;
}

function ChatInputComponent({
  placeholder,
  autoFocus,
  submitDisabled,
  supportsTerminate,
  terminating,
  onSubmit,
  onTerminate,
}: ChatInputComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    if (autoFocus && !submitDisabled) {
      textareaRef.current?.focus();
    }
  }, [autoFocus, submitDisabled]);

  const onBeforeSubmit = useCallback(
    (value: string) => {
      if (submitDisabled || !value) {
        return;
      }

      onSubmit(value);
      valueRef.current = "";
      setValue("");
    },
    [submitDisabled, onSubmit]
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
  }, []);

  useEffect(() => {
    if (!value) {
      setWrap(false);
    }
  }, [value]);

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

  return (
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
            paddingSize={16}
            autoResize
            placeholder={placeholder}
            submitWhen="enter-without-shift"
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
        </div>
        <div className="toolbar">
          {!submitDisabled || !supportsTerminate ? (
            <button
              className="btn-send"
              disabled={submitDisabled || !value}
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
  );
}
