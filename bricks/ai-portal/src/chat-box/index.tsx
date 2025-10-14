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
import { createPortal } from "react-dom";
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
  SubMenuAction,
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
  commands?: Command[];
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

export interface Command {
  label: string;
  value: string;
  options?: Command[];
}

type ActionWithAncestors = SimpleAction & {
  ancestors?: Command[];
};

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

  @property({ attribute: false })
  accessor commands: Command[] | undefined = [
    {
      label: "select serviceflow",
      value: "select serviceflow",
      options: [
        {
          label: "hr",
          value: "HR",
          options: [
            {
              label: "employee onboarding",
              value: "Employee Onboarding",
            },
            {
              label: "employee offboarding",
              value: "Employee Offboarding",
            },
          ],
        },
      ],
    },
    {
      label: "create project",
      value: "create project",
    },
  ];

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

  @event({ type: "command.select" })
  accessor #commandSelect!: EventEmitter<string | null>;

  #handleCommandSelect = (command: string | null) => {
    this.#commandSelect.emit(command);
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
        onSubmit={this.#handleMessageSubmit}
        onEmployeeMention={this.#handleEmployeeMention}
        onCommandSelect={this.#handleCommandSelect}
        ref={this.ref}
      />
    );
  }
}

interface ChatBoxComponentProps extends ChatBoxProps {
  onSubmit: (value: string) => void;
  onEmployeeMention: (employee: AIEmployee | null) => void;
  onCommandSelect: (command: string | null) => void;
  ref?: React.Ref<ChatBoxRef>;
}

interface MentionPopover {
  style: React.CSSProperties;
  range: {
    start: number;
    end: number;
  };
  actions: ActionWithAncestors[];
}

function LegacyChatBoxComponent(
  {
    disabled,
    placeholder,
    autoFocus,
    aiEmployees,
    commands,
    onSubmit,
    onEmployeeMention,
    onCommandSelect,
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
  const [activeActionIndexes, setActiveActionIndexes] = useState<number[]>([0]);
  const [commandPopover, setCommandPopover] = useState<MentionPopover | null>(
    null
  );
  const [commandText, setCommandText] = useState("");
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const store = window.__elevo_try_it_out;
    if (store) {
      delete window.__elevo_try_it_out;
    }
    if (typeof store?.content === "string") {
      valueRef.current = store.content;
      setValue(store.content);
    }
  }, []);

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

  const submitWithoutCommand = useCallback(
    (value: string) => {
      onSubmit(value.slice(commandText?.length ?? 0));
    },
    [commandText?.length, onSubmit]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLTextAreaElement>) => {
      if (e.currentTarget.value) {
        submitWithoutCommand(e.currentTarget.value);
      }
    },
    [submitWithoutCommand]
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
          const matchedEmployees = aiEmployees
            .filter(
              (employee) =>
                employee.employeeId.toLowerCase().includes(mentionText) ||
                employee.name.toLowerCase().includes(mentionText)
            )
            .slice(0, 10);
          if (matchedEmployees.length > 0) {
            const position = getCaretPositionInTextarea(
              e.currentTarget,
              selectionStart
            );
            const textareaRect = e.currentTarget.getBoundingClientRect();
            setMentionPopover({
              style: {
                left: position.left + 10 + textareaRect.left,
                top: position.top + 22 + textareaRect.top,
                position: "absolute",
                zIndex: 1,
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

      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        commands?.length
      ) {
        const previousContent = value.slice(0, selectionStart);
        if (previousContent.startsWith("/")) {
          const commandText = previousContent.slice(1).toLowerCase();
          const matchedCommands = commands
            .filter((command) =>
              command.label.toLowerCase().includes(commandText)
            )
            .slice(0, 10);
          if (matchedCommands.length > 0) {
            const position = getCaretPositionInTextarea(
              e.currentTarget,
              selectionStart
            );
            const textareaRect = e.currentTarget.getBoundingClientRect();
            setCommandPopover({
              style: {
                left: position.left + 10 + textareaRect.left,
                top: position.top + 22 + textareaRect.top,
                position: "absolute",
                zIndex: 1,
              },
              range: { start: 0, end: selectionStart },
              actions: matchedCommands.map((command) => ({
                key: command.label,
                text: command.label,
                data: command,
                ancestors: [],
                items: getCommandSubMenu(command, []),
              })),
            });
            setActiveActionIndexes([0]);
            return;
          }
        }
      }
      setCommandPopover(null);
    },
    [aiEmployees, commands, mentionedText]
  );

  useEffect(() => {
    if (mentionedText && !value.includes(mentionedText)) {
      setMentionedText("");
      onEmployeeMention(null);
    }
  }, [mentionedText, onEmployeeMention, value]);

  useEffect(() => {
    if (commandText && !value.includes(commandText)) {
      setCommandText("");
      onCommandSelect(null);
    }
  }, [commandText, onCommandSelect, value]);

  const handleSubmitClick = useCallback(() => {
    submitWithoutCommand(valueRef.current);
  }, [submitWithoutCommand]);

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

  const commandOverlay = useMemo(() => {
    const element = textareaRef.current?.element;
    if (!commandText || !element) {
      return null;
    }
    const rect = getContentRectInTextarea(
      element,
      "",
      // Ignore the last space
      commandText.slice(0, -1)
    );
    return {
      left: rect.left - 1,
      top: rect.top - 1,
      width: rect.width + 4,
      height: rect.height + 4,
    };
  }, [commandText]);

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
      textareaRef.current?.focus();
    },
    [mentionPopover, onEmployeeMention]
  );

  const handleSelectCommand = useCallback(
    (action: ActionWithAncestors) => {
      const command = `/${[...action.ancestors!.map((an) => an.label), action.text].join(": ")} `;
      const prefix = `${valueRef.current.slice(0, commandPopover!.range.start)}${command}`;
      const newValue = `${prefix}${valueRef.current.slice(commandPopover!.range.end)}`;
      valueRef.current = newValue;
      selectionRef.current = { start: prefix.length, end: prefix.length };
      setValue(newValue);
      setCommandText(command);
      setCommandPopover(null);
      onCommandSelect(action.text);
      textareaRef.current?.focus();
    },
    [commandPopover, onCommandSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      switch (e.key) {
        case "Escape":
          if (!mentionPopover && !commandPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          setMentionPopover(null);
          setCommandPopover(null);
          return false;
        case "ArrowUp":
        case "ArrowDown": {
          if (!mentionPopover && !commandPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          if (mentionPopover) {
            setActiveActionIndex((prev) => {
              const nextIndex = prev + (e.key === "ArrowUp" ? -1 : 1);
              const total = mentionPopover.actions.length;
              const next = (total + nextIndex) % total;
              return next;
            });
          } else {
            setActiveActionIndexes((prev) => {
              let cursor = 0;
              let actions = commandPopover!.actions;
              const list: number[] = [];
              while (cursor < prev.length - 1) {
                const action = actions[prev[cursor]];
                if (isSubMenuAction(action)) {
                  actions = action.items;
                } else {
                  break;
                }
                list.push(prev[cursor]);
                cursor += 1;
              }
              const nextIndex = prev[cursor] + (e.key === "ArrowUp" ? -1 : 1);
              const total = actions.length;
              const next = (total + nextIndex) % total;
              list.push(next);
              return list;
            });
          }
          return false;
        }
        case "Enter":
          if (!mentionPopover && !commandPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          if (mentionPopover) {
            handleMention(mentionPopover.actions[activeActionIndex]);
          } else {
            const action = commandPopover!.actions[activeActionIndexes[0]];
            if (isSubMenuAction(action)) {
              setActiveActionIndexes((prev) => [...prev, 0]);
            } else {
              handleSelectCommand(action);
            }
          }
          return false;
        case "Delete":
        case "Backspace": {
          const popovers = [
            {
              textLength: mentionedText?.length,
              prefixLength: mentionPrefix.length,
            },
            {
              textLength: commandText?.length,
              prefixLength: 0,
            },
          ];

          for (const { textLength, prefixLength } of popovers) {
            if (textLength) {
              let { selectionStart, selectionEnd } = e.currentTarget;
              if (selectionStart === selectionEnd) {
                if (e.key === "Backspace") {
                  selectionStart -= 1;
                } else {
                  selectionEnd += 1;
                }
              }
              const currentStart = prefixLength;
              const currentEnd = currentStart + textLength;
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
          }
          break;
        }
      }
    },
    [
      activeActionIndex,
      activeActionIndexes,
      commandPopover,
      commandText?.length,
      handleMention,
      handleSelectCommand,
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
        {mentionOverlay && (
          <div className="mention-overlay" style={mentionOverlay} />
        )}
        {commandOverlay && (
          <div className="mention-overlay" style={commandOverlay} />
        )}
        {mentionPopover &&
          createPortal(
            <WrappedActions
              actions={mentionPopover.actions}
              style={mentionPopover.style}
              checkedKeys={[mentionPopover.actions[activeActionIndex].key!]}
              onActionClick={(e) => handleMention(e.detail)}
            />,
            document.body
          )}
        {commandPopover &&
          createPortal(
            <WrappedActions
              actions={commandPopover.actions}
              style={commandPopover.style}
              // checkedKeys={[commandPopover.actions[activeActionIndex].key!]}
              // noCheckSign
              {...getOpenedAndCheckedKeys(
                commandPopover.actions,
                activeActionIndexes
              )}
              onActionClick={(e) => handleSelectCommand(e.detail)}
            />,
            document.body
          )}
      </div>
    </div>
  );
}

function getCommandSubMenu(
  command: Command,
  ancestors: Command[]
): SimpleAction[] | undefined {
  return command.options?.map((subCommand) => {
    const nextAncestors = [...ancestors, command];
    return {
      key: subCommand.value,
      text: subCommand.label,
      data: subCommand,
      ancestors: nextAncestors,
      items: getCommandSubMenu(subCommand, nextAncestors),
    };
  });
}

function getOpenedAndCheckedKeys(
  actions: ActionWithAncestors[],
  activeIndexes: number[]
) {
  const openedKeys: (string | number)[] = [];
  let checkedKeys: (string | number)[] = [];
  let currentActions = actions;
  for (let i = 0; i < activeIndexes.length; i += 1) {
    const index = activeIndexes[i];
    const action = currentActions[index];
    if (action) {
      if (isSubMenuAction(action)) {
        openedKeys.push(action.key!);
        currentActions = action.items;
      } else {
        checkedKeys = [action.key!];
        break;
      }
    } else {
      break;
    }
  }
  return { openedKeys, checkedKeys };
}

function isSubMenuAction(
  action: SimpleAction | SubMenuAction
): action is SubMenuAction {
  return !!(action as SubMenuAction).items?.length;
}
