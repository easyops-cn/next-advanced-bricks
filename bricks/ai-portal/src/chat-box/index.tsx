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
import type { SimpleAction } from "@next-bricks/basic/actions";
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
  UploadButton,
  type UploadButtonRef,
} from "../shared/FileUpload/UploadButton.js";
import { UploadedFiles } from "../shared/FileUpload/UploadedFiles.js";
import UploadedFilesStyleText from "../shared/FileUpload/UploadedFiles.shadow.css";
import { WrappedActions, WrappedIcon } from "./bricks.js";
import { useFilesUploading } from "../shared/useFilesUploading.js";
import GlobalDragOverlay from "../shared/FileUpload/GlobalDragOverlay.js";

initializeI18n(NS, locales);

const MAX_SHOWN_COMMANDS = 10;

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
  groupKey?: string;
  groupLabel?: string;
  subCommands?: Command[];
  payload?: CommandPayload;
}

type ActionWithSubCommands = SimpleAction & {
  key: string | number;
  subCommands?: Command[];
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
        root={this}
        ref={this.ref}
      />
    );
  }
}

interface ChatBoxComponentProps extends ChatBoxProps {
  root: HTMLElement;
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
  actions: ActionWithSubCommands[];
}

function LegacyChatBoxComponent(
  {
    root,
    disabled,
    placeholder,
    autoFocus,
    aiEmployees,
    commands: propCommands,
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
  const [commandPrefix, setCommandPrefix] = useState("/");
  const [commands, setCommands] = useState<Command[] | undefined>(propCommands);
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

  useEffect(() => {
    setCommands(propCommands);
  }, [propCommands]);

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

  const showMentionSuggestions = useCallback(
    (textarea: HTMLTextAreaElement, employees: AIEmployee[] | undefined) => {
      const { value, selectionStart, selectionEnd } = textarea;
      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        employees?.length
      ) {
        const previousContent = value.slice(0, selectionStart);
        if (previousContent.startsWith("@")) {
          const mentionText = previousContent.slice(1).toLowerCase();
          const matchedEmployees = employees
            .filter(
              (employee) =>
                employee.employeeId.toLowerCase().includes(mentionText) ||
                employee.name.toLowerCase().includes(mentionText)
            )
            .slice(0, MAX_SHOWN_COMMANDS);
          if (matchedEmployees.length > 0) {
            const position = getCaretPositionInTextarea(
              textarea,
              selectionStart
            );
            const textareaRect = textarea.getBoundingClientRect();
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
            return true;
          }
        }
      }
      setMentionPopover(null);
    },
    []
  );

  const showCommandSuggestions = useCallback(
    (
      textarea: HTMLTextAreaElement,
      commandList: Command[] | undefined,
      prefix: string
    ) => {
      const { value, selectionStart, selectionEnd } = textarea;
      if (
        selectionStart !== null &&
        selectionStart === selectionEnd &&
        commandList?.length
      ) {
        const previousContent = value.slice(0, selectionStart);
        if (previousContent.startsWith(prefix)) {
          const searchText = previousContent.slice(prefix.length).toLowerCase();
          const matchedCommands = commandList
            .filter(
              (command) =>
                command.label.toLowerCase().includes(searchText) ||
                command.groupLabel?.toLowerCase().includes(searchText)
            )
            .slice(0, MAX_SHOWN_COMMANDS);
          if (matchedCommands.length > 0) {
            const popover = getCommandPopover(
              matchedCommands,
              textarea,
              selectionStart
            );
            setCommandPopover(popover);
            setActiveActionIndex(0);
            return true;
          }
        }
      }
      setCommandPopover(null);
    },
    []
  );

  // Show mention/commands suggestions once candidates are loaded
  const mentionInitializedRef = useRef(false);
  useEffect(() => {
    const textarea = textareaRef.current?.element;
    if (
      mentionInitializedRef.current ||
      !aiEmployees ||
      !textarea ||
      document.activeElement !== root ||
      root.shadowRoot?.activeElement !== textarea
    ) {
      return;
    }
    mentionInitializedRef.current = true;
    showMentionSuggestions(textarea, aiEmployees);
  }, [aiEmployees, root, showMentionSuggestions]);

  const commandsInitializedRef = useRef(false);
  useEffect(() => {
    const textarea = textareaRef.current?.element;
    if (
      commandsInitializedRef.current ||
      !propCommands ||
      !textarea ||
      document.activeElement !== root ||
      root.shadowRoot?.activeElement !== textarea
    ) {
      return;
    }
    commandsInitializedRef.current = true;
    showCommandSuggestions(textarea, propCommands, "/");
  }, [propCommands, root, showCommandSuggestions]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = e.target;
      valueRef.current = value;
      setValue(value);

      if (showMentionSuggestions(e.target, aiEmployees)) {
        return;
      }
      showCommandSuggestions(e.target, commands, commandPrefix);
    },
    [
      aiEmployees,
      commandPrefix,
      commands,
      showCommandSuggestions,
      showMentionSuggestions,
    ]
  );

  useEffect(() => {
    if (mentionedText && !value.startsWith(mentionedText)) {
      setMentionedText("");
      setMentioned(null);
    }
  }, [mentionedText, value]);

  useEffect(() => {
    if (
      !value.startsWith(commandPrefix) ||
      (commandText && !value.startsWith(commandText))
    ) {
      setCommandText("");
      setCommand(null);
      onCommandSelect(null);
      setCommands(propCommands);
      setCommandPrefix("/");
      setCommandPopover(null);
    }
  }, [commandPrefix, commandText, onCommandSelect, value, propCommands]);

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
    (action: ActionWithSubCommands) => {
      const hasSubCommands =
        action.subCommands && action.subCommands.length > 0;
      const command = `${commandPrefix.replace(/ $/, ": ")}${action.text} `;
      const prefix = `${valueRef.current.slice(0, commandPopover!.range.start)}${command}`;
      const newValue = `${prefix}${valueRef.current.slice(commandPopover!.range.end)}`;
      valueRef.current = newValue;
      selectionRef.current = { start: prefix.length, end: prefix.length };
      setValue(newValue);
      if (hasSubCommands) {
        if (action.payload) {
          setCommandText(command);
          setCommand(action.payload);
        }
        setCommands(action.subCommands);
        setCommandPrefix(command);
        // Wait for the textarea to update
        setTimeout(() => {
          const popover = getCommandPopover(
            action.subCommands!.slice(0, MAX_SHOWN_COMMANDS),
            textareaRef.current!.element!,
            prefix.length
          );
          setCommandPopover(popover);
          setActiveActionIndex(0);
        }, 100);
      } else {
        setCommandText(command);
        setCommand(action.payload!);
        setCommandPopover(null);
        setCommandPrefix("/");
        onCommandSelect(action.payload!);
      }
      textareaRef.current?.focus();
    },
    [commandPopover, commandPrefix, onCommandSelect]
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
          setActiveActionIndex((prev) => {
            const nextIndex = prev + (e.key === "ArrowUp" ? -1 : 1);
            const meaningfulActions = getMeaningfulActions(
              (mentionPopover || commandPopover)!.actions
            );
            const total = meaningfulActions.length;
            const next = (total + nextIndex) % total;
            return next;
          });
          return false;
        }
        case "Enter": {
          if (!mentionPopover && !commandPopover) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
          const activeAction = getMeaningfulActions(
            (mentionPopover || commandPopover)!.actions
          )[activeActionIndex];
          if (mentionPopover) {
            handleMention(activeAction);
          } else {
            handleSelectCommand(activeAction);
          }
          return false;
        }
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
      commandPopover,
      commandText.length,
      handleMention,
      handleSelectCommand,
      mentionPopover,
      mentionedText.length,
    ]
  );

  const uploadButtonRef = useRef<UploadButtonRef>(null);

  const onFilesDropped = useCallback(
    (files: File[]) => {
      appendFiles(files);
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
                activeKeys={getActiveActionKeys(
                  mentionPopover.actions,
                  activeActionIndex
                )}
                footerTips={t(K.COMMAND_TIPS)}
                onActionClick={(e) => handleMention(e.detail)}
              />,
              document.body
            )}
          {commandPopover &&
            createPortal(
              <WrappedActions
                actions={commandPopover.actions}
                style={commandPopover.style}
                activeKeys={getActiveActionKeys(
                  commandPopover.actions,
                  activeActionIndex
                )}
                footerTips={
                  commandPrefix === "/"
                    ? t(K.COMMAND_TIPS)
                    : t(K.SEARCH_COMMANDS_TIPS, { count: MAX_SHOWN_COMMANDS })
                }
                onActionClick={(e) =>
                  handleSelectCommand(e.detail as ActionWithSubCommands)
                }
              />,
              document.body
            )}
        </div>
      </div>
      <GlobalDragOverlay
        disabled={!uploadEnabled || exceeded}
        uploadOptions={uploadOptions}
        onFilesDropped={onFilesDropped}
      />
    </>
  );
}

function getMeaningfulActions(
  actions: ActionWithSubCommands[]
): ActionWithSubCommands[] {
  return actions.filter(
    (action) =>
      (action as any).type !== "group" && (action as any).type !== "divider"
  );
}

function getActiveActionKeys(
  actions: ActionWithSubCommands[],
  index: number
): (string | number)[] {
  const meaningfulActions = getMeaningfulActions(actions);
  return [meaningfulActions[index].key!];
}

function getCommandPopover(
  commands: Command[],
  textarea: HTMLTextAreaElement,
  selectionStart: number
): MentionPopover {
  const position = getCaretPositionInTextarea(textarea, selectionStart);
  const textareaRect = textarea.getBoundingClientRect();
  return {
    style: {
      left: position.left + 10 + textareaRect.left,
      top: position.top + 22 + textareaRect.top,
      position: "absolute",
      zIndex: 1,
    },
    range: { start: 0, end: selectionStart },
    actions: getGroupedCommandActions(commands),
  };
}

function getGroupedCommandActions(
  commands: Command[]
): ActionWithSubCommands[] {
  const grouped = commands.every((cmd) => cmd.groupKey && cmd.groupLabel);
  if (grouped) {
    const groups = new Map<string, { label: string; commands: Command[] }>();
    for (const command of commands) {
      const groupKey = command.groupKey!;
      let group = groups.get(groupKey);
      if (!group) {
        groups.set(
          groupKey,
          (group = {
            label: command.groupLabel!,
            commands: [],
          })
        );
      }
      group.commands.push(command);
    }
    return [...groups.values()].flatMap((group) => [
      {
        type: "group",
        text: group.label,
      },
      ...getCommandActions(group.commands),
    ]) as ActionWithSubCommands[];
  }

  return getCommandActions(commands);
}

function getCommandActions(commands: Command[]): ActionWithSubCommands[] {
  return commands.map((command) => ({
    key: command.value,
    text: command.label,
    subCommands: command.subCommands,
    payload: command.payload,
  }));
}
