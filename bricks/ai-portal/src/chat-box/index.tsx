import React, { useCallback, useRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { TextareaAutoResize } from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

const SEND_ICON: ButtonProps["icon"] = {
  lib: "fa",
  prefix: "fas",
  icon: "arrow-up",
};

const { defineElement, property, event } = createDecorators();

export interface ChatBoxProps {
  disabled?: boolean;
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

  @event({ type: "message.submit" })
  accessor #messageSubmit!: EventEmitter<string>;

  #handleMessageSubmit = (value: string) => {
    this.#messageSubmit.emit(value);
  };

  render() {
    return (
      <ChatBoxComponent
        disabled={this.disabled}
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
  onSubmit,
}: ChatBoxComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  return (
    <div className="container" ref={containerRef}>
      <TextareaAutoResize
        containerRef={containerRef}
        minRows={5}
        paddingSize={24}
        autoResize
        disabled={disabled}
        placeholder={t(K.HOW_CAN_I_HELP)}
        submitWhen="enter-without-shift"
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
      <WrappedButton
        className="btn-send"
        shape="circle"
        icon={SEND_ICON}
        disabled={disabled}
        onClick={handleSubmitClick}
      />
    </div>
  );
}
