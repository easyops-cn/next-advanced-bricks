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

export type RawNode = RequirementRawNode | InstructionRawNode | JobRawNode;

export interface RawEdge {
  source: string;
  target: string;
}

export interface RequirementRawNode extends BaseRawNode {
  type: "requirement";
  content: string;
}

export interface InstructionRawNode extends BaseRawNode {
  jobId: string;
  type: "instruction";
  content: string;
}

export interface JobRawNode extends BaseRawNode {
  jobId: string;
  type: "job";
  tag: string;
  messages: Message[];
}

export interface BaseRawNode {
  id: string;
  type: string;
  title?: string;
  view?: NodeView;
  state?: string;
}

export type Node = RawNode | StartNode | EndNode;

export interface StartNode extends BaseRawNode {
  type: "start";
}

export interface EndNode extends BaseRawNode {
  type: "end";
}

export interface NodeView extends NodePosition {
  width: number;
  height: number;
}

export interface Edge {
  points: NodePosition[];
}

export interface Task {
  // Task ID
  id: string;

  // User requirement
  requirement: string;

  // attachments?: File[];

  state: TaskState;

  plan: Step[];

  jobs: Job[];
}

export interface Step {
  // Pre-generated Job ID for this step
  id: string;

  // The instruction for this step
  instruction: string;
}

export interface Job {
  // Job ID
  id: string;

  // Parent job ID
  parent?: string[];

  // Instruction from plan
  instruction?: string;

  // The agent/tool tag used for this job
  // E.g., "online-search" or "generate-image"
  tag: string;

  state: JobState;

  messages?: Message[];
}

export interface TaskPatch extends Omit<Partial<Task>, "jobs"> {
  jobs?: JobPatch[];
}

export interface JobPatch extends Partial<Job> {
  id: string;
}

export type TaskState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed"
  | "unknown";

export type JobState = TaskState;

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
  data: Record<string, any>;
}
