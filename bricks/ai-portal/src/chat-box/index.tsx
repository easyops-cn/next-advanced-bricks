import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  createRef,
  useMemo,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import {
  getCaretPositionInTextarea,
  getContentRectInTextarea,
  TextareaAutoResize,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import type {
  ActionsEvents,
  ActionsEventsMapping,
  ActionsProps,
  EoActions,
  SimpleAction,
} from "@next-bricks/basic/actions";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedActions = wrapBrick<
  EoActions,
  ActionsProps,
  ActionsEvents,
  ActionsEventsMapping
>("eo-actions", {
  onActionClick: "action.click",
  onItemDragEnd: "item.drag.end",
  onItemDragStart: "item.drag.start",
});

const { defineElement, property, event, method } = createDecorators();

export const ChatBoxComponent = forwardRef(LegacyChatBoxComponent);

export interface ChatBoxProps {
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  aiEmployees?: AIEmployee[];
}

export interface AIEmployee {
  employeeId: string;
  name: string;
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

  @event({ type: "message.submit" })
  accessor #messageSubmit!: EventEmitter<string>;

  #handleMessageSubmit = (value: string) => {
    this.#messageSubmit.emit(value);
  };

  @event({ type: "ai-employee.mention" })
  accessor #employeeMention!: EventEmitter<AIEmployee | null>;

  #handleEmployeeMention = (employee: AIEmployee | null) => {
    this.#employeeMention.emit(employee);
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
        aiEmployees={this.aiEmployees}
        onSubmit={this.#handleMessageSubmit}
        onEmployeeMention={this.#handleEmployeeMention}
        ref={this.ref}
      />
    );
  }
}

interface ChatBoxComponentProps extends ChatBoxProps {
  onSubmit: (value: string) => void;
  onEmployeeMention: (employee: AIEmployee | null) => void;
  ref?: React.Ref<ChatBoxRef>;
}

interface MentionPopover {
  position: {
    left: number;
    top: number;
  };
  range: {
    start: number;
    end: number;
  };
  actions: SimpleAction[];
}

function LegacyChatBoxComponent(
  {
    disabled,
    placeholder,
    autoFocus,
    aiEmployees,
    onSubmit,
    onEmployeeMention,
  }: ChatBoxComponentProps,
  ref: React.Ref<ChatBoxRef>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");
  const [mentionPopover, setMentionPopover] = useState<MentionPopover | null>(
    null
  );
  const [mentionedText, setMentionedText] = useState("");
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

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
        onSubmit(e.currentTarget.value);
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value, selectionStart, selectionEnd } = e.target;
      valueRef.current = value;
      setValue(value);

      if (
        !mentionedText &&
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        aiEmployees?.length
      ) {
        const previousContent = value.slice(0, selectionStart);
        const mentionIndex = previousContent.lastIndexOf("@");
        if (mentionIndex >= 0) {
          const mentionText = previousContent
            .slice(mentionIndex + 1)
            .toLowerCase();
          const position = getCaretPositionInTextarea(
            e.currentTarget,
            selectionStart
          );
          const matchedEmployees = aiEmployees
            .filter(
              (employee) =>
                employee.employeeId.toLowerCase().includes(mentionText) ||
                employee.name.toLowerCase().includes(mentionText)
            )
            .slice(0, 10);
          if (matchedEmployees.length > 0) {
            setMentionPopover({
              position: {
                left: position.left + 10,
                top: position.top + 22,
              },
              range: { start: mentionIndex, end: selectionStart },
              actions: matchedEmployees.map((employee) => ({
                key: employee.employeeId,
                text: employee.name,
                data: employee,
              })),
            });
            setActiveActionIndex(0);
            return;
          }
        }
      }
      setMentionPopover(null);
    },
    [aiEmployees, mentionedText]
  );

  useEffect(() => {
    if (mentionedText && !value.includes(mentionedText)) {
      setMentionedText("");
      onEmployeeMention(null);
    }
  }, [mentionedText, onEmployeeMention, value]);

  const handleSubmitClick = useCallback(() => {
    onSubmit(valueRef.current);
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

  const mentionPrefix = useMemo(() => {
    const element = textareaRef.current?.element;
    if (!mentionedText || !element) {
      return "";
    }
    const index = value.indexOf(mentionedText);
    if (index < 0) {
      return "";
    }
    return value.slice(0, index);
  }, [mentionedText, value]);

  const mentionOverlay = useMemo(() => {
    const element = textareaRef.current?.element;
    if (!mentionedText || !element) {
      return null;
    }
    const rect = getContentRectInTextarea(
      element,
      mentionPrefix,
      // Ignore the last space
      mentionedText.slice(0, -1)
    );
    return {
      left: rect.left - 1,
      top: rect.top - 1,
      width: rect.width + 4,
      height: rect.height + 4,
    };
  }, [mentionedText, mentionPrefix]);

  const handleMention = useCallback(
    (action: SimpleAction) => {
      const mention = `@${action.text} `;
      const prefix = `${valueRef.current.slice(0, mentionPopover!.range.start)}${mention}`;
      const newValue = `${prefix}${valueRef.current.slice(mentionPopover!.range.end)}`;
      valueRef.current = newValue;
      selectionRef.current = { start: prefix.length, end: prefix.length };
      setValue(newValue);
      setMentionedText(mention);
      setMentionPopover(null);
      onEmployeeMention((action as { data?: AIEmployee }).data!);
    },
    [mentionPopover, onEmployeeMention]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      switch (e.key) {
        case "Escape":
          if (!mentionPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setMentionPopover(null);
          return false;
        case "ArrowUp":
        case "ArrowDown": {
          if (!mentionPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setActiveActionIndex((prev) => {
            const nextIndex = prev + (e.key === "ArrowUp" ? -1 : 1);
            const total = mentionPopover.actions.length;
            const next = (total + nextIndex) % total;
            return next;
          });
          return false;
        }
        case "Enter":
          if (!mentionPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          handleMention(mentionPopover.actions[activeActionIndex]);
          return false;
        case "Delete":
        case "Backspace": {
          if (mentionedText?.length) {
            let { selectionStart, selectionEnd } = e.currentTarget;
            if (selectionStart === selectionEnd) {
              if (e.key === "Backspace") {
                selectionStart -= 1;
              } else {
                selectionEnd += 1;
              }
            }
            const currentStart = mentionPrefix.length;
            const currentEnd = currentStart + mentionedText.length;
            if (selectionStart < currentEnd && selectionEnd > currentStart) {
              const start = Math.min(selectionStart, currentStart);
              const end = Math.max(selectionEnd, currentEnd);
              const newValue = `${valueRef.current.slice(0, start)}${valueRef.current.slice(end)}`;
              valueRef.current = newValue;
              selectionRef.current = { start, end: start };
              setValue(newValue);
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }
          break;
        }
      }
    },
    [
      activeActionIndex,
      handleMention,
      mentionPopover,
      mentionPrefix.length,
      mentionedText?.length,
    ]
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
          desiredSelectionRef={selectionRef}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
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
        {mentionPopover && (
          <WrappedActions
            className="mentions"
            actions={mentionPopover.actions}
            style={mentionPopover.position}
            onActionClick={(e) => handleMention(e.detail)}
            checkedKeys={[mentionPopover.actions[activeActionIndex].key!]}
          />
        )}
        {mentionOverlay && (
          <div className="mention-overlay" style={mentionOverlay} />
        )}
      </div>
    </div>
  );
}
