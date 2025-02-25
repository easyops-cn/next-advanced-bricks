import type { UseSingleBrickConf } from "@next-core/react-runtime";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import type { ResizeCellPayload } from "./reducers/interfaces";
import type {
  CurveType,
  LineLabelConf,
  LineMarkerConf,
  LineMarkerType,
  NodePosition,
  PartialRectTuple,
  PositionTuple,
  TextOptions,
  TransformLiteral,
} from "../diagram/interfaces";
import type {
  SYMBOL_FOR_SIZE_INITIALIZED,
  SYMBOL_FOR_LAYOUT_INITIALIZED,
} from "./constants";

export type Cell = NodeCell | EdgeCell | DecoratorCell;

export type BrickCell = NodeBrickCell /*  | EdgeBrickCell */;

export type NodeCell = NodeBrickCell /* | NodeShapeCell */;

export type NodeBrickCell = BaseBrickCell & BaseNodeCell;

export type NodeId = string /* | number */;

export interface BaseBrickCell extends BaseCell {
  tag?: "brick";
  useBrick?: UseSingleBrickConf;
}

export interface BaseNodeCell extends BaseCell {
  type: "node";
  id: NodeId;
  containerId?: NodeId;
  view: NodeView;
  [SYMBOL_FOR_SIZE_INITIALIZED]?: boolean;
  [SYMBOL_FOR_LAYOUT_INITIALIZED]?: boolean;
}

export interface EdgeCell extends BaseCell {
  type: "edge";
  source: NodeId;
  target: NodeId;
  view?: EdgeView;
}

export type DecoratorType = "text" | "area" | "container" | "rect" | "line";
export type Direction = "top" | "right" | "bottom" | "left";

export interface DecoratorCell extends BaseCell {
  type: "decorator";
  decorator: DecoratorType;
  id: NodeId;
  view: DecoratorView;
}

export interface LineDecoratorCell extends Omit<DecoratorCell, "view"> {
  decorator: "line";
  view: DecoratorLineView;
}

export interface BaseCell {
  type: "node" | "edge" | "decorator";
  data?: unknown;
}

export interface NodeView extends InitialNodeView {
  width: number;
  height: number;
}

export interface DecoratorView extends NodeView {
  /** 用于文本装饰器和容器装饰器 */
  text?: string;
  /** 设置容器装饰器的文本位置 */
  direction?: Direction;
  vertices?: NodePosition[] | null;
}

export interface DecoratorLineView extends NodeView, BaseEdgeLineConf {
  source: NodePosition;
  target: NodePosition;
  vertices?: NodePosition[] | null;
  exitPosition?: undefined;
  entryPosition?: undefined;
}

export type EditableLineCell = EdgeCell | DecoratorCell;
export type EditableLineView = EdgeView | DecoratorLineView;

export interface InitialNodeView {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export type InitialNodeCell = Omit<NodeCell, "view"> & {
  view?: InitialNodeView;
};

export type InitialCell = InitialNodeCell | EdgeCell | DecoratorCell;

export interface NodeBrickConf {
  useBrick: UseSingleBrickConf;
  if?: string | boolean | null;
}

export interface EdgeView extends LineSettings {
  exitPosition?: NodePosition | null;
  entryPosition?: NodePosition | null;
  vertices?: NodePosition[] | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface EdgeLineConf extends BaseEdgeLineConf {
  if?: string | boolean | null;
}

export type LineType = "straight" | "curve" | "polyline";

export interface LineSettings {
  type?: LineType;
  curveType?: CurveType;
}

export interface LineAnimate {
  useAnimate: boolean;
  duration: number;
}

export interface ComputedEdgeLineConf
  extends Required<Omit<BaseEdgeLineConf, "overrides">> {
  $markerStartUrl: string;
  $markerEndUrl: string;
  $activeMarkerStartUrl?: string;
  $activeMarkerEndUrl?: string;
  $activeRelatedMarkerStartUrl?: string;
  $activeRelatedMarkerEndUrl?: string;
  overrides?: EdgeLineConfOverrides;
}

export interface BaseEdgeLineConf {
  type?: LineType;
  curveType?: CurveType;
  dashed?: boolean;
  dotted?: boolean;
  strokeWidth?: number;
  strokeColor?: string;
  interactStrokeWidth?: number;
  parallelGap?: number;
  markers?: LineMarkerConf[];
  callLabelOnDoubleClick?: string;
  text?: TextOptions;
  label?: LineLabelConf;
  /**
   * @deprecated 已废弃，使用markers代替，配置了对应的箭头侧则显示
   */
  showStartArrow?: boolean;
  /**
   * @deprecated 已废弃，使用markers代替，配置了对应的箭头侧则显示
   */
  showEndArrow?: boolean;
  animate?: LineAnimate;
  overrides?: EdgeLineConfOverrides;
  jumps?: boolean;
}

export interface EdgeLineConfOverrides {
  active?: EdgeLineConfOverridable;
  activeRelated?: EdgeLineConfOverridable;
}

export interface EdgeLineConfOverridable {
  strokeWidth?: number;
  strokeColor?: string;
  motion?: EdgeLineMotion;
}

export interface EdgeLineMotion {
  shape?: EdgeLineMotionShape;
  /** 移动速度，单位 px/s，默认为 50 */
  speed?: number;
  /** 尺寸，默认为当前 strokeWidth * 4 */
  size?: number;
}

export type EdgeLineMotionShape = "dot" | "triangle" | "none";

export interface LineMarker {
  strokeColor: string;
  markerType: LineMarkerType;
}

export type LineConnecterConf = Pick<
  BaseEdgeLineConf,
  "strokeWidth" | "strokeColor" | "showStartArrow" | "showEndArrow"
> & {
  editingStrokeColor?: string;
};

export type ComputedLineConnecterConf = ComputedEdgeLineConf & {
  editingStrokeColor: string;
  $editingStartMarkerUrl: string;
  $editingEndMarkerUrl: string;
};

export type ActiveTarget = ActiveTargetOfSingular | ActiveTargetOfMulti;

export type ActiveTargetOfSingular =
  | ActiveTargetOfNode
  | ActiveTargetOfEdge
  | ActiveTargetOfDecorator;

export interface ActiveTargetOfNode {
  type: "node";
  id: NodeId;
}

export interface ActiveTargetOfEdge {
  type: "edge";
  source: NodeId;
  target: NodeId;
}

export interface ActiveTargetOfDecorator {
  type: "decorator";
  id: NodeId;
}

export interface ActiveTargetOfMulti {
  type: "multi";
  targets: ActiveTargetOfSingular[];
}

export interface BasicDecoratorProps {
  cell: DecoratorCell;
  transform: TransformLiteral;
  readOnly?: boolean;
  layout?: LayoutType;
  view: DecoratorView;
  layoutOptions?: LayoutOptions;
  active?: boolean;
  activeTarget: ActiveTarget | null | undefined;
  cells: Cell[];
  lineConfMap: WeakMap<EditableLineCell, ComputedEdgeLineConf>;
  editableLineMap: WeakMap<EditableLineCell, EditableLine>;
  onCellResizing?(info: ResizeCellPayload): void;
  onCellResized?(info: ResizeCellPayload): void;
  onSwitchActiveTarget?(activeTarget: ActiveTarget | null): void;
  onDecoratorTextEditing?(detail: { id: string; editing: boolean }): void;
  onDecoratorTextChange?(detail: DecoratorTextChangeDetail): void;
}

export interface CellContextMenuDetail {
  cell: Cell;
  clientX: number;
  clientY: number;
}

export interface ConnectLineState {
  source: NodeCell | DecoratorCell;
  from: PositionTuple;
  offset: PositionTuple;
}

export interface SmartConnectLineState {
  source: NodeCell;
  from: PositionTuple;
  offset: PositionTuple;
  exitPosition: NodePosition;
}

export interface Deferred<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

export interface ConnectNodesDetail {
  source: NodeCell | DecoratorCell;
  target: NodeCell | DecoratorCell;
  view?: EdgeView;
}

export interface DecoratorTextChangeDetail {
  id: string;
  view: DecoratorView | DecoratorLineView;
}

export type LayoutType = "manual" | "force" | "dagre" | undefined;

export type LayoutOptions =
  | LayoutOptionsManual
  | LayoutOptionsDagre
  | LayoutOptionsForce;

export interface LayoutOptionsManual extends LayoutSnapOptions {}

export interface LayoutSnapOptions {
  /** Snap options. Setting to true means enable all snap options */
  snap?: boolean | SnapOptions;
}

export interface SnapOptions {
  /** Snap to grid */
  grid?: boolean | SnapToGridOptions;
  /** Snap to object */
  object?: boolean | SnapToObjectOptions;
}

export interface SnapToGridOptions {
  /** @default 10 */
  size?: number;
}

export interface SnapToObjectOptions {
  /** @default 5 */
  distance?: number;
  /**
   * 默认为 "all"，在中心、上下左右共五个位置进行对齐。
   * 设置为 "center" 表示只对中心进行对齐。
   * 可以按顺序设置对齐位置，例如 "center top bottom" 表示只对中心和上下共三个位置进行对齐。
   *
   * @default "all"
   */
  positions?: string;
}

export type SnapToObjectPosition =
  | "center"
  | "top"
  | "right"
  | "bottom"
  | "left";

export interface LayoutOptionsDagre extends BaseLayoutOptions {
  rankdir?: "TB" | "BT" | "LR" | "RL";
  ranksep?: number;
  edgesep?: number;
  nodesep?: number;
  align?: "UL" | "UR" | "DL" | "DR";
}

export interface LayoutOptionsForce extends BaseLayoutOptions {
  collide?: boolean | ForceCollideOptions;
}

export interface ForceCollideOptions {
  radiusDiff?: number;
  strength?: number;
  iterations?: number;
}

export interface BaseLayoutOptions extends LayoutSnapOptions {
  nodePadding?: PartialRectTuple;

  /**
   * 根据节点什么位置进行对齐，支持关键字、百分比和比例值。
   * 第一个值为 x 轴，第二个值为 y 轴。
   * 使用数字时，表示相对于节点的宽高的比例。
   *
   * 注意，节点宽高将包含 nodePadding 的值。
   *
   * @default ["center","center"]
   *
   * @example
   * [0, 0] // left-top
   * [0.5, 0.5] // center
   * [1, 1] // right-bottom
   * ["center", "center"] // center
   * ["50%", "50%"] // center
   * ["left", "top"]
   * ["right", "bottom"]
   */
  alignOrigin?: AlignOrigin;
}

export type AlignOrigin = [x: string | number, y: string | number];
export type NormalizedAlignOrigin = [x: number, y: number];

export interface ForceNode extends SimulationNodeDatum {
  id: NodeId;
  width: number;
  height: number;
}

export type ForceLink = SimulationLinkDatum<ForceNode>;

export interface NodeConnectPoint extends NodePosition {
  d: Direction[];
}

export type LineEditorState =
  | LineEditorStateOfEndPoint
  | LineEditorStateOfControl;

export interface LineEditorStateOfEndPoint {
  type: "exit" | "entry";
  offset: PositionTuple;
  from: PositionTuple;
}

export interface LineEditorStateOfControl {
  type: "control" | "corner" | "break";
  offset: PositionTuple;
  from: PositionTuple;
  control: ControlPoint;
}

export type BiDirection = "ns" | "ew";

/**
 * A control point for editing line is the middle point of a line segment.
 *
 * Direction means the control point changes on the what direction,
 * ns means north-south, ew means east-west.
 *
 * ```
 *      C1  ┌─────┐
 *    ┌──⊙──┤  T  │
 * C0 ⊙     └─────┘
 * ┌──┴──┐
 * │  S  │
 * └─────┘
 * ```
 */
export interface ControlPoint extends NodePosition {
  type: "control" | "corner" | "break";
  direction?: BiDirection;
  index: number;
}

export type EditableLine = EditableEdgeLine | EditableDecoratorLine;

export interface EditableEdgeLine extends BaseEditableLine {
  edge: EdgeCell;
  source: NodeBrickCell | DecoratorCell;
  target: NodeBrickCell | DecoratorCell;
}

export interface EditableDecoratorLine extends BaseEditableLine {
  decorator: DecoratorCell;
}

export interface BaseEditableLine {
  points: NodePosition[];
  parallelGap: number;
  jumpsMap?: Map<number, LineSegmentJumps> | null;
}

export type PositionAndAngle = [
  x: number,
  y: number,
  direction: Direction | "center",
  angle: number,
  offset: number,
];

/**
 * 一段线段上的交叉跨线点列表
 */
export interface LineSegmentJumps {
  /** 交叉跨线圆弧的中心点列表，这些点应该遵循从线段起点到终点的顺序 */
  jumpPoints: NodePosition[];
  /** 该线段在整个连线中的索引 */
  index: number;
  /** 交叉跨线圆弧的半径 */
  radius: number;
}
