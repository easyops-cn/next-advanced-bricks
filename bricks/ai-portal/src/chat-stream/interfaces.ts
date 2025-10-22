import type { CommandPayload, Job } from "../shared/interfaces.js";

export type ChatMessage = MessageFromUser | MessageFromAssistant;

export interface MessageFromUser {
  role: "user";
  content: string;
  cmd?: CommandPayload;
}

export interface MessageFromAssistant {
  role: "assistant";
  jobs: Job[];
  error?: string | null;
}
