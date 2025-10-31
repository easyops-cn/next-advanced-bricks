import { createProviderClass } from "@next-core/utils/general";
import type { CommandPayload } from "../shared/interfaces.js";

export interface ChatCommand {
  command?: string;
  payload: CommandPayload;
}

let chatCommand: ChatCommand | null = null;

export function setChatCommand(command: ChatCommand | null): void {
  chatCommand = command;
}

export function getChatCommand(): ChatCommand | null {
  return chatCommand;
}

customElements.define(
  "ai-portal.set-chat-command",
  createProviderClass(setChatCommand)
);
