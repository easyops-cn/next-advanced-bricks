import type { ParsedApp } from "@next-tsx/parser";

export interface Conversation {
  // Conversation ID
  id: string;

  // 根据用户需求自动生成的会话标题
  title: string;

  projectId?: string;

  state: ConversationState;

  tasks: Task[];

  serviceFlows: ServiceFlowRun[];

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

  state: TaskState;

  jobs: Job[];

  startTime: number;
  endTime?: number;

  aiEmployeeId?: string;

  // 复杂任务的计划。由于计划可调整，因此 SSE 接口每次更新时需返回全量的数据，不更新则不返回。
  plan?: PlanStep[];
}

export interface PlanStep {
  // 步骤名称
  name: string;

  // 开始执行时对应的 job ID，可以是原子 job，也可以是容器 job（包含子任务）
  jobId?: string;
}

export type ConversationState =
  | "working"
  | "completed"
  | "failed"
  | "input-required"
  | "terminated";

export type TaskState = "working" | "input-required" | "completed" | "failed";

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

  // When setting `type: subTask` or `type: serviceFlow`, the job is a container job.
  type?: "default" | "subTask" | "serviceFlow";

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

  // Human in-the-loop 信息
  hil?: {
    userInstanceId: string;
    username: string;
  };

  aiEmployeeId?: string;

  username?: string;

  cmd?: CommandPayload;

  // @ 的数字人 ID
  mentionedAiEmployeeId?: string;

  // 忽略该容器在 chat 模式下的自动详情展示，但仍可主动点击查看详情
  ignoreDetails?: boolean;
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

export type ConversationBaseDetail = Omit<
  Conversation,
  "tasks" | "serviceFlows"
>;

export interface ConversationPatch
  extends Omit<Partial<Conversation>, "tasks" | "serviceFlows"> {
  tasks?: TaskPatch[];

  error?: string;

  time?: number;

  // 新增返回运行的 service flows
  serviceFlows?: ServiceFlowPatch[];
}

export interface TaskPatch extends Omit<Partial<Task>, "jobs"> {
  id: string;
  jobs?: JobPatch[];
}

export interface JobPatch extends Partial<Job> {
  id: string;
}

export interface RequestStore extends ChatPayload {
  conversationId: string;
}

export interface UploadFileInfo {
  fileId: string;
}

export interface UploadOptions {
  enabled?: boolean;
  dragDisabled?: boolean;
  dragTips?: string;
  accept?: string;
  maxFiles?: number;
  /** In bytes */
  maxSize?: number;
  readableAccept?: string;
  readableMaxSize?: string;
}

export interface ChatPayload extends ExtraChatPayload {
  content: string;
}

export interface ExtraChatPayload {
  files?: UploadFileInfo[];
  cmd?: CommandPayload | null;
  aiEmployeeId?: string | null;
}

export interface GeneratedView {
  viewId: string;
  code: string;
  isStaticData?: boolean;
  from?: "generate" | "config";
  withContexts?: Record<string, unknown>;
  asyncConstructedView?: Promise<ParsedView | null>;
}

export interface ParsedView extends ParsedApp {
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
  taskId?: string;
  error?: string;
}

export type CommandPayload =
  | CommandPayloadServiceFlowStart
  | CommandPayloadServiceFlowCreate
  | CommandPayloadServiceFlowEdit
  | CommandPayloadGoalPlan
  | LegacyCommandPayloadServiceFlowStarting;

export interface BaseCommandPayload {
  type: string;
  payload?: unknown;
}

export interface CommandPayloadServiceFlowStart extends BaseCommandPayload {
  type: "serviceflow-start";
  payload: {
    spaceInstanceId: string;
    spaceName?: string;
    flowInstanceId?: string;
    flowName?: string;
  };
}

export interface CommandPayloadServiceFlowCreate extends BaseCommandPayload {
  type: "serviceflow-create";
  payload: {
    spaceInstanceId: string;
    spaceName?: string;
  };
}

export interface CommandPayloadServiceFlowEdit extends BaseCommandPayload {
  type: "serviceflow-edit";
  payload: {
    spaceInstanceId: string;
    spaceName?: string;
    flowInstanceId: string;
    flowName?: string;
  };
}

export interface CommandPayloadGoalPlan extends BaseCommandPayload {
  type: "goal-plan";
  payload: {
    goalId: string;
    goalName?: string;
    description?: string;
  };
}

/** @deprecated Use `payload` instead */
export interface LegacyCommandPayloadServiceFlowStarting {
  type: "serviceFlowStarting";
  serviceFlowStarting: {
    spaceInstanceId?: string;
    spaceName?: string;
    flowInstanceId?: string;
    flowName?: string;
  };
}

export interface ServiceFlowRun {
  taskId: string;
  // Flow 定义的实例 ID
  flowInstanceId: string;
  name: string;

  // 增量 spec 或全量 fullSpec 根据情况选择其中一种返回
  spec: StageRun[];

  space: CollaborationSpace;
}

export interface StageRun {
  name: string;
  serviceFlowActivities: ActivityRun[];
}

export interface ActivityRun {
  taskId?: string;
  name: string;
}

export interface CollaborationSpace {
  instanceId: string;
  name: string;
}

export interface ServiceFlowPatch
  extends Partial<Omit<ServiceFlowRun, "spec">> {
  taskId: string;

  // 增量 spec 或全量 fullSpec 根据情况选择其中一种返回
  spec?: StagePatch[];
  fullSpec?: StageRun[];

  space?: CollaborationSpace;
}

export interface StagePatch {
  name: string;
  serviceFlowActivities?: ActivityRun[];
}

export interface ActivityWithFlow {
  flow: ServiceFlowRun;
  activity: ActivityRun;
}

export interface ActiveDetail {
  type: "job" | "flow" | "activity";
  id: string;
}

export type FulfilledActiveDetail =
  | ActiveDetailOfJob
  | ActiveDetailOfFlow
  | ActiveDetailOfActivity;

export interface ActiveDetailOfJob {
  type: "job";
  job: Job;
}

export interface ActiveDetailOfFlow {
  type: "flow";
  flow: ServiceFlowRun;
}

export interface ActiveDetailOfActivity {
  type: "activity";
  activity: ActivityRun;
  flow: ServiceFlowRun;
}

export interface PlanProgressStep {
  name: string;
  taskId?: string;
  state?: TaskState;
}

export interface ActiveImages {
  files: FileInfo[];
  file: FileInfo;
}
