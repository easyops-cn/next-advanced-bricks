export type RangeTuple = [min: number, max: number];
export type SizeTuple = [width: number, height: number];

export interface NodePosition {
  x: number;
  y: number;
}

export interface TransformLiteral {
  k: number;
  x: number;
  y: number;
}

export type GraphNode =
  | RequirementGraphNode
  | InstructionGraphNode
  | JobGraphNode
  | StartGraphNode
  | EndGraphNode;

export interface RequirementGraphNode extends BaseGraphNode {
  type: "requirement";
  content: string;
}

export interface InstructionGraphNode extends BaseGraphNode {
  type: "instruction";
  job: Job;
}

export interface JobGraphNode extends BaseGraphNode {
  type: "job";
  job: Job;
}

export interface StartGraphNode extends BaseGraphNode {
  type: "start";
}

export interface EndGraphNode extends BaseGraphNode {
  type: "end";
}

export interface BaseGraphNode {
  id: string;
  type: string;
  state?: JobState;
  view?: NodeView;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface NodeView extends NodePosition {
  width: number;
  height: number;
}

export interface Edge {
  points: NodePosition[];
}

export type TaskBaseDetail = Omit<Task, "jobs">;

export interface Task {
  // Task ID
  id: string;

  // 根据用户需求自动生成的任务标题
  title: string;

  // User requirement
  requirement: string;

  // attachments?: File[];

  state: TaskState;

  plan: Step[];

  jobs: Job[];

  startTime: number;
  endTime?: number;
}

export interface Step {
  // Pre-generated Job ID for this step
  id: string;

  // The instruction for this step
  instruction: string;
}

export interface StepWithState extends Step {
  state?: JobState;
}

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

  startTime: number;
  endTime?: number;
}

export interface TaskPatch extends Omit<Partial<Task>, "jobs"> {
  jobs?: JobPatch[];

  error?: string;
}

export interface JobPatch extends Partial<Job> {
  id: string;
}

export type JobState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed"
  | "unknown";

export type TaskState = JobState | "confirming-plan";

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
  file: {
    name?: string;
    mimeType?: string;
    // oneof {
    bytes?: string; // base64 encoded content
    uri?: string;
    // }
  };
}

// 自定义结构化信息，用于个性化 UI 显示
export interface DataPart {
  type: "data";
  data: Record<string, unknown>;
}

export interface ToolCall {
  name: string;
  arguments?: Record<string, unknown>;
  argumentsParseFailed?: boolean;
  argumentsParseError?: unknown;
  originalArguments?: string;
}
