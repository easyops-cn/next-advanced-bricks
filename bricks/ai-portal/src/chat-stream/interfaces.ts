import type { Job } from "../shared/interfaces.js";

export type ChatMessage = MessageFromUser | MessageFromAssistant;

export interface MessageFromUser {
  role: "user";
  content: string;
}

export interface MessageFromAssistant {
  role: "assistant";
  jobs: Job[];
  error?: string | null;
}
