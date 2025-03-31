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

export type RawNode = RequirementRawNode | InstructionRawNode | GroupRawNode | ToolRawNode | SummarizeRawNode;

export interface RequirementRawNode extends BaseRawNode {
  type: "requirement";
  content: string;
}

export interface InstructionRawNode extends BaseRawNode {
  type: "instruction";
  content: string;
}

export interface GroupRawNode extends BaseRawNode {
  type: "group";
  groupChildren: string[];
}

export interface ToolRawNode extends BaseRawNode {
  type: "tool";
  tag: string;
  content: string;
}

export interface SummarizeRawNode extends BaseRawNode {
  type: "summarize";
  content: string;
}

export interface BaseRawNode {
  id: string;
  type: string;
  title?: string;
  parent?: string;
  finished?: boolean;
  view?: NodeView;
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
  source: string;
  target: string;
  points: NodePosition[];
}
