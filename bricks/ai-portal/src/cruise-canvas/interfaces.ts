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

export type RawNode = RequirementRawNode | InstructionRawNode | ToolRawNode;

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

export interface ToolRawNode extends BaseRawNode {
  jobId: string;
  type: "tool";
  tag: string;
  content: string;
}

export interface BaseRawNode {
  id: string;
  type: string;
  title?: string;
  view?: NodeView;
  content?: string;
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
