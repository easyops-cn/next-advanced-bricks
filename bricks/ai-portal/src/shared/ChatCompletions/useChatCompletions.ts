import { useCallback, useEffect, useRef, useState } from "react";
import type { SimpleAction } from "@next-bricks/basic/actions";
import {
  getCaretPositionInTextarea,
  getContentRectsInTextarea,
  type TextareaAutoResizeRef,
} from "@next-shared/form";
import type { CommandPayload } from "../interfaces";
import { getInitialContent } from "../ReadableCommand/ReadableCommand";
import type { ChatCommand } from "../../data-providers/set-chat-command";

export const MAX_SHOWN_COMMANDS = 10;

export interface MentionPopover {
  style: React.CSSProperties;
  range: {
    start: number;
    end: number;
  };
  actions: ActionWithSubCommands[];
}

export type ActionWithSubCommands = SimpleAction & {
  key: string | number;
  subCommands?: Command[];
  payload?: CommandPayload;
};

export interface Command {
  label: string;
  value: string;
  groupKey?: string;
  groupLabel?: string;
  subCommands?: Command[];
  payload?: CommandPayload;
}

export interface AIEmployee {
  employeeId: string;
  name: string;
}

export interface UseChatMentionsParams {
  aiEmployees?: AIEmployee[];
  commands?: Command[];
  root: HTMLElement;
  hasFiles: boolean;
  /** @default "bottom" */
  placement?: "top" | "bottom";
}

export function useChatCompletions({
  aiEmployees,
  commands: propCommands,
  root,
  hasFiles,
  placement,
}: UseChatMentionsParams) {
  const textareaRef = useRef<TextareaAutoResizeRef>(null);
  const [value, setValue] = useState("");
  const valueRef = useRef("");
  const [activeActionIndex, setActiveActionIndex] = useState(0);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  // Mentions start
  const [mentionPopover, setMentionPopover] = useState<MentionPopover | null>(
    null
  );
  const [mentionOverlay, setMentionOverlay] = useState<
    React.CSSProperties[] | null
  >(null);
  const [mentionedText, setMentionedText] = useState("");
  const [mentioned, setMentioned] = useState<string | null>(null);
  const [initialMention, setInitialMention] = useState<string | null>(null);

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
                ...(placement === "top"
                  ? {
                      bottom:
                        window.innerHeight - textareaRect.top - position.top,
                    }
                  : { top: position.top + 22 + textareaRect.top }),
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
    [placement]
  );

  // Show mention suggestions once candidates are loaded
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
  }, [aiEmployees, root, textareaRef, showMentionSuggestions]);

  useEffect(() => {
    if (mentionedText && !value.startsWith(mentionedText)) {
      setMentionedText("");
      setMentioned(null);
    }
  }, [mentionedText, value]);

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (!mentionedText || !element) {
      setMentionOverlay(null);
      return;
    }
    setMentionOverlay(getOverlayRects(element, mentionedText));
  }, [mentionedText, hasFiles]);

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (initialMention && element) {
      setMentioned(initialMention);
      const mentionStr = `${getInitialContent(undefined, initialMention)} `;
      setMentionOverlay(getOverlayRects(element, mentionStr));
      valueRef.current = mentionStr;
      selectionRef.current = {
        start: mentionStr.length,
        end: mentionStr.length,
      };
      setValue(mentionStr);
      setMentionedText(mentionStr);
    }
  }, [initialMention]);

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
  // Mentions end

  // Commands start
  const [commandPrefix, setCommandPrefix] = useState("/");
  const [commands, setCommands] = useState<Command[] | undefined>(propCommands);
  const [command, setCommand] = useState<CommandPayload | null>(null);
  const [commandPopover, setCommandPopover] = useState<MentionPopover | null>(
    null
  );
  const [commandOverlay, setCommandOverlay] = useState<
    React.CSSProperties[] | null
  >(null);
  const [commandText, setCommandText] = useState("");
  const [initialCommand, setInitialCommand] = useState<ChatCommand | null>(
    null
  );

  useEffect(() => {
    setCommands(propCommands);
  }, [propCommands]);

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
              selectionStart,
              placement
            );
            setCommandPopover(popover);
            setActiveActionIndex(0);
            return true;
          }
        }
      }
      setCommandPopover(null);
    },
    [placement]
  );

  // Show command suggestions once candidates are loaded
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

  useEffect(() => {
    if (
      !value.startsWith(commandPrefix) ||
      (commandText && !value.startsWith(commandText))
    ) {
      setCommandText("");
      setCommand(null);
      setCommands(propCommands);
      setCommandPrefix("/");
      setCommandPopover(null);
    }
  }, [commandPrefix, commandText, value, propCommands]);

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (!commandText || !element) {
      setCommandOverlay(null);
      return;
    }
    setCommandOverlay(getOverlayRects(element, commandText));
  }, [commandText, hasFiles]);

  useEffect(() => {
    const element = textareaRef.current?.element;
    if (initialCommand && element) {
      setCommand(initialCommand.payload);
      const commandStr = `/${initialCommand.command} `;
      setCommandOverlay(getOverlayRects(element, commandStr));
      valueRef.current = commandStr;
      selectionRef.current = {
        start: commandStr.length,
        end: commandStr.length,
      };
      setValue(commandStr);
      setCommandText(commandStr);
    }
  }, [initialCommand]);

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
            prefix.length,
            placement
          );
          setCommandPopover(popover);
          setActiveActionIndex(0);
        }, 100);
      } else {
        setCommandText(command);
        setCommand(action.payload!);
        setCommandPopover(null);
        setCommandPrefix("/");
      }
      textareaRef.current?.focus();
    },
    [commandPopover, commandPrefix, placement]
  );
  // Commands end

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

  const mentionActiveKeys = mentionPopover
    ? getActiveActionKeys(mentionPopover.actions, activeActionIndex)
    : null;
  const commandActiveKeys = commandPopover
    ? getActiveActionKeys(commandPopover.actions, activeActionIndex)
    : null;

  return {
    textareaRef,
    valueRef,
    value,
    setValue,
    selectionRef,

    mentioned,
    mentionedText,
    mentionPopover,
    mentionOverlay,
    mentionActiveKeys,
    setInitialMention,
    handleMention,

    command,
    commandText,
    commandPrefix,
    commandPopover,
    commandOverlay,
    commandActiveKeys,
    setInitialCommand,
    handleSelectCommand,

    handleChange,
    handleKeyDown,
  };
}

function getActiveActionKeys(
  actions: ActionWithSubCommands[],
  index: number
): (string | number)[] {
  const meaningfulActions = getMeaningfulActions(actions);
  return [meaningfulActions[index].key!];
}

function getMeaningfulActions(
  actions: ActionWithSubCommands[]
): ActionWithSubCommands[] {
  return actions.filter(
    (action) =>
      (action as any).type !== "group" && (action as any).type !== "divider"
  );
}

function getOverlayRects(element: HTMLTextAreaElement, content: string) {
  const rects = getContentRectsInTextarea(
    element,
    "",
    // Ignore the last space
    content.slice(0, -1)
  );
  return rects.map((rect) => ({
    left: rect.left - 1,
    top: rect.top - 1,
    width: rect.width + 4,
    height: rect.height + 4,
  }));
}

function getCommandPopover(
  commands: Command[],
  textarea: HTMLTextAreaElement,
  selectionStart: number,
  placement?: "top" | "bottom"
): MentionPopover {
  const position = getCaretPositionInTextarea(textarea, selectionStart);
  const textareaRect = textarea.getBoundingClientRect();
  return {
    style: {
      left: position.left + 10 + textareaRect.left,
      ...(placement === "top"
        ? { bottom: window.innerHeight - textareaRect.top - position.top }
        : { top: position.top + 22 + textareaRect.top }),
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
