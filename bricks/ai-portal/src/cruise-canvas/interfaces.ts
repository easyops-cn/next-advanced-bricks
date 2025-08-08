import type { ConstructResult } from "@next-shared/jsx-storyboard";
import type { JSONSchema } from "./json-schema";
import type { ViewWithInfo } from "./utils/converters/interfaces";

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
  | ViewGraphNode
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

export interface ViewGraphNode extends BaseGraphNode {
  type: "view";
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
  view?: NodeRect;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface NodeRect extends NodePosition {
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

  hidden?: boolean;

  startTime: number;
  endTime?: number;

  componentGraph?: ComponentGraph;
  generatedView?: ConstructResult | ViewWithInfo;
  level?: number;
}

export interface TaskPatch extends Omit<Partial<Task>, "jobs"> {
  jobs?: JobPatch[];

  error?: string;

  time?: number;
}

export interface JobPatch extends Partial<Job> {
  id: string;
}

export type BaseState =
  | "submitted"
  | "working"
  | "input-required"
  | "completed"
  | "canceled"
  | "failed"
  | "unknown";

export type JobState = BaseState | "skipped";

export type TaskState = JobState | "paused" | "confirming-plan";

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

export interface RawComponentGraphNode {
  id: string;
  name: string;
  description?: string;
  status?: "trouble" | "ok";
  children?: string[];
}

export interface ComponentGraph {
  initial: boolean;
  nodes: ComponentGraphNode[];
  edges: ComponentGraphEdge[];
}

export interface ComponentGraphNode {
  type: "node";
  id: string;
  data: RawComponentGraphNode;
}

export interface ComponentGraphEdge extends GraphEdge {
  type: "edge";
}

export interface GraphNavItem {
  id: string;
  title: string;
  state: JobState;
  level: number;
}

export interface GraphGeneratedView {
  id: string;
  view: ConstructResult | ViewWithInfo;
}

export interface CmdbInstanceDetailData {
  type: "cmdb_instance_detail";
  objectId: string;
  detail: Record<string, any>;
  outputSchema?: JSONSchema | string;
}

export type ZoomAction =
  | ZoomActionLiteral
  | ((current: TransformLiteral) => ZoomActionLiteral | null);

export type ZoomActionLiteral = ZoomActionTransform | ZoomActionTranslateBy;

export interface ZoomActionTransform {
  transform: Partial<TransformLiteral>;
  translateBy?: undefined;
  duration?: number;
}

export interface ZoomActionTranslateBy {
  translateBy: [x: number, y: number];
  transform?: undefined;
  duration?: number;
}
