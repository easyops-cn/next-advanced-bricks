import React, { useCallback, useEffect, useRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import {
  TextareaAutoResize,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const { defineElement, property, event } = createDecorators();

export interface ChatBoxProps {
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * 构件 `ai-portal.chat-box`
 */
export
@defineElement("ai-portal.chat-box", {
  styleTexts: [styleText],
})
class ChatBox extends ReactNextElement implements ChatBoxProps {
  @property({ type: Boolean })
  accessor disabled: boolean | undefined;

  @property()
  accessor placeholder: string | undefined;

  @property({ type: Boolean })
  accessor autoFocus: boolean | undefined;

  @event({ type: "message.submit" })
  accessor #messageSubmit!: EventEmitter<string>;

  #handleMessageSubmit = (value: string) => {
    this.#messageSubmit.emit(value);
  };

  render() {
    return (
      <ChatBoxComponent
        disabled={this.disabled}
        placeholder={this.placeholder}
        autoFocus={this.autoFocus}
        onSubmit={this.#handleMessageSubmit}
      />
    );
  }
}

export interface ChatBoxComponentProps extends ChatBoxProps {
  // Define react event handlers here.
  onSubmit?: (value: string) => void;
}

export function ChatBoxComponent({
  disabled,
  placeholder,
  autoFocus,
  onSubmit,
}: ChatBoxComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const valueRef = useRef("");

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      onSubmit?.(e.currentTarget.value);
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      valueRef.current = e.target.value;
    },
    []
  );

  const handleSubmitClick = useCallback(() => {
    onSubmit?.(valueRef.current);
  }, [onSubmit]);

  useEffect(() => {
    if (autoFocus) {
      Promise.resolve().then(() => {
        textareaRef.current?.focus();
      });
    }
  }, []);

  return (
    <div className="container" ref={containerRef}>
      <TextareaAutoResize
        containerRef={containerRef}
        ref={textareaRef}
        minRows={3}
        paddingSize={62}
        autoResize
        disabled={disabled}
        placeholder={placeholder ?? t(K.ASK_ANY_THING)}
        submitWhen="enter-without-shift"
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
      <button className="btn-send" onClick={handleSubmitClick}>
        <WrappedIcon lib="fa" prefix="fas" icon="arrow-up" />
      </button>
    </div>
  );
}
