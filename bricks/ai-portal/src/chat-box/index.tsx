import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  createRef,
} from "react";
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

const { defineElement, property, event, method } = createDecorators();

export const ChatBoxComponent = forwardRef(LegacyChatBoxComponent);

export interface ChatBoxProps {
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export interface Suggestion {
  title: string;
  content: string;
}

export interface ChatBoxRef {
  setValue: (value: string) => void;
  getValue: () => string;
}

/**
 * 构件 `ai-portal.chat-box`
 */
export
@defineElement("ai-portal.chat-box", {
  styleTexts: [styleText],
})
class ChatBox extends ReactNextElement implements ChatBoxProps {
  ref = createRef<ChatBoxRef>();

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

  @method()
  setValue(value: string) {
    this.ref.current?.setValue(value);
  }

  @method()
  getValue() {
    return this.ref.current?.getValue();
  }

  render() {
    return (
      <ChatBoxComponent
        disabled={this.disabled}
        placeholder={this.placeholder}
        autoFocus={this.autoFocus}
        onSubmit={this.#handleMessageSubmit}
        ref={this.ref}
      />
    );
  }
}

export interface ChatBoxComponentProps extends ChatBoxProps {
  // Define react event handlers here.
  onSubmit?: (value: string) => void;
  ref?: React.Ref<ChatBoxRef>;
}

export function LegacyChatBoxComponent(
  { disabled, placeholder, autoFocus, onSubmit }: ChatBoxComponentProps,
  ref: React.Ref<ChatBoxRef>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");

  useImperativeHandle(ref, () => ({
    setValue: (value: string) => {
      valueRef.current = value;
      setValue(value);
    },
    getValue: () => {
      return valueRef.current;
    },
  }));

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (e.currentTarget.value) {
        onSubmit?.(e.currentTarget.value);
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      valueRef.current = e.target.value;
      setValue(e.target.value);
    },
    []
  );

  const handleSubmitClick = useCallback(() => {
    onSubmit?.(valueRef.current);
  }, [onSubmit]);

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

  return (
    <div className="root">
      <div className="container" ref={containerRef}>
        <TextareaAutoResize
          containerRef={containerRef}
          ref={textareaRef}
          value={value}
          minRows={58 / 22}
          paddingSize={60}
          autoResize
          disabled={disabled}
          placeholder={placeholder ?? t(K.ASK_ANY_THING)}
          submitWhen="enter-without-shift"
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
        <div className="actions-bar">
          <div>
            <slot name="actions"></slot>
          </div>
          <button
            className="btn-send"
            disabled={!value}
            onClick={handleSubmitClick}
          >
            <WrappedIcon lib="fa" prefix="fas" icon="arrow-up" />
          </button>
        </div>
      </div>
    </div>
  );
}
