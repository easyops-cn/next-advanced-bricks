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
import { ReactNextElement } from "@next-core/react-element";
import {
  getCaretPositionInTextarea,
  getContentRectsInTextarea,
  TextareaAutoResize,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { SimpleAction, SubMenuAction } from "@next-bricks/basic/actions";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import {
  getChatCommand,
  setChatCommand,
} from "../data-providers/set-chat-command.js";
import type {
  ChatPayload,
  CommandPayload,
  UploadOptions,
} from "../shared/interfaces.js";
import {
  getNextUid,
  UploadButton,
  type UploadButtonRef,
} from "../shared/FileUpload/UploadButton.js";
import { UploadedFiles } from "../shared/FileUpload/UploadedFiles.js";
import UploadedFilesStyleText from "../shared/FileUpload/UploadedFiles.shadow.css";
import { WrappedActions, WrappedIcon } from "./bricks.js";
import { useFilesUploading } from "../shared/useFilesUploading.js";
import GlobalDragOverlay from "../shared/FileUpload/GlobalDragOverlay.js";

initializeI18n(NS, locales);

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

export interface Command {
  label: string;
  value: string;
  options?: Command[];
  payload?: CommandPayload;
}

type ActionWithAncestors = SimpleAction & {
  key: string | number;
  ancestors?: Command[];
  items?: ActionWithAncestors[];
  payload?: CommandPayload;
};

/**
 * 构件 `ai-portal.chat-box`
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

  @event({ type: "command.select" })
  accessor #commandSelect!: EventEmitter<CommandPayload | null>;

  #handleCommandSelect = (command: CommandPayload | null) => {
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
        uploadOptions={this.uploadOptions}
        onMessageSubmit={this.#handleMessageSubmit}
        onChatSubmit={this.#handleChatSubmit}
        onCommandSelect={this.#handleCommandSelect}
        ref={this.ref}
      />
    );
  }
}

interface ChatBoxComponentProps extends ChatBoxProps {
  onMessageSubmit: (value: string) => void;
  onChatSubmit: (payload: ChatPayload) => void;
  onCommandSelect: (command: CommandPayload | null) => void;
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
    uploadOptions,
    onMessageSubmit,
    onChatSubmit,
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
  const [mentionOverlay, setMentionOverlay] = useState<
    React.CSSProperties[] | null
  >(null);
  const [mentionedText, setMentionedText] = useState("");
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const [activeActionIndexes, setActiveActionIndexes] = useState<number[]>([0]);
  const [command, setCommand] = useState<CommandPayload | null>(null);
  const [mentioned, setMentioned] = useState<string | null>(null);
  const [commandPopover, setCommandPopover] = useState<MentionPopover | null>(
    null
  );
  const [commandOverlay, setCommandOverlay] = useState<
    React.CSSProperties[] | null
  >(null);
  const [commandText, setCommandText] = useState("");
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

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

  const doSubmit = useCallback(
    (value: string) => {
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
      if (e.currentTarget.value && allFilesDone) {
        doSubmit(e.currentTarget.value);
      }
    },
    [doSubmit, allFilesDone]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value, selectionStart, selectionEnd } = e.target;
      valueRef.current = value;
      setValue(value);

      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        aiEmployees?.length
      ) {
        const previousContent = value.slice(0, selectionStart);
        if (previousContent.startsWith("@")) {
          const mentionText = previousContent.slice(1).toLowerCase();
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
              range: { start: 0, end: selectionStart },
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
                key: command.value,
                text: command.label,
                data: command,
                ancestors: [],
                items: getCommandSubMenu(command, []),
                payload: command.payload,
              })),
            });
            setActiveActionIndexes([0]);
            return;
          }
        }
      }
      setCommandPopover(null);
    },
    [aiEmployees, commands]
  );

  useEffect(() => {
    if (mentionedText && !value.includes(mentionedText)) {
      setMentionedText("");
      setMentioned(null);
    }
  }, [mentionedText, value]);

  useEffect(() => {
    if (commandText && !value.includes(commandText)) {
      setCommandText("");
      setCommand(null);
      onCommandSelect(null);
    }
  }, [commandText, onCommandSelect, value]);

  const handleSubmitClick = useCallback(() => {
    doSubmit(valueRef.current);
  }, [doSubmit]);

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

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (!mentionedText || !element) {
      setMentionOverlay(null);
      return;
    }
    const rects = getContentRectsInTextarea(
      element,
      "",
      // Ignore the last space
      mentionedText.slice(0, -1)
    );
    setMentionOverlay(
      rects.map((rect) => ({
        left: rect.left - 1,
        top: rect.top - 1,
        width: rect.width + 4,
        height: rect.height + 4,
      }))
    );
  }, [mentionedText, hasFiles]);

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (!commandText || !element) {
      setCommandOverlay(null);
      return;
    }
    const rects = getContentRectsInTextarea(
      element,
      "",
      // Ignore the last space
      commandText.slice(0, -1)
    );
    setCommandOverlay(
      rects.map((rect) => ({
        left: rect.left - 1,
        top: rect.top - 1,
        width: rect.width + 4,
        height: rect.height + 4,
      }))
    );
  }, [commandText, hasFiles]);

  const chatCommand = useMemo(() => {
    const command = getChatCommand();
    if (command) {
      setChatCommand(null);
    }
    return command;
  }, []);

  useEffect(() => {
    if (chatCommand) {
      setCommand(chatCommand.payload);
      onCommandSelect(chatCommand.payload);
    }
  }, [chatCommand, onCommandSelect]);

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (chatCommand && element) {
      const commandStr = `/${chatCommand.command} `;
      const rects = getContentRectsInTextarea(
        element,
        "",
        // Ignore the last space
        commandStr.slice(0, -1)
      );
      setCommandOverlay(
        rects.map((rect) => ({
          left: rect.left - 1,
          top: rect.top - 1,
          width: rect.width + 4,
          height: rect.height + 4,
        }))
      );
      valueRef.current = commandStr;
      selectionRef.current = {
        start: commandStr.length,
        end: commandStr.length,
      };
      setValue(commandStr);
      setCommandText(commandStr);
    }
  }, [chatCommand]);

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
      setMentioned((action as { data?: AIEmployee }).data!.employeeId);
      textareaRef.current?.focus();
    },
    [mentionPopover]
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
      setCommand(action.payload!);
      onCommandSelect(action.payload!);
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
              let { actions } = commandPopover!;
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
        case "ArrowLeft":
        case "ArrowRight":
          if (mentionPopover) {
            if (e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              handleMention(mentionPopover.actions[activeActionIndex]);
              return false;
            }
          } else if (commandPopover) {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();

            if (e.key === "ArrowLeft") {
              if (activeActionIndexes.length > 1) {
                setActiveActionIndexes((prev) => prev.slice(0, -1));
              }
              return false;
            }

            let cursor = 0;
            let { actions } = commandPopover!;
            let action: ActionWithAncestors | undefined;
            while (cursor < activeActionIndexes.length) {
              action = actions[activeActionIndexes[cursor]];
              if (isSubMenuAction(action)) {
                actions = action.items;
              } else {
                break;
              }
              cursor += 1;
            }
            if (action) {
              if (isSubMenuAction(action)) {
                setActiveActionIndexes((prev) => [...prev, 0]);
              } else if (e.key === "Enter") {
                handleSelectCommand(action);
              }
            }
            return false;
          }
          break;
        case "Delete":
        case "Backspace": {
          const popovers = [
            {
              textLength: mentionedText.length,
              prefixLength: 0,
            },
            {
              textLength: commandText.length,
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
      commandText.length,
      handleMention,
      handleSelectCommand,
      mentionPopover,
      mentionedText.length,
    ]
  );

  const commandCheckedKeys = useMemo(() => {
    if (!commandPopover) {
      return [];
    }
    let actions = commandPopover.actions;
    const checkedKeys: (string | number)[] = [];
    for (let i = 0; i < activeActionIndexes.length; i += 1) {
      const index = activeActionIndexes[i];
      const action = actions[index];
      if (action) {
        if (isSubMenuAction(action)) {
          checkedKeys.push(action.key!);
          actions = action.items;
        } else {
          checkedKeys.push(action.key!);
          break;
        }
      } else {
        break;
      }
    }
    return checkedKeys;
  }, [activeActionIndexes, commandPopover]);

  const uploadButtonRef = useRef<UploadButtonRef>(null);

  const onFilesDropped = useCallback(
    (files: File[]) => {
      appendFiles(
        files.map((file) => ({
          uid: getNextUid(),
          file,
          status: "ready",
        }))
      );
      textareaRef.current?.focus();
    },
    [appendFiles]
  );

  const sendDisabled =
    !value ||
    !allFilesDone ||
    (!!mentionedText && value.length <= mentionedText.length) ||
    (!!commandText && value.length <= commandText.length);

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
              <slot name="actions"></slot>
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
                activeKeys={[mentionPopover.actions[activeActionIndex].key!]}
                onActionClick={(e) => handleMention(e.detail)}
              />,
              document.body
            )}
          {commandPopover &&
            createPortal(
              <WrappedActions
                actions={commandPopover.actions}
                style={commandPopover.style}
                activeKeys={commandCheckedKeys}
                onActionClick={(e) =>
                  handleSelectCommand(e.detail as ActionWithAncestors)
                }
              />,
              document.body
            )}
        </div>
      </div>
      <GlobalDragOverlay
        disabled={!uploadEnabled || exceeded}
        accept={uploadAccept}
        dragTips={uploadOptions?.dragTips}
        onFilesDropped={onFilesDropped}
      />
    </>
  );
}

function getCommandSubMenu(
  command: Command,
  ancestors: Command[]
): ActionWithAncestors[] | undefined {
  return command.options?.map((subCommand) => {
    const nextAncestors = [...ancestors, command];
    return {
      key: subCommand.value,
      text: subCommand.label,
      data: subCommand,
      ancestors: nextAncestors,
      items: getCommandSubMenu(subCommand, nextAncestors),
      payload: subCommand.payload,
    };
  });
}

function isSubMenuAction(
  action: SimpleAction | SubMenuAction
): action is SubMenuAction {
  return !!(action as SubMenuAction).items?.length;
}
