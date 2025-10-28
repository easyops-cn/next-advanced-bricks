import type { JSONSchema } from "./json-schema";
import type {
  ActivityRun,
  CommandPayload,
  GeneratedView,
  Job,
  JobState,
  ServiceFlowRun,
} from "../shared/interfaces";

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
  | LoadingGraphNode
  | InstructionGraphNode
  | JobGraphNode
  | StartGraphNode
  | EndGraphNode
  | ErrorGraphNode
  | FeedbackGraphNode
  | ReplayGraphNode
  | FlowGraphNode
  | ActivityGraphNode;

export interface RequirementGraphNode extends BaseGraphNode {
  type: "requirement";
  content: string;
  username?: string;
  cmd?: CommandPayload;
}

export interface LoadingGraphNode extends BaseGraphNode {
  type: "loading";
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

export interface ErrorGraphNode extends BaseGraphNode {
  type: "error";
  content: string;
}

export interface FeedbackGraphNode extends BaseGraphNode {
  type: "feedback";
}

export interface ReplayGraphNode extends BaseGraphNode {
  type: "replay";
}

export interface FlowGraphNode extends BaseGraphNode {
  type: "flow";
  flow: ServiceFlowRun;
  taskId: string;
}

export interface ActivityGraphNode extends BaseGraphNode {
  type: "activity";
  activity: ActivityRun;
  flow: ServiceFlowRun;
  taskId: string;
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

export interface GraphNavItem {
  id: string;
  title: string;
  state: JobState;
  level: number;
}

export interface GraphGeneratedView {
  id: string;
  view: GeneratedView;
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

export interface FeedbackDetail {
  plan: string[];
  result: string[];
  feedback: string;
}
