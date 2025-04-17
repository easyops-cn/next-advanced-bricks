import React, { useRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { TextareaAutoResize } from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

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
  @property()
  accessor disabled: boolean = false;

  @event({ type: "message.submit" })
  accessor #messageSubmit!: EventEmitter<string>;

  #handleMessageSubmit = (e: React.FormEvent<HTMLTextAreaElement>) => {
    this.#messageSubmit.emit(e.currentTarget.value);
  };

  render() {
    return (
      <ChatBoxComponent onSubmit={this.#handleMessageSubmit} />
    );
  }
}

export interface ChatBoxComponentProps extends ChatBoxProps {
  // Define react event handlers here.
  onSubmit?: (e: React.FormEvent<HTMLTextAreaElement>) => void;
}

export function ChatBoxComponent({ onSubmit }: ChatBoxComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  return (
    <div className="container" ref={containerRef}>
      <TextareaAutoResize
        containerRef={containerRef}
        autoResize
        placeholder={t(K.HOW_CAN_I_HELP)}
        submitWhen="enter-without-shift"
        onSubmit={onSubmit}
      />
    </div>
  );
}
