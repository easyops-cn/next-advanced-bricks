import { createProviderClass } from "@next-core/utils/general";

interface Command {
  command: string;
  payload?: unknown;
}

let chatCommand: Command | null = null;

export function setChatCommand(command: Command | null): void {
  chatCommand = command;
}

export function getChatCommand(): Command | null {
  return chatCommand;
}

customElements.define(
  "ai-portal.set-chat-command",
  createProviderClass(setChatCommand)
);
