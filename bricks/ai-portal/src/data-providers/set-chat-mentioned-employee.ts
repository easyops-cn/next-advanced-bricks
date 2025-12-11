import { createProviderClass } from "@next-core/utils/general";

let chatEmployee: ChatMentionedEmployee | null = null;

interface ChatMentionedEmployee {
  name: string;
  employeeId: string;
}

export function setChatMentionedEmployee(
  chatMentionedEmployee: ChatMentionedEmployee | null
): void {
  chatEmployee = chatMentionedEmployee;
}

export function getChatMentionedEmployee(): ChatMentionedEmployee | null {
  return chatEmployee;
}

customElements.define(
  "ai-portal.set-chat-mentioned-employee",
  createProviderClass(setChatMentionedEmployee)
);
