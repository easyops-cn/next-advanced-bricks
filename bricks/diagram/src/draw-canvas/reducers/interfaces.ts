import type {
  NodePosition,
  PositionTuple,
  SizeTuple,
} from "../../diagram/interfaces";
import type {
  Cell,
  DecoratorCell,
  DecoratorLineView,
  DecoratorType,
  DecoratorView,
  EdgeCell,
  NodeCell,
  NodeId,
} from "../interfaces";

export interface DrawCanvasState {
  cells: Cell[];
  layoutKey: number;
}

export type DrawCanvasAction =
  | DropNodeAction
  | DropDecoratorAction
  | AddNodeAction
  | AddEdgeAction
  | ChangeEdgeViewAction
  | ChangeDecoratorViewAction
  | MoveCellsAction
  | ResizeCellAction
  | UpdateCellsAction
  | UpdateNodeSizeAction;

export interface DropNodeAction {
  type: "drop-node";
  payload: NodeCell;
}

export interface DropDecoratorAction {
  type: "drop-decorator";
  payload: DecoratorCell;
}

export interface AddNodeAction {
  type: "add-nodes";
  payload: NodeCell[];
}

export interface AddEdgeAction {
  type: "add-edge";
  payload: EdgeCell;
}

export interface ChangeEdgeViewAction {
  type: "change-edge-view";
  payload: EdgeViewChangePayload;
}

export interface ChangeDecoratorViewAction {
  type: "change-decorator-view";
  payload: DecoratorViewChangePayload;
}

export interface MoveCellsAction {
  type: "move-cells";
  payload: MoveCellPayload[];
}

export interface ResizeCellAction {
  type: "resize-cell";
  payload: ResizeCellPayload;
}

export interface UpdateCellsAction {
  type: "update-cells";
  payload: Cell[];
}

export interface UpdateNodeSizeAction {
  type: "update-node-size";
  payload: {
    id: string;
    size: SizeTuple | null;
  };
  layoutKey: number;
}

export type LineTuple = [start: PositionTuple, end: PositionTuple];

export interface MoveCellPayload {
  type: "node" | "decorator";
  id: NodeId;
  x: number;
  y: number;
  width?: number;
  height?: number;
  decorator?: DecoratorType;
  /**
   * 容器装饰器单元格,用于handleNodeContainedChange事件
   */
  containerCell?: DecoratorCell;
  groupId?: NodeId;
  containerId?: NodeId;
  guideLines?: LineTuple[];
  source?: NodePosition;
  target?: NodePosition;
  vertices?: NodePosition[];
}

export interface ResizeCellPayload {
  type: "node" | "decorator";
  id: NodeId;
  width: number;
  height: number;
}

export interface MoveNodePayload {
  id: NodeId;
  x: number;
  y: number;
}

export type EdgeViewChangePayload = Pick<
  EdgeCell,
  "source" | "target" | "view"
>;

export type DecoratorViewChangePayload = {
  id: NodeId;
  view: DecoratorView | DecoratorLineView;
};
