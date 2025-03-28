import type { CSSProperties } from "react";
import type { UseSingleBrickConf } from "@next-core/react-runtime";

export interface DiagramNode {
  id: DiagramNodeId;
  type?: string;
  [key: string]: unknown;
}

export interface DiagramEdge {
  source: string;
  target: string;
  type?: string;
  [key: string]: unknown;
}

export interface RenderedNode extends NodeRect {
  id: DiagramNodeId;
  x0?: number;
  y0?: number;
  data: DiagramNode;
}

export interface NodeRect extends NodePosition {
  width: number;
  height: number;
}

export interface RenderedEdge {
  id?: string;
  points?: NodePosition[] | null;
  data: DiagramEdge;
  labelpos?: "c" | "l" | "r";
  width?: number;
  height?: number;
  labelSize?: LabelSize;
}

export interface LabelSize {
  center?: SizeTuple;
  start?: SizeTuple;
  end?: SizeTuple;
}

export interface RenderedDiagram {
  nodes: RenderedNode[];
  edges: RenderedEdge[];
}

export interface NormalizedLine {
  line: LineConf & {
    strokeColor: string;
    strokeWidth: number;
    interactStrokeWidth: number;
    type: LineType;
    curveType: CurveType;
    overrides?: LineConfOverrides;
    $id: string;
  };
  markers: NormalizedLineMarker[];
  edge: DiagramEdge;
}

export type LineType = "auto" | "curve" | "straight" | "polyline";
export type NormalizedLineType = LineType;

export interface NormalizedLineMarker {
  index: number;
  placement: LineMarkerPlacement;
  type: LineMarkerType;
  variant: "default" | "active" | "active-related";
  offset: number;
}

export interface LineLabel {
  text?: TextOptions;
  label?: LineLabelConf;
  id: string;
  edge: DiagramEdge;
}

export interface RenderedLine extends NormalizedLine {
  d: string;
  angle?: number;
  labelSize?: LabelSize;
}

export interface RenderedLineLabel {
  text?: TextOptions;
  label?: LineLabelConf;
  edge: DiagramEdge;
  position: PositionTuple;
  lineRect: SimpleRect;
  id: string;
  lineId: string;
  placement: string;
  angle?: number;
  size?: SizeTuple;
}

export type PositionTuple = [x: number, y: number];
export type SizeTuple = [width: number, height: number];
export type RangeTuple = [min: number, max: number];

export type LineMarkerType = "arrow" | "circle" | "0..1" | "0..N";
export type LineMarkerPlacement = "start" | "end";

export interface LineMarker {
  type: LineMarkerType;
  strokeColor: string;
}

export type DiagramNodeId = string /* | number */;

export type RefRepository = Map<DiagramNodeId, HTMLElement>;

export interface NodeBrickConf {
  useBrick: UseSingleBrickConf;
  nodeType?: string | string[];
  if?: string | boolean | null;
}

export interface NodePosition {
  x: number;
  y: number;
}

export type CurveType = `curve${string}`;

export interface LineConf extends LineConfOverridable {
  edgeType?: string | string[];
  if?: string | boolean | null;
  draw?: boolean;
  type?: LineType;
  interactable?: boolean;
  curveType?: CurveType;
  arrow?: boolean;
  text?: TextOptions | TextOptions[];
  label?: LineLabelConf | LineLabelConf[];
  cursor?: React.CSSProperties["cursor"];
  overrides?: LineConfOverrides;
  markers?: LineMarkerConf[];
}

export interface LineMarkerConf {
  placement?: LineMarkerPlacement;
  type?: LineMarkerType;
}

export interface LineConfOverrides {
  active?: LineConfOverridable;
  activeRelated?: LineConfOverridable;
}

export interface LineConfOverridable {
  strokeColor?: string;
  strokeWidth?: number;
  interactStrokeWidth?: number;
}

export interface LineLabelConf {
  if?: string | boolean | null;
  useBrick: UseSingleBrickConf;
  placement?: LineLabelPlacement;
  /**
   * 当 placement 设置为 start 或 end 时，默认情况下，文本中心点与连线起点或终点重合。
   * 设置 offset 表示文本中心点距离起点或终点在连线上的偏移量。
   */
  offset?: number;
}

export interface TextOptions {
  content: string;
  style?: CSSProperties;
  placement?: LineLabelPlacement;
  offset?: number;
}

export type LineLabelPlacement = "center" | "start" | "end";

export interface TransformLiteral {
  k: number;
  x: number;
  y: number;
}

export type LayoutOptions = LayoutOptionsDagre | LayoutOptionsForce;

export interface LayoutOptionsDagre extends BaseLayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
  ranksep?: number;
  edgesep?: number;
  nodesep?: number;
  align?: "UL" | "UR" | "DL" | "DR";
}

export interface LayoutOptionsForce extends BaseLayoutOptions {
  dummyNodesOnEdges?: number;
  collide?: boolean | ForceCollideOptions;
}

export interface ForceCollideOptions {
  dummyRadius?: number;
  radiusDiff?: number;
  strength?: number;
  iterations?: number;
}

export interface BaseLayoutOptions {
  nodePadding?: PartialRectTuple;
}

export type PartialRectTuple =
  | number
  | [all: number]
  | [vertical: number, horizontal: number]
  | [top: number, horizontal: number, bottom: number]
  | [top: number, right: number, bottom: number, left: number];

export type FullRectTuple = [
  top: number,
  right: number,
  bottom: number,
  left: number,
];

export type Direction = "top" | "right" | "bottom" | "left";

export interface LineLabelRect extends SimpleRect {
  lineId: string;
}

export type LineMaskRects = Map<string, SimpleRect[]>;

export interface SimpleRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface LineTarget {
  id: string;
  edge: DiagramEdge;
}

export interface ConnectLineDetail {
  source: DiagramNode;
  target: DiagramNode;
}

export interface ConnectNodesOptions extends NodesFilterOptions {
  strokeColor?: string;
  strokeWidth?: number;
  arrow?: boolean;
}

export interface DragNodesOptions extends NodesFilterOptions {
  save?: UserViewQuery;
}

export interface NodesFilterOptions {
  sourceType?: string | string[];
  if?: string | boolean | null;
}

export interface ConnectLineState {
  from: PositionTuple;
  options: ConnectNodesOptions;
}

export type ActiveTarget = ActiveTargetOfNode | ActiveTargetOfEdge;

export interface ActiveTargetOfNode {
  type: "node";
  nodeId: string;
}

export interface ActiveTargetOfEdge {
  type: "edge";
  edge: DiagramEdge;
}

export interface UnifiedGraph {
  layout: string;
  getNode(id: string): RenderedNode | undefined;
  applyLayout(context: ApplyLayoutContext): RenderedDiagram | null;
}

export interface ApplyLayoutContext {
  manualLayoutStatus: ManualLayoutStatus;
  nodesRefRepository: RefRepository;
  lineLabelsRefRepository: RefRepository;
  normalizedLinesMap: WeakMap<DiagramEdge, string>;
  nodeMovement?: NodeMovement | null;
}

export interface NodeMovement {
  id: string;
  move: PositionTuple;
}

export type ManualLayoutStatus = "initial" | "started" | "finished";

export interface UserView {
  instanceId?: string;
  nodes?: NodeUserView[];
}

export interface NodeUserView extends NodePosition {
  id: string;
}

export interface UserViewQuery {
  namespace: string;
  key: string;
}

export type UserViewNodesMap = Map<string, NodeUserView>;
