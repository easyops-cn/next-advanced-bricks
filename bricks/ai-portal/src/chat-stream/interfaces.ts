import type { Job } from "../cruise-canvas/interfaces.js";

export type ChatMessage = MessageFromUser | MessageFromAssistant;

export interface MessageFromUser {
  role: "user";
  content: string;
}

export interface MessageFromAssistant {
  role: "assistant";
  jobs: Job[];
}
