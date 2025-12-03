import type {
  ActivityRun,
  CommandPayload,
  FileInfo,
  Job,
  ServiceFlowRun,
  Task,
} from "../shared/interfaces.js";

export type ChatMessage = MessageFromUser | MessageFromAssistant;

export interface MessageFromUser {
  role: "user";
  content: string;
  cmd?: CommandPayload;
  mentionedAiEmployeeId?: string;
  fromSkippedSubTask?: boolean;
  files?: FileInfo[];
}

export interface MessageFromAssistant {
  role: "assistant";
  chunks: MessageChunk[];
}

export type MessageChunk =
  | MessageChunkOfJob
  | MessageChunkOfPlan
  | MessageChunkOfAskUser
  | MessageChunkOfFlow
  | MessageChunkOfActivity
  | MessageChunkOfError;

export interface MessageChunkOfJob {
  type: "job";
  job: Job;
  level: number;
  fromSkippedSubTask?: boolean;
}

export interface MessageChunkOfPlan {
  type: "plan";
  task: Task;
}

export interface MessageChunkOfAskUser {
  type: "askUser";
  job: Job;
  task: Task | undefined;
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
