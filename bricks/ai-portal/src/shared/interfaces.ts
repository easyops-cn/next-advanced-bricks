import type { ParseResult } from "@next-shared/tsx-parser";

export interface Conversation {
  // Conversation ID
  id: string;

  // 根据用户需求自动生成的会话标题
  title: string;

  projectId?: string;

  state: ConversationState;

  tasks: Task[];

  startTime: number;
  endTime?: number;
  finished?: boolean;
}

export interface Task {
  // Task ID
  id: string;

  // Upstream task IDs
  upstream?: string[];

  // Parent task ID
  parent?: string;

  // 根据用户需求自动生成的任务标题use
  // title: string;

  // User requirement
  // requirement: string;

  // attachments?: File[];

  state: TaskState;

  plan: Step[];

  jobs: Job[];

  startTime: number;
  endTime?: number;

  aiEmployeeId?: string;
}

export type ConversationState =
  | "working"
  | "completed"
  | "failed"
  | "input-required"
  | "terminated";

export type TaskState =
  | "free"
  | "confirming"
  | "executing"
  | "completed"
  | "failed";

export type JobState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed"
  | "skipped"
  | "unknown";

export interface Job {
  // Job ID
  id: string;

  // Upstream job IDs
  upstream?: string[];

  // Parent job ID
  parent?: string;

  // Instruction from plan
  instruction?: string;

  state: JobState;

  toolCall?: ToolCall;

  messages?: Message[];

  isError?: boolean;

  hidden?: boolean;

  startTime: number;
  endTime?: number;

  generatedView?: GeneratedView;

  // 要求用户选择动作
  requestHumanAction?: HumanAction;

  // 用户选择的动作
  humanAction?: string;

  aiEmployeeId?: string;

  username?: string;
}

export type HumanAction = HumanActionConfirm | HumanActionSelect;

export interface HumanActionConfirm {
  type: "confirm";
  confirmText: string;
}

export interface HumanActionSelect {
  type: "select";
  options: string[];
}

export interface Step {
  // Pre-generated Job ID for this step
  id: string;

  // The instruction for this step
  instruction: string;
}

export interface Message {
  role: string;
  parts: Part[];
}

export type Part = TextPart | FilePart | DataPart;

export interface TextPart {
  type: "text";
  text: string;
}

export interface FilePart {
  type: "file";
  file: FileInfo;
}

export interface FileInfo {
  name?: string;
  mimeType?: string;
  size?: number; // in bytes
  // oneof {
  bytes?: string; // base64 encoded content
  uri?: string;
  // }
}

// 自定义结构化信息，用于个性化 UI 显示
export interface DataPart {
  type: "data";
  data: Record<string, any>;
}

export interface ToolCall {
  name: string;
  arguments?: Record<string, unknown>;
  argumentsParseFailed?: boolean;
  argumentsParseError?: unknown;
  originalArguments?: string;
  annotations?: {
    title?: string;
  };
}

export type ConversationBaseDetail = Omit<Conversation, "tasks">;

export interface ConversationPatch
  extends Omit<Partial<Conversation>, "tasks"> {
  tasks?: TaskPatch[];

  error?: string;

  time?: number;
}

export interface TaskPatch extends Omit<Partial<Task>, "jobs"> {
  id: string;
  jobs?: JobPatch[];
}

export interface JobPatch extends Partial<Job> {
  id: string;
}

export interface RequestStore {
  conversationId: string;
  content: string;
}

export interface GeneratedView {
  viewId: string;
  code: string;
  isStaticData?: boolean;
  from?: "generate" | "config";
  withContexts?: Record<string, unknown>;
  asyncConstructedView?: Promise<ParsedView | null>;
}

export interface ParsedView extends ParseResult {
  viewId: string;
  withContexts?: Record<string, unknown>;
}

export interface ShowCaseType {
  conversationId: string;
  title: string;
  summary: string;
  scenario: string;
  url?: string;
}

export interface ExampleProject {
  instanceId: string;
  name: string;
  url?: string;
}

export interface ConversationError {
  jobs: string[];
  error?: string;
}
