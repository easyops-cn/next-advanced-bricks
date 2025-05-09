import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import {
  TextareaAutoResize,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import { chunk } from "lodash";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import tips from "./images/tips.svg";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const { defineElement, property, event } = createDecorators();

export interface ChatBoxProps {
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  suggestions?: Suggestion[];
  suggestionsLabel?: string;
}

export interface Suggestion {
  title: string;
  content: string;
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

  @property({ attribute: false })
  accessor suggestions: Suggestion[] | undefined;

  @property()
  accessor suggestionsLabel: string | undefined;

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
        suggestions={this.suggestions}
        suggestionsLabel={this.suggestionsLabel}
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
  suggestions,
  suggestionsLabel,
  onSubmit,
}: ChatBoxComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
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
      setValue(e.target.value);
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

  // istanbul ignore next: experimental
  const groupedSuggestions = useMemo(() => {
    if (!suggestions?.length) {
      return [];
    }
    return chunk(suggestions, Math.max(2, Math.ceil(suggestions.length / 2)));
  }, [suggestions]);

  // istanbul ignore next: experimental
  const handleSelectSuggestion = useCallback((suggestion: Suggestion) => {
    valueRef.current = suggestion.content;
    setValue(suggestion.content);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  }, []);

  return (
    <div className="root">
      <div className="container" ref={containerRef}>
        <TextareaAutoResize
          containerRef={containerRef}
          ref={textareaRef}
          value={value}
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
      {
        // istanbul ignore next: experimental
        !!groupedSuggestions?.length && (
          <div className="suggestions">
            <div className="heading">
              <img
                className="icon"
                src={tips as unknown as string}
                width={16}
                height={16}
              />
              <span>{suggestionsLabel ?? t(K.COMMON_TASKS)}</span>
            </div>
            {groupedSuggestions.map((group, index) => (
              <SuggestionCarousel
                key={index}
                suggestions={group}
                pixelPerSecond={(index + 2) * 10}
                onSelect={handleSelectSuggestion}
              />
            ))}
          </div>
        )
      }
    </div>
  );
}

export interface SuggestionCarouselProps {
  suggestions: Suggestion[];
  pixelPerSecond: number;
  onSelect: (suggestion: Suggestion) => void;
}

// istanbul ignore next: experimental
function SuggestionCarousel({
  suggestions,
  pixelPerSecond,
  onSelect,
}: SuggestionCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [x, setX] = useState(0);

  // Auto scroll suggestions infinitely.
  // Stop scrolling when mouse enter, and resume when mouse leave.
  useEffect(() => {
    const carousel = carouselRef.current;
    const list = listRef.current;

    if (!carousel || !list) {
      return;
    }

    let previousTimestamp: number | undefined;
    let currentTimestamp: number | undefined;
    let offsetTime = 0;
    let start: number | undefined;
    let timer: number;

    // We doubled the suggestions to make it scroll infinitely.
    const gap = 7;
    const listSingleWidth = (list.offsetWidth - gap) / 2;
    const mod = listSingleWidth + gap;

    function step(timestamp: number) {
      currentTimestamp = timestamp;
      if (start === undefined) {
        start = timestamp;
      }
      if (previousTimestamp !== undefined) {
        offsetTime += timestamp - previousTimestamp;
        previousTimestamp = undefined;
      }
      const elapsed = timestamp - start - offsetTime;
      setX(((elapsed / 1000) * pixelPerSecond) % mod);
      timer = requestAnimationFrame(step);
    }

    timer = requestAnimationFrame(step);

    const onMouseEnter = () => {
      cancelAnimationFrame(timer);
      previousTimestamp = currentTimestamp;
    };
    const onMouseLeave = () => {
      timer = requestAnimationFrame(step);
    };

    carousel.addEventListener("mouseenter", onMouseEnter);
    carousel.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(timer);
      carousel.removeEventListener("mouseenter", onMouseEnter);
      carousel.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [suggestions, pixelPerSecond]);

  return (
    <div className="carousel" ref={carouselRef}>
      <ul
        className="list"
        ref={listRef}
        style={{ transform: `translateX(${-x}px)` }}
      >
        {[...suggestions, ...suggestions].map((item, index) => (
          <li key={index}>
            <div
              className="item"
              onClick={() => onSelect(item)}
              title={item.content}
            >
              <div className="title">{item.title}</div>
              <div className="content">{item.content}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
