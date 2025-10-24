import type {
  ActivityRun,
  CommandPayload,
  Job,
  ServiceFlowRun,
  Task,
} from "../shared/interfaces.js";

export type ChatMessage = MessageFromUser | MessageFromAssistant;

export interface MessageFromUser {
  role: "user";
  content: string;
  cmd?: CommandPayload;
  fromSkippedSubTask?: boolean;
}

export interface MessageFromAssistant {
  role: "assistant";
  chunks: MessageChunk[];
}

export type MessageChunk =
  | MessageChunkOfJob
  | MessageChunkOfFlow
  | MessageChunkOfActivity
  | MessageChunkOfError;

export interface MessageChunkOfJob {
  type: "job";
  job: Job;
  level: number;
  fromSkippedSubTask?: boolean;
}

export interface MessageChunkOfFlow {
  type: "flow";
  flow: ServiceFlowRun;
  task: Task;
}

export interface MessageChunkOfActivity {
  type: "activity";
  activity: ActivityRun;
  flow: ServiceFlowRun;
  task: Task;
}

export interface MessageChunkOfError {
  type: "error";
  error: string;
}
