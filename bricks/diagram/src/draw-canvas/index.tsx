import React, {
  createRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import type { UseSingleBrickConfOrRenderFunction } from "@next-core/react-runtime";
import { unwrapProvider } from "@next-core/utils/general";
import "@next-core/theme";
import { get, uniqueId } from "lodash";
import classNames from "classnames";
import { select } from "d3-selection";
import type { lockBodyScroll as _lockBodyScroll } from "@next-bricks/basic/data-providers/lock-body-scroll/lock-body-scroll";
import type {
  NodePosition,
  PositionTuple,
  RangeTuple,
  SizeTuple,
  TransformLiteral,
} from "../diagram/interfaces";
import type {
  ActiveTarget,
  Cell,
  EdgeCell,
  InitialCell,
  NodeBrickConf,
  NodeCell,
  NodeId,
  DecoratorCell,
  DecoratorType,
  CellContextMenuDetail,
  ConnectLineState,
  Deferred,
  ConnectNodesDetail,
  EdgeLineConf,
  DecoratorTextChangeDetail,
  NodeView,
  LayoutType,
  LayoutOptions,
  SmartConnectLineState,
  LineConnecterConf,
  Direction,
  LineEditorState,
  EdgeView,
  LineSettings,
  EditableLineCell,
  DecoratorView,
  DecoratorLineView,
} from "./interfaces";
import { rootReducer } from "./reducers";
import { MarkerComponent } from "../diagram/MarkerComponent";
import {
  isEdgeCell,
  isEdgeSide,
  isNodeCell,
  isDecoratorCell,
  isLineDecoratorCell,
} from "./processors/asserts";
import type {
  DecoratorViewChangePayload,
  EdgeViewChangePayload,
  LineTuple,
  MoveCellPayload,
  ResizeCellPayload,
} from "./reducers/interfaces";
import { sameTarget } from "./processors/sameTarget";
import { handleKeyboard } from "./processors/handleKeyboard";
import { CellComponent } from "./CellComponent";
import { ConnectLineComponent } from "./ConnectLineComponent";
import { initializeCells } from "./processors/initializeCells";
import { updateCells } from "./processors/updateCells";
import { getUnrelatedCells } from "./processors/getUnrelatedCells";
import {
  DEFAULT_NODE_SIZE,
  DEFAULT_AREA_WIDTH,
  DEFAULT_AREA_HEIGHT,
  DEFAULT_DEGRADED_THRESHOLD,
  DEFAULT_NODE_PADDING_FOR_SMART_LINES,
} from "./constants";
import { useZoom } from "../shared/canvas/useZoom";
import { useActiveTarget } from "../shared/canvas/useActiveTarget";
import { ZoomBarComponent } from "../shared/canvas/ZoomBarComponent";
import { useLayout } from "../shared/canvas/useLayout";
import { useReady } from "../shared/canvas/useReady";
import { useLineMarkers } from "../shared/canvas/useLineMarkers";
import { getConnectPointsOfRectangle } from "../shared/canvas/shapes/Rectangle";
import { LineConnectorComponent } from "./LineConnectorComponent";
import { HoverStateContext, type HoverState } from "./HoverStateContext";
import { handleLasso } from "./processors/handleLasso";
import styleText from "../shared/canvas/styles.shadow.css";
import zoomBarStyleText from "../shared/canvas/ZoomBarComponent.shadow.css";
import { SmartConnectLineComponent } from "./SmartConnectLineComponent";
import { cellToTarget } from "./processors/cellToTarget";
import { handleNodeContainedChange } from "./processors/handleNodeContainedChange";
import { LineEditorComponent } from "./LineEditorComponent";
import { EditingLineComponent } from "./EditingLineComponent";
import { useEditableLineMap } from "../shared/canvas/useEditableLineMap";
import { targetIsActive } from "./processors/targetIsActive";
import { getLockedContainerIds, isLocked } from "./processors/isLocked";
import { toggleLock } from "./processors/toggleLock";

const lockBodyScroll = unwrapProvider<typeof _lockBodyScroll>(
  "basic.lock-body-scroll"
);

const { defineElement, property, method, event } = createDecorators();

export interface EoDrawCanvasProps {
  cells: InitialCell[] | undefined;
  layout: LayoutType;
  layoutOptions?: LayoutOptions;
  defaultNodeSize: SizeTuple;
  defaultNodeBricks?: NodeBrickConf[];
  defaultEdgeLines?: EdgeLineConf[];
  degradedThreshold?: number;
  degradedNodeLabel?: string;
  activeTarget?: ActiveTarget | null;
  fadeUnrelatedCells?: boolean;
  zoomable?: boolean;
  scrollable?: boolean;
  pannable?: boolean;
  dragBehavior?: DragBehavior;
  ctrlDragBehavior?: CtrlDragBehavior;
  scaleRange?: RangeTuple;
  lineSettings?: LineSettings;
  lineConnector?: LineConnecterConf | boolean;
  allowEdgeToArea?: boolean;
  doNotResetActiveTargetOutsideCanvas?: boolean;
  doNotResetActiveTargetForSelector?: string;
}

export type DragBehavior = "none" | "lasso" | "grab";
export type CtrlDragBehavior = "none" | "grab";

export interface DropNodeInfo extends AddNodeInfo {
  /** [PointerEvent::clientX, PointerEvent::clientY] */
  position: PositionTuple;
}

export interface DropDecoratorInfo {
  decorator: DecoratorType;
  /** [PointerEvent::clientX, PointerEvent::clientY] */
  position: PositionTuple;
  text?: string;
  direction?: Direction;
  /**
   * Line decorator only: setting initial source position related to (0, 0)
   * @default {x:-30,y:30}
   */
  source?: NodePosition;
  /**
   * Line decorator only: setting initial source position related to (0, 0)
   * @default {x:30,y:-30}
   */
  target?: NodePosition;
  /** Override decorator view settings */
  view?: DecoratorView & DecoratorLineView;
}

export interface AddNodeInfo {
  id: NodeId;
  useBrick?: UseSingleBrickConfOrRenderFunction;
  data?: unknown;
  size?: SizeTuple;
  containerId?: NodeId;
  groupId?: NodeId;
}

export interface AddEdgeInfo {
  source: NodeId;
  target: NodeId;
  data?: unknown;
}

export interface UpdateCellsContext {
  reason: "add-related-nodes";
  //基于父节点添加
  parent?: NodeId;
  //基于某个点（可能当前添加时被删除：拆分集合点）的位置添加
  parentNode?: NodeCell;
}

export interface AddNodesContext {
  defaultNodeSize: SizeTuple;
  canvasWidth: number;
  canvasHeight: number;
}

export const EoDrawCanvasComponent = React.forwardRef(
  LegacyEoDrawCanvasComponent
);

export interface CanvasContextMenuDetail {
  clientX: number;
  clientY: number;
  view: {
    x: number;
    y: number;
  };
}

export interface EoDrawCanvasEventsMap {
  "activeTarget.change": CustomEvent<ActiveTarget | null>;
  "node.move": CustomEvent<MoveCellPayload>;
  "cell.move": CustomEvent<MoveCellPayload>;
  "cells.move": CustomEvent<MoveCellPayload[]>;
  "cell.resize": CustomEvent<ResizeCellPayload>;
  "node.delete": CustomEvent<Cell>;
  "cell.delete": CustomEvent<Cell>;
  "cells.delete": CustomEvent<Cell[]>;
  "cell.contextmenu": CustomEvent<CellContextMenuDetail>;
  "edge.add": CustomEvent<ConnectNodesDetail>;
  "edge.view.change": CustomEvent<EdgeViewChangePayload>;
  "decorator.view.change": CustomEvent<DecoratorViewChangePayload>;
  "decorator.text.change": CustomEvent<DecoratorTextChangeDetail>;
  "node.container.change": CustomEvent<MoveCellPayload[]>;
  "decorator.group.plus.click": CustomEvent<DecoratorCell>;
  "scale.change": CustomEvent<number>;
  "canvas.contextmenu": CustomEvent<CanvasContextMenuDetail>;
  "canvas.copy": CustomEvent<void>;
  "canvas.paste": CustomEvent<void>;
  "canvas.group": CustomEvent<void>;
  "canvas.ungroup": CustomEvent<void>;
}

export interface EoDrawCanvasEventsMapping {
  onActiveTargetChange: "activeTarget.change";
  onNodeMove: "node.move";
  onCellMove: "cell.move";
  onCellsMove: "cells.move";
  onCellResize: "cell.resize";
  onNodeDelete: "node.delete";
  onCellDelete: "cell.delete";
  onCellsDelete: "cells.delete";
  onCellContextmenu: "cell.contextmenu";
  onEdgeAdd: "edge.add";
  onEdgeViewChange: "edge.view.change";
  onDecoratorViewChange: "decorator.view.change";
  onDecoratorTextChange: "decorator.text.change";
  onNodeContainerChange: "node.container.change";
  onDecoratorGroupPlusClick: "decorator.group.plus.click";
  onScaleChange: "scale.change";
  onCanvasContextmenu: "canvas.contextmenu";
  onCanvasCopy: "canvas.copy";
  onCanvasPaste: "canvas.paste";
  onCanvasGroup: "canvas.group";
  onCanvasUngroup: "canvas.ungroup";
}

/**
 * @description 用于手工绘图的画布构件，支持节点拖放、连线绘制、元素移动/缩放/删除等交互操作，配合展示画布（eo-display-canvas）使用。
 * @category diagram
 */
export
@defineElement("eo-draw-canvas", {
  styleTexts: [styleText, zoomBarStyleText],
})
class EoDrawCanvas extends ReactNextElement implements EoDrawCanvasProps {
  /**
   * @description 初始化画布单元格数据，包含节点（node）、边（edge）和装饰器（decorator）。仅当初始化时使用，渲染后重新设置 `cells` 将无效，请使用 `updateCells` 方法代替。
   */
  @property({ attribute: false })
  accessor cells: InitialCell[] | undefined;

  /**
   * @description 画布布局类型，支持 `manual`（手动定位）、`force`（力导向）、`dagre`（层次有向图）。
   */
  @property({ type: String })
  accessor layout: LayoutType;

  /**
   * @description 布局算法选项，根据 layout 类型不同，支持不同参数（如 dagre 的 ranksep/nodesep 等）。
   */
  @property({ attribute: false })
  accessor layoutOptions: LayoutOptions | undefined;

  /**
   * @description 节点默认尺寸，格式为 `[width, height]`，在节点未指定尺寸时使用。
   *
   * @default [100,20]
   */
  @property({ attribute: false })
  accessor defaultNodeSize: SizeTuple = [DEFAULT_NODE_SIZE, DEFAULT_NODE_SIZE];

  /**
   * @description 节点默认砖块配置，指定渲染节点的自定义构件，可按节点类型匹配不同配置。
   */
  @property({ attribute: false })
  accessor defaultNodeBricks: NodeBrickConf[] | undefined;

  /**
   * 当节点数量达到或超过 `degradedThreshold` 时，节点将被降级展示。
   *
   * @default 500
   */
  @property({ type: Number })
  accessor degradedThreshold: number | undefined;

  // Set `attribute` to `false` even if it accepts string value.
  // Because when passing like "<% DATA.node.data.name %>", it will be
  // evaluated as object temporarily.
  /**
   * 设置节点将降级展示时显示的名称。
   *
   * @default "<% DATA.node.id %>"
   */
  @property({ attribute: false })
  accessor degradedNodeLabel: string | undefined;

  /**
   * 使用条件判断设置默认的边对应的连线。在 `if` 表达式中 `DATA` 为 `{ edge }`，例如：
   *
   * ```yaml
   * defaultEdgeLines:
   *   - if: <% DATA.edge.data?.virtual %>
   *     dashed: true
   * ```
   */
  @property({ attribute: false })
  accessor defaultEdgeLines: EdgeLineConf[] | undefined;

  /**
   * @description 当前激活目标，可以是节点、边或装饰器，为 null 表示无激活目标。
   */
  @property({ attribute: false })
  accessor activeTarget: ActiveTarget | null | undefined;

  /**
   * @description 当 `activeTarget` 不为 `null` 时，隐藏其他跟该 `activeTarget` 无关的元素，高亮相关节点和边。
   */
  @property({ type: Boolean })
  accessor fadeUnrelatedCells: boolean | undefined;

  /**
   * @description 是否允许通过鼠标滚轮或触控板捏合手势缩放画布，默认为 true。
   */
  @property({ type: Boolean })
  accessor zoomable: boolean | undefined = true;

  /**
   * @description 是否允许通过滚轮平移画布（非捏合手势），默认为 true。
   */
  @property({ type: Boolean })
  accessor scrollable: boolean | undefined = true;

  /**
   * @description 是否允许通过鼠标拖拽平移画布，默认为 true。
   */
  @property({ type: Boolean })
  accessor pannable: boolean | undefined = true;

  /**
   * @description 是否允许将边连接到区域（area）装饰器，默认为 false。
   */
  @property({ type: Boolean })
  accessor allowEdgeToArea: boolean | undefined = false;

  /**
   * 按住鼠标拖动时的行为：
   *  - `none`：无
   *  - `lasso`：绘制选区
   *  - `grab`：拖动画布
   *
   * @default "none"
   */
  @property()
  accessor dragBehavior: DragBehavior | undefined;

  /**
   * 按住 ctrl 键并按住鼠标拖动时的行为：
   *  - `none`：无
   *  - `grab`：拖动画布
   *
   * @default "none"
   */
  @property()
  accessor ctrlDragBehavior: CtrlDragBehavior | undefined;

  /**
   * @description 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。
   */
  @property({ attribute: false })
  accessor scaleRange: RangeTuple | undefined;

  /**
   * @description 连线设置，包含连线类型、箭头等属性，用于新建连线时的默认样式。
   */
  @property({ attribute: false })
  accessor lineSettings: LineSettings | undefined;

  /**
   * @description 连线连接器配置，设置为 `true` 或配置对象以启用智能连线功能，允许从节点边缘拖出连线。
   */
  @property({ attribute: false })
  accessor lineConnector: LineConnecterConf | boolean | undefined;

  /**
   * 选择器，点击该选择器对应的元素时不重置 `activeTarget`。
   */
  @property()
  accessor doNotResetActiveTargetForSelector: string | undefined;

  /**
   * 在画布外点击时不重置 `activeTarget`。
   */
  @property({ type: Boolean })
  accessor doNotResetActiveTargetOutsideCanvas: boolean | undefined;

  /**
   * @detail `ActiveTarget | null` — 当前激活目标，节点/边/装饰器对象或 null
   * @description 激活目标变化时触发，当用户点击节点、边或装饰器使其激活，或点击空白处取消激活时触发。
   */
  @event({ type: "activeTarget.change" })
  accessor #activeTargetChangeEvent!: EventEmitter<ActiveTarget | null>;

  #handleActiveTargetChange = (target: ActiveTarget | null) => {
    this.#activeTargetChangeEvent.emit(target);
  };

  #handleSwitchActiveTarget = (target: ActiveTarget | null) => {
    if (!sameTarget(target, this.activeTarget)) {
      this.activeTarget = target;
    }
  };

  /**
   * @deprecated Use `cell.move` instead.
   * @detail `MoveCellPayload` — 移动的节点信息，包含节点 id 和新位置
   * @description 节点被拖拽移动后触发（已废弃，请使用 `cell.move`）。
   */
  @event({ type: "node.move" })
  accessor #nodeMoveEvent!: EventEmitter<MoveCellPayload>;

  /**
   * @detail `MoveCellPayload` — 移动的单元格信息，包含单元格 id、类型和新位置
   * @description 单个单元格（节点或装饰器）被拖拽移动后触发。
   */
  @event({ type: "cell.move" })
  accessor #cellMoveEvent!: EventEmitter<MoveCellPayload>;

  #handleCellMove = (info: MoveCellPayload) => {
    this.#cellMoveEvent.emit(info);
    if (info.type === "node") {
      this.#nodeMoveEvent.emit(info);
    }
  };

  /**
   * @detail `MoveCellPayload[]` — 移动的多个单元格信息列表
   * @description 多个单元格（通过框选后拖拽）同时被移动后触发。
   */
  @event({ type: "cells.move" })
  accessor #cellsMoveEvent!: EventEmitter<MoveCellPayload[]>;

  #handleCellsMove = (info: MoveCellPayload[]) => {
    this.#cellsMoveEvent.emit(info);
  };

  /**
   * @detail `ResizeCellPayload` — 调整大小的单元格信息，包含单元格 id 和新尺寸
   * @description 单元格（节点或装饰器）被手动调整大小后触发。
   */
  @event({ type: "cell.resize" })
  accessor #cellResizeEvent!: EventEmitter<ResizeCellPayload>;

  #handleCellResize = (info: ResizeCellPayload) => {
    this.#cellResizeEvent.emit(info);
  };

  /**
   * @deprecated Use `cell.delete` instead.
   * @detail `Cell` — 被删除的节点 cell 对象
   * @description 节点被删除时触发（已废弃，请使用 `cell.delete`）。
   */
  @event({ type: "node.delete" })
  accessor #nodeDelete!: EventEmitter<Cell>;

  /**
   * @detail `Cell` — 被删除的单元格对象，包含节点、边或装饰器
   * @description 单个单元格被删除时触发（用户按 Delete 键或通过菜单删除）。
   */
  @event({ type: "cell.delete" })
  accessor #cellDelete!: EventEmitter<Cell>;

  #handleCellDelete = (cell: Cell) => {
    this.#cellDelete.emit(cell);
    if (cell.type === "node") {
      this.#nodeDelete.emit(cell);
    }
  };

  /**
   * @detail `Cell[]` — 被批量删除的单元格对象列表
   * @description 多个单元格被同时删除时触发（框选后批量删除）。
   */
  @event({ type: "cells.delete" })
  accessor #cellsDelete!: EventEmitter<Cell[]>;

  #handleCellsDelete = (cells: Cell[]) => {
    this.#cellsDelete.emit(cells);
  };

  /**
   * @detail `CellContextMenuDetail` — 右键菜单详情，包含 `{ cell: 对应的单元格, clientX: 鼠标X坐标, clientY: 鼠标Y坐标 }`
   * @description 用户右键点击节点、边或装饰器时触发，常用于弹出上下文菜单。
   */
  @event({ type: "cell.contextmenu" })
  accessor #cellContextMenu!: EventEmitter<CellContextMenuDetail>;

  #handleCellContextMenu = (detail: CellContextMenuDetail) => {
    this.#cellContextMenu.emit(detail);
  };

  /**
   * @detail `ConnectNodesDetail` — 新边详情，包含 `{ source: 起始节点 id, target: 目标节点 id }`
   * @description 通过画布绘图的方式添加边时触发（手动调用 `addEdge` 方法不会触发该事件）。
   */
  @event({ type: "edge.add" })
  accessor #edgeAdd!: EventEmitter<ConnectNodesDetail>;

  #handleEdgeAdd = (edge: ConnectNodesDetail) => {
    this.#edgeAdd.emit(edge);
  };

  /**
   * @detail `EdgeViewChangePayload` — 边视图变更详情，包含边 id 和新的视图属性
   * @description 用户通过拖拽手柄修改连线路径或形状时触发。
   */
  @event({ type: "edge.view.change" })
  accessor #edgeViewChange!: EventEmitter<EdgeViewChangePayload>;

  #handleEdgeViewChange = (detail: EdgeViewChangePayload) => {
    this.#edgeViewChange.emit(detail);
  };

  /**
   * @detail `DecoratorViewChangePayload` — 装饰器视图变更详情，包含装饰器 id 和新的位置/尺寸
   * @description 装饰器（area、container、text 等）被移动或调整大小时触发。
   */
  @event({ type: "decorator.view.change" })
  accessor #decoratorViewChange!: EventEmitter<DecoratorViewChangePayload>;

  #handleDecoratorViewChange = (detail: DecoratorViewChangePayload) => {
    this.#decoratorViewChange.emit(detail);
  };

  /**
   * @detail `DecoratorTextChangeDetail` — 文本变更详情，包含装饰器 id 和新的文本内容
   * @description 装饰器文本（area/container/text 的文字）被编辑并确认后触发。
   */
  @event({ type: "decorator.text.change" })
  accessor #decoratorTextChange!: EventEmitter<DecoratorTextChangeDetail>;

  #handleDecoratorTextChange = (detail: DecoratorTextChangeDetail) => {
    this.#decoratorTextChange.emit(detail);
  };

  /**
   * @detail `MoveCellPayload[]` — 节点与容器关系变更详情列表，有 containerCell 则为新增关系，否则为删除关系
   * @description 节点与容器组（container 装饰器）的包含关系发生变化时触发，包括拖入、拖出容器。
   */
  @event({ type: "node.container.change" })
  accessor #containerContainerChange!: EventEmitter<MoveCellPayload[]>;

  #handleContainerContainerChange = (detail: MoveCellPayload[]) => {
    this.#containerContainerChange.emit(detail);
  };

  /**
   * @detail `DecoratorCell` — 被点击加号按钮的分组容器 cell 对象
   * @description 分组容器（group 装饰器）的加号按钮被点击时触发，用于触发在组内添加新节点的逻辑。
   */
  @event({ type: "decorator.group.plus.click" })
  accessor #decoratorGroupPlusClick!: EventEmitter<DecoratorCell>;

  #handleDecoratorGroupPlusClick = (detail: DecoratorCell) => {
    this.#decoratorGroupPlusClick.emit(detail);
  };

  /**
   * @detail `number` — 当前缩放比例值（如 1.0 表示 100%）
   * @description 画布缩放比例变化时触发，从素材库拖拽元素进画布时，拖拽图像应设置对应的缩放比例。
   */
  @event({ type: "scale.change" })
  accessor #scaleChange!: EventEmitter<number>;

  #handleScaleChange = (scale: number) => {
    this.#scaleChange.emit(scale);
  };

  #getViewFromPosition(position: PositionTuple) {
    const boundingClientRect = this.getBoundingClientRect();
    const transform = this.#canvasRef.current!.getTransform();
    return {
      x: (position[0] - boundingClientRect.left - transform.x) / transform.k,
      y: (position[1] - boundingClientRect.top - transform.y) / transform.k,
    };
  }

  /**
   * @detail `CanvasContextMenuDetail` — 右键菜单详情，包含 `{ clientX: 鼠标X坐标, clientY: 鼠标Y坐标, view: 画布坐标 { x, y } }`
   * @description 用户在画布空白处右键点击时触发，常用于弹出画布级别的上下文菜单。
   */
  @event({ type: "canvas.contextmenu" })
  accessor #canvasContextMenu!: EventEmitter<CanvasContextMenuDetail>;

  #handleCanvasContextMenu = (detail: PositionTuple) => {
    this.#canvasContextMenu.emit({
      clientX: detail[0],
      clientY: detail[1],
      view: this.#getViewFromPosition(detail),
    });
  };

  /**
   * @detail `void`
   * @description 用户触发复制操作（Ctrl+C）时触发，外部需自行处理复制逻辑。
   */
  @event({ type: "canvas.copy" })
  accessor #canvasCopy!: EventEmitter<void>;

  #handleCanvasCopy = () => {
    this.#canvasCopy.emit();
  };

  /**
   * @detail `void`
   * @description 用户触发粘贴操作（Ctrl+V）时触发，外部需自行处理粘贴逻辑。
   */
  @event({ type: "canvas.paste" })
  accessor #canvasPaste!: EventEmitter<void>;

  #handleCanvasPaste = () => {
    this.#canvasPaste.emit();
  };

  /**
   * @detail `void`
   * @description 用户触发分组操作（Ctrl+G）时触发，外部需自行处理分组逻辑。
   */
  @event({ type: "canvas.group" })
  accessor #canvasGroup!: EventEmitter<void>;

  #handleCanvasGroup = () => {
    this.#canvasGroup.emit();
  };

  /**
   * @detail `void`
   * @description 用户触发取消分组操作（Ctrl+Shift+G）时触发，外部需自行处理解组逻辑。
   */
  @event({ type: "canvas.ungroup" })
  accessor #canvasUngroup!: EventEmitter<void>;

  #handleCanvasUngroup = () => {
    this.#canvasUngroup.emit();
  };

  /**
   * @description 将一个节点拖放到画布中指定位置。如果放置位置不在画布内，则返回 null。
   * @param info 拖放节点信息，包含节点 id、拖放位置（clientX/clientY）、尺寸和数据
   * @returns 成功时返回创建的 NodeCell，否则返回 null
   */
  @method()
  async dropNode({
    id,
    position,
    size,
    data,
    useBrick,
  }: DropNodeInfo): Promise<NodeCell | null> {
    // Drag and then drop a node
    const droppedInside = document
      .elementsFromPoint?.(position[0], position[1])
      ?.includes(this);
    if (droppedInside) {
      const newNode = {
        type: "node",
        id,
        view: {
          ...(this.layout === "force" || this.layout === "dagre"
            ? null
            : this.#getViewFromPosition(position)),
          width: size?.[0] ?? this.defaultNodeSize[0],
          height: size?.[1] ?? this.defaultNodeSize[0],
        },
        data,
        useBrick,
      } as NodeCell;
      this.#canvasRef.current?.dropNode(newNode);
      return newNode;
    }
    return null;
  }

  /**
   * @description 将一个装饰器（area、container、text、line 等）拖放到画布中指定位置。如果放置位置不在画布内，则返回 null。
   * @param info 拖放装饰器信息，包含装饰器类型、拖放位置、文本和方向等
   * @returns 成功时返回创建的 DecoratorCell，否则返回 null
   */
  @method()
  async dropDecorator({
    position,
    decorator,
    text,
    direction,
    source,
    target,
    view,
  }: DropDecoratorInfo): Promise<DecoratorCell | null> {
    // Drag and then drop a node
    const droppedInside = document
      .elementsFromPoint?.(position[0], position[1])
      ?.includes(this);
    if (droppedInside) {
      const boundingClientRect = this.getBoundingClientRect();
      const transform = this.#canvasRef.current!.getTransform();
      const x =
        (position[0] - boundingClientRect.left - transform.x) / transform.k;
      const y =
        (position[1] - boundingClientRect.top - transform.y) / transform.k;
      const newDecorator: DecoratorCell = {
        type: "decorator",
        decorator,
        id: uuidV4(),
        view:
          decorator === "line"
            ? ({
                source: {
                  x: x + (source?.x ?? -30),
                  y: y + (source?.y ?? 30),
                },
                target: {
                  x: x + (target?.x ?? 30),
                  y: y + (target?.y ?? -30),
                },
                ...view,
              } as unknown as DecoratorView)
            : {
                width: DEFAULT_AREA_WIDTH,
                height: DEFAULT_AREA_HEIGHT,
                x,
                y,
                text,
                direction,
                ...view,
              },
      };
      this.#canvasRef.current?.dropDecorator(newDecorator);
      return newDecorator;
    }
    return null;
  }

  /**
   * @description 批量添加节点到画布，节点位置由布局算法自动计算。
   * @param nodes 要添加的节点信息列表，每项包含 id、数据、尺寸等
   * @returns 创建的 NodeCell 列表
   */
  @method()
  async addNodes(nodes: AddNodeInfo[]): Promise<NodeCell[]> {
    if (nodes.length === 0) {
      return [];
    }
    const newNodes = nodes.map<NodeCell>(
      ({ size, useBrick, id, data, containerId, groupId }) => ({
        type: "node",
        id,
        data,
        containerId,
        groupId,
        view: {
          width: size?.[0] ?? this.defaultNodeSize[0],
          height: size?.[1] ?? this.defaultNodeSize[0],
        } as NodeView,
        useBrick,
      })
    );
    return this.#canvasRef.current!.addNodes(newNodes, {
      defaultNodeSize: this.defaultNodeSize,
      canvasWidth: this.clientWidth,
      canvasHeight: this.clientHeight,
    });
  }

  /**
   * @description 以编程方式添加一条边（连线）到画布。注意：此方法不会触发 `edge.add` 事件。
   * @param info 边信息，包含 source（起始节点 id）、target（目标节点 id）和可选的 data
   * @returns 创建的 EdgeCell 对象
   */
  @method()
  async addEdge({ source, target, data }: AddEdgeInfo): Promise<EdgeCell> {
    const newEdge: EdgeCell = {
      type: "edge",
      source,
      target,
      data,
      view: this.lineSettings!,
    };
    this.#canvasRef.current?.addEdge(newEdge);
    return newEdge;
  }

  /**
   * @description 以编程方式启动从指定源节点到目标节点的手动连线流程，等待用户在画布上点击目标节点后返回连线详情。
   * @param source 起始节点的 id
   * @returns Promise，解析为 ConnectNodesDetail 包含 source 和 target 节点信息
   */
  @method()
  manuallyConnectNodes(source: NodeId): Promise<ConnectNodesDetail> {
    return this.#canvasRef.current!.manuallyConnectNodes(source);
  }

  /**
   * @description 更新画布中的单元格数据，支持增量更新（新增、修改），已渲染的画布使用此方法代替直接设置 `cells` 属性。
   * @param cells 新的单元格数据列表
   * @param ctx 可选的更新上下文，用于指定更新原因和位置参考节点
   * @returns 返回实际被更新的单元格列表
   */
  @method()
  async updateCells(
    cells: InitialCell[],
    ctx?: UpdateCellsContext
  ): Promise<{ updated: Cell[] }> {
    await this.#waitForCanvasRef();
    const { updated } = this.#canvasRef.current!.updateCells(cells, {
      ...ctx,
      defaultNodeSize: this.defaultNodeSize,
      canvasWidth: this.clientWidth,
      canvasHeight: this.clientHeight,
    });
    return { updated };
  }

  /**
   * @description 将画布视图重置并居中，使所有单元格重新显示在视口中央。
   */
  // istanbul ignore next
  @method()
  async reCenter() {
    this.#canvasRef.current?.reCenter();
  }

  /**
   * 切换锁定状态。
   *
   * 如果目标中包含未锁定且可以锁定的元素，则将这些元素锁定；
   * 否则，如果目标中包含已锁定且可以解锁的元素，则将这些元素解锁；
   * 否则，不执行任何操作。
   *
   * 另，如果容器当前处于锁定状态，其子节点不可执行锁定或解锁操作。
   *
   * @param target 当前选中的目标
   * @returns 有更新的元素列表，其中仅 view 信息有变更
   */
  @method()
  async toggleLock(target: ActiveTarget): Promise<Cell[] | null> {
    return this.#canvasRef.current!.toggleLock(target, "toggle");
  }

  /**
   * 锁定选中的目标。规则类似 `toggleLock`，但仅执行锁定操作。
   *
   * @param target 当前选中的目标
   * @returns 有更新的元素列表，其中仅 view 信息有变更
   */
  @method()
  async lock(target: ActiveTarget): Promise<Cell[] | null> {
    return this.#canvasRef.current!.toggleLock(target, "lock");
  }

  /**
   * 解锁选中的目标。规则类似 `toggleLock`，但仅执行解锁操作。
   *
   * @param target 当前选中的目标
   * @returns 有更新的元素列表，其中仅 view 信息有变更
   */
  @method()
  async unlock(target: ActiveTarget): Promise<Cell[] | null> {
    return this.#canvasRef.current!.toggleLock(target, "unlock");
  }

  #waitForCanvasRef() {
    return new Promise<void>((resolve) => {
      const check = () => {
        if (this.#canvasRef.current) {
          resolve();
        } else {
          setTimeout(check, 10);
        }
      };
      check();
    });
  }

  #canvasRef = createRef<DrawCanvasRef>();

  disconnectedCallback(): void {
    super.disconnectedCallback();
    lockBodyScroll(this, false);
  }

  render() {
    return (
      <EoDrawCanvasComponent
        host={this}
        ref={this.#canvasRef}
        layout={this.layout}
        layoutOptions={this.layoutOptions}
        cells={this.cells}
        defaultNodeSize={this.defaultNodeSize}
        defaultNodeBricks={this.defaultNodeBricks}
        defaultEdgeLines={this.defaultEdgeLines}
        degradedThreshold={this.degradedThreshold}
        degradedNodeLabel={this.degradedNodeLabel}
        activeTarget={this.activeTarget}
        fadeUnrelatedCells={this.fadeUnrelatedCells}
        zoomable={this.zoomable}
        scrollable={this.scrollable}
        pannable={this.pannable}
        dragBehavior={this.dragBehavior}
        ctrlDragBehavior={this.ctrlDragBehavior}
        scaleRange={this.scaleRange}
        lineSettings={this.lineSettings}
        lineConnector={this.lineConnector}
        allowEdgeToArea={this.allowEdgeToArea}
        doNotResetActiveTargetForSelector={
          this.doNotResetActiveTargetForSelector
        }
        doNotResetActiveTargetOutsideCanvas={
          this.doNotResetActiveTargetOutsideCanvas
        }
        onActiveTargetChange={this.#handleActiveTargetChange}
        onSwitchActiveTarget={this.#handleSwitchActiveTarget}
        onCellMove={this.#handleCellMove}
        onCellsMove={this.#handleCellsMove}
        onCellResize={this.#handleCellResize}
        onCellDelete={this.#handleCellDelete}
        onCellsDelete={this.#handleCellsDelete}
        onEdgeAdd={this.#handleEdgeAdd}
        onCellContextMenu={this.#handleCellContextMenu}
        onCanvasContextMenu={this.#handleCanvasContextMenu}
        onDecoratorTextChange={this.#handleDecoratorTextChange}
        onContainerContainerChange={this.#handleContainerContainerChange}
        onDecoratorGroupPlusClick={this.#handleDecoratorGroupPlusClick}
        onScaleChange={this.#handleScaleChange}
        onEdgeViewChange={this.#handleEdgeViewChange}
        onDecoratorViewChange={this.#handleDecoratorViewChange}
        onCanvasCopy={this.#handleCanvasCopy}
        onCanvasPaste={this.#handleCanvasPaste}
        onCanvasGroup={this.#handleCanvasGroup}
        onCanvasUngroup={this.#handleCanvasUngroup}
      />
    );
  }
}

export interface EoDrawCanvasComponentProps extends EoDrawCanvasProps {
  host: HTMLElement;
  onActiveTargetChange(target: ActiveTarget | null): void;
  onSwitchActiveTarget(target: ActiveTarget | null): void;
  onCellMove(info: MoveCellPayload): void;
  onCellResize(cell: ResizeCellPayload): void;
  onCellDelete(cell: Cell): void;
  onCellsMove(info: MoveCellPayload[]): void;
  onCellsDelete(cells: Cell[]): void;
  onCellContextMenu(detail: CellContextMenuDetail): void;
  onEdgeAdd(detail: ConnectNodesDetail): void;
  onEdgeViewChange(detail: EdgeViewChangePayload): void;
  onDecoratorTextChange(detail: DecoratorTextChangeDetail): void;
  onDecoratorViewChange(detail: DecoratorViewChangePayload): void;
  onContainerContainerChange(detail: MoveCellPayload[]): void;
  onDecoratorGroupPlusClick(detail: DecoratorCell): void;
  onScaleChange(scale: number): void;
  onCanvasContextMenu(detail: PositionTuple): void;
  onCanvasCopy(): void;
  onCanvasPaste(): void;
  onCanvasGroup(): void;
  onCanvasUngroup(): void;
}

export interface DrawCanvasRef {
  dropNode(node: NodeCell): void;
  dropDecorator(decorator: DecoratorCell): void;
  addNodes(nodes: NodeCell[], ctx: AddNodesContext): NodeCell[];
  addEdge(edge: EdgeCell): void;
  manuallyConnectNodes(source: NodeId): Promise<ConnectNodesDetail>;
  updateCells(
    cells: InitialCell[],
    ctx: Partial<UpdateCellsContext> & {
      defaultNodeSize: SizeTuple;
      canvasWidth: number;
      canvasHeight: number;
    }
  ): {
    cells: Cell[];
    updated: Cell[];
  };
  getTransform(): TransformLiteral;
  reCenter(): void;
  toggleLock(
    target: ActiveTarget,
    type: "toggle" | "lock" | "unlock"
  ): Cell[] | null;
}

function LegacyEoDrawCanvasComponent(
  {
    host,
    layout,
    layoutOptions,
    cells: initialCells,
    defaultNodeSize,
    defaultNodeBricks,
    defaultEdgeLines,
    degradedThreshold,
    degradedNodeLabel,
    activeTarget: _activeTarget,
    fadeUnrelatedCells,
    zoomable,
    scrollable,
    pannable,
    dragBehavior,
    ctrlDragBehavior,
    scaleRange: _scaleRange,
    lineSettings,
    lineConnector,
    allowEdgeToArea,
    doNotResetActiveTargetForSelector,
    doNotResetActiveTargetOutsideCanvas,
    onActiveTargetChange,
    onSwitchActiveTarget,
    onCellMove,
    onCellResize,
    onCellDelete,
    onCellsMove,
    onCellsDelete,
    onCellContextMenu,
    onEdgeAdd,
    onDecoratorTextChange,
    onScaleChange,
    onContainerContainerChange,
    onDecoratorGroupPlusClick,
    onEdgeViewChange,
    onDecoratorViewChange,
    onCanvasContextMenu,
    onCanvasCopy,
    onCanvasPaste,
    onCanvasGroup,
    onCanvasUngroup,
  }: EoDrawCanvasComponentProps,
  ref: React.Ref<DrawCanvasRef>
) {
  const [{ cells, layoutKey }, dispatch] = useReducer(
    rootReducer,
    initialCells,
    (initialCells) => {
      return {
        cells: initializeCells(initialCells, {
          defaultNodeSize,
          layoutOptions,
          isInitialize: true,
        }),
        layoutKey: 0,
      };
    }
  );

  // When nodes are greater or equal to threshold, the diagram will be degraded.
  // Thus all nodes will be displayed as simple svg elements instead of bricks.
  const degraded = useMemo(
    () =>
      cells.filter(isNodeCell).length >=
      (degradedThreshold ?? DEFAULT_DEGRADED_THRESHOLD),
    [cells, degradedThreshold]
  );

  const rootRef = useRef<SVGSVGElement>(null);
  const manualConnectDeferredRef = useRef<Deferred<ConnectNodesDetail> | null>(
    null
  );
  const [editingTexts, setEditingTexts] = useState<string[]>([]);
  const [activeContainers, setActiveContainers] = useState<string[]>([]);
  const [curActiveEditableLine, setCurActiveEditableLine] =
    useState<EditableLineCell | null>(null);
  const { grabbing, transform, zoomer, scaleRange } = useZoom({
    rootRef,
    zoomable,
    scrollable,
    pannable,
    draggable: dragBehavior === "grab",
    ctrlDraggable: ctrlDragBehavior === "grab",
    scaleRange: _scaleRange,
    onSwitchActiveTarget,
  });

  useEffect(() => {
    onScaleChange(transform.k);
  }, [onScaleChange, transform.k]);

  const [lassoRect, setLassoRect] = useState<NodeView | null>(null);

  const [connectLineState, setConnectLineState] =
    useState<ConnectLineState | null>(null);

  const { centered, setCentered, getNextLayoutKey } = useLayout({
    layout,
    layoutOptions,
    rootRef,
    cells,
    zoomable,
    zoomer,
    scaleRange,
    layoutKey,
    allowEdgeToArea,
    dispatch,
  });

  const reCenter = useCallback(() => {
    setCentered(false);
  }, [setCentered]);

  const lockedIds = useMemo(() => getLockedContainerIds(cells), [cells]);

  useImperativeHandle(
    ref,
    () => ({
      dropNode(node) {
        // Do not apply auto centering when dropping a node in manual layout.
        if (layout !== "dagre" && layout !== "force") {
          setCentered(true);
        }
        dispatch({ type: "drop-node", payload: node });
      },
      dropDecorator(decorator) {
        // Do not apply auto centering when dropping a decorator in manual layout.
        if (layout !== "dagre" && layout !== "force") {
          setCentered(true);
        }
        dispatch({ type: "drop-decorator", payload: decorator });
      },
      addNodes(
        nodes,
        { defaultNodeSize, canvasWidth, canvasHeight }: AddNodesContext
      ) {
        const index =
          cells.findLastIndex(
            (cell) => !(cell.type === "decorator" && cell.decorator === "text")
          ) + 1;
        const newCells = [
          ...cells.slice(0, index),
          ...nodes,
          ...cells.slice(index),
        ];
        const {
          cells: allCells,
          updated,
          shouldReCenter,
        } = updateCells({
          cells: newCells,
          layout,
          previousCells: cells,
          defaultNodeSize,
          canvasWidth,
          canvasHeight,
          scaleRange,
          transform,
          allowEdgeToArea,
          layoutOptions,
        });
        if (shouldReCenter) {
          setCentered(false);
        }
        dispatch({ type: "update-cells", payload: allCells });
        return updated.filter((node) =>
          nodes.includes(node as NodeCell)
        ) as NodeCell[];
      },
      addEdge(edge) {
        dispatch({ type: "add-edge", payload: edge });
      },
      updateCells(newCells, ctx) {
        const { shouldReCenter, ...result } = updateCells({
          ...ctx,
          layout,
          previousCells: cells,
          cells: newCells,
          scaleRange,
          transform,
          allowEdgeToArea,
          layoutOptions,
        });
        if (shouldReCenter) {
          setCentered(false);
        }
        dispatch({ type: "update-cells", payload: result.cells });
        return result;
      },
      getTransform() {
        return transform;
      },
      manuallyConnectNodes(sourceId) {
        const source = cells.find(
          (cell) => isEdgeSide(cell, allowEdgeToArea) && cell.id === sourceId
        ) as NodeCell | DecoratorCell | undefined;
        if (source) {
          const rect = rootRef.current!.getBoundingClientRect();
          setConnectLineState({
            source,
            from: [
              source.view.x + source.view.width / 2,
              source.view.y + source.view.height / 2,
            ],
            offset: [rect.left, rect.top],
          });
          const promise = new Promise<ConnectNodesDetail>((resolve, reject) => {
            manualConnectDeferredRef.current = { resolve, reject };
          });
          return promise;
        }
        return Promise.reject(null);
      },
      reCenter,
      toggleLock(
        target: ActiveTarget,
        type: "toggle" | "lock" | "unlock"
      ): Cell[] | null {
        const { newCells, updates } = toggleLock(
          target,
          type,
          cells,
          lockedIds
        );
        if (!newCells) {
          return null;
        }
        dispatch({ type: "update-cells", payload: newCells });
        return updates;
      },
    }),
    [
      cells,
      layout,
      scaleRange,
      setCentered,
      transform,
      allowEdgeToArea,
      reCenter,
      lockedIds,
    ]
  );

  const handleConnect = useCallback(
    (state: ConnectLineState, to: PositionTuple) => {
      // Find the target node from top bo bottom,
      // detect whether the pointer is inside the target node.
      for (let i = cells.length - 1; i >= 0; i--) {
        const cell = cells[i];
        // Currently ignore connecting to self
        if (isEdgeSide(cell, allowEdgeToArea) && cell.id !== state.source.id) {
          if (
            cell.view.x < to[0] &&
            cell.view.x + cell.view.width > to[0] &&
            cell.view.y < to[1] &&
            cell.view.y + cell.view.height > to[1]
          ) {
            manualConnectDeferredRef.current?.resolve({
              source: state.source,
              target: cell,
            });
            break;
          }
        }
      }
      manualConnectDeferredRef.current?.reject(null);
      setConnectLineState(null);
    },
    [allowEdgeToArea, cells]
  );
  const [smartConnectLineState, setSmartConnectLineState] =
    useState<SmartConnectLineState | null>(null);

  useEffect(() => {
    lockBodyScroll(
      host,
      !!(connectLineState || !!smartConnectLineState || lassoRect)
    );
  }, [connectLineState, host, smartConnectLineState, lassoRect]);

  const activeTarget = useActiveTarget({
    rootRef,
    activeTarget: _activeTarget,
    doNotResetActiveTargetForSelector,
    doNotResetActiveTargetOutsideCanvas,
    onActiveTargetChange,
  });

  const [unrelatedCells, setUnrelatedCells] = useState<Cell[]>([]);
  useEffect(() => {
    const nextUnrelated = fadeUnrelatedCells
      ? getUnrelatedCells(
          cells,
          connectLineState,
          activeTarget,
          allowEdgeToArea
        )
      : [];
    // Do not update the state when prev and next are both empty.
    setUnrelatedCells((prev) =>
      prev.length === 0 && nextUnrelated.length === 0 ? prev : nextUnrelated
    );
  }, [
    activeTarget,
    cells,
    connectLineState,
    fadeUnrelatedCells,
    allowEdgeToArea,
  ]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || editingTexts.length > 0) {
      return;
    }
    const onKeydown = (event: KeyboardEvent) => {
      const action = handleKeyboard(event, {
        cells,
        activeTarget,
        lockedIds,
      });

      switch (action?.action) {
        case "delete-cells":
          onCellsDelete(action.cells);
          if (action.cells.length === 1) {
            onCellDelete(action.cells[0]);
          }
          break;
      }
    };
    root.addEventListener("keydown", onKeydown);
    return () => {
      root.removeEventListener("keydown", onKeydown);
    };
  }, [
    activeTarget,
    cells,
    editingTexts.length,
    lockedIds,
    onCellDelete,
    onCellsDelete,
  ]);

  const defPrefix = useMemo(() => `${uniqueId("diagram-")}-`, []);
  const markerPrefix = `${defPrefix}line-arrow-`;

  const [guideLines, setGuideLines] = useState<LineTuple[]>([]);
  const [movingCells, setMovingCells] = useState(false);
  const [resizingCells, setResizingCells] = useState(false);
  const [
    movingCellsOtherThanDecoratorLine,
    setMovingCellsOtherThanDecoratorLine,
  ] = useState(false);

  /* istanbul ignore next */
  const handleCellsMoving = useCallback(
    (info: MoveCellPayload[]) => {
      dispatch({ type: "move-cells", payload: info });
      const containedIds: string[] = [];
      handleNodeContainedChange(info, cells).forEach((c) => {
        if (c.containerCell?.id) containedIds.push(c.containerCell?.id);
      });
      setActiveContainers(containedIds);
      setGuideLines(info.flatMap((c) => c.guideLines ?? []));
      setMovingCells(true);
      if (!info.some((cell) => isLineDecoratorCell(cell))) {
        setMovingCellsOtherThanDecoratorLine(true);
      }
    },
    [cells]
  );

  /* istanbul ignore next */
  const handleCellsMoved = useCallback(
    (info: MoveCellPayload[]) => {
      dispatch({ type: "move-cells", payload: info });
      onCellsMove(info);
      if (info.length === 1) {
        onCellMove(info[0]);
      }
      handleNodeContainedChange(info, cells, onContainerContainerChange);
      setActiveContainers([]);
      setGuideLines([]);
      setMovingCells(false);
      setMovingCellsOtherThanDecoratorLine(false);
    },
    [onCellMove, onCellsMove, cells, onContainerContainerChange]
  );

  const handleCellResizing = useCallback((info: ResizeCellPayload) => {
    dispatch({ type: "resize-cell", payload: info });
    setResizingCells(true);
  }, []);

  const handleCellResized = useCallback(
    (info: ResizeCellPayload) => {
      dispatch({ type: "resize-cell", payload: info });
      onCellResize(info);
      setResizingCells(false);
    },
    [onCellResize]
  );

  const handleDecoratorTextEditing = useCallback(
    ({ id, editing }: { id: string; editing: boolean }) => {
      if (editing) {
        setEditingTexts((texts) =>
          texts.includes(id) ? texts : [...texts, id]
        );
      } else {
        setEditingTexts((texts) => texts.filter((text) => text !== id));
      }
    },
    []
  );

  const handleNodeBrickResize = useCallback(
    (id: string, size: SizeTuple | null) => {
      const nextLayoutKey = getNextLayoutKey();
      dispatch({
        type: "update-node-size",
        payload: { id, size },
        layoutKey: nextLayoutKey,
      });
    },
    [getNextLayoutKey]
  );

  const handleZoomSlide = useCallback(
    (value: number) => {
      // istanbul ignore next
      if (process.env.NODE_ENV !== "test") {
        zoomer.scaleTo(select(rootRef.current!), value / 100);
      }
    },
    [zoomer]
  );
  const { lineConfMap, lineConnectorConf, markers } = useLineMarkers({
    cells,
    defaultEdgeLines,
    lineConnector,
    markerPrefix,
    useMemoizedResult: movingCellsOtherThanDecoratorLine || resizingCells,
  });

  const editableLineMap = useEditableLineMap({ cells, lineConfMap });

  const activeEditableLines = useMemo(() => {
    let edges: EditableLineCell[] = [];
    edges = cells.filter(
      (cell) =>
        !isLocked(cell, lockedIds) &&
        targetIsActive(cell, activeTarget) &&
        (isEdgeCell(cell) || isLineDecoratorCell(cell)) &&
        editableLineMap.has(cell)
    ) as EditableLineCell[];
    return edges;
  }, [activeTarget, cells, editableLineMap, lockedIds]);

  const ready = useReady({ cells, layout, centered });

  const [hoverState, setHoverState] = useState<HoverState | null>(null);
  const unsetHoverStateTimeoutRef = useRef<number | null>(null);

  const [lineEditorState, setLineEditorState] =
    useState<LineEditorState | null>(null);

  // istanbul ignore next
  const handleCellMouseEnter = useCallback(
    (cell: Cell) => {
      if (
        lineConnectorConf &&
        !isLocked(cell, lockedIds) &&
        isEdgeSide(cell, allowEdgeToArea) &&
        (!lineEditorState || lineEditorState.type !== "control")
      ) {
        if (unsetHoverStateTimeoutRef.current !== null) {
          clearTimeout(unsetHoverStateTimeoutRef.current);
          unsetHoverStateTimeoutRef.current = null;
        }
        const relativePoints = getConnectPointsOfRectangle();
        setHoverState({
          cell,
          relativePoints,
          points: getConnectPoints(relativePoints, cell.view),
        });
      }
    },
    [allowEdgeToArea, lineConnectorConf, lineEditorState, lockedIds]
  );

  const handleCellMouseLeave = useCallback(
    (cell: Cell) => {
      if (lineConnectorConf && isNodeCell(cell)) {
        unsetHoverStateTimeoutRef.current = setTimeout(() => {
          setHoverState(null);
        }) as unknown as number;
      }
    },
    [lineConnectorConf]
  );

  // istanbul ignore next
  const handleSmartConnect = useCallback(
    (
      source: NodeCell | DecoratorCell,
      target: NodeCell | DecoratorCell,
      exitPosition: NodePosition,
      entryPosition: NodePosition | undefined
    ) => {
      const payload: EdgeViewChangePayload = {
        source: source.id,
        target: target.id,
        view: {
          ...lineSettings,
          exitPosition,
          entryPosition,
          vertices: null,
        },
      };
      const existedEdge = cells.find(
        (cell) =>
          cell.type === "edge" &&
          cell.source === source.id &&
          cell.target === target.id
      );
      if (existedEdge) {
        dispatch({
          type: "change-edge-view",
          payload,
        });
        onEdgeViewChange?.(payload);
      } else {
        const newEdge: EdgeCell = {
          type: "edge",
          ...payload,
        };
        dispatch({
          type: "add-edge",
          payload: newEdge,
        });
        onEdgeAdd({
          source,
          target,
          view: newEdge.view,
        });
      }
    },
    [cells, lineSettings, onEdgeAdd, onEdgeViewChange]
  );

  // istanbul ignore next
  const handleEdgeChangeView = useCallback(
    (
      source: NodeCell | DecoratorCell,
      target: NodeCell | DecoratorCell,
      view: EdgeView
    ) => {
      const payload: EdgeViewChangePayload = {
        source: source.id,
        target: target.id,
        view,
      };
      dispatch({
        type: "change-edge-view",
        payload,
      });
      onEdgeViewChange?.(payload);
    },
    [onEdgeViewChange]
  );

  // istanbul ignore next
  const handleDecoratorChangeView = useCallback(
    (cell: DecoratorCell, view: DecoratorView | DecoratorLineView) => {
      const payload: DecoratorViewChangePayload = {
        id: cell.id,
        view,
      };
      dispatch({
        type: "change-decorator-view",
        payload,
      });
      onDecoratorViewChange?.(payload);
    },
    [onDecoratorViewChange]
  );

  // istanbul ignore next: experimental
  const hoverStateContextValue = useMemo(
    () => ({
      rootRef,
      smartConnectLineState,
      unsetHoverStateTimeoutRef,
      hoverState,
      activeEditableLines,
      lineEditorState,
      movingCells,
      setLineEditorState,
      setHoverState,
      setSmartConnectLineState,
      onConnect: handleSmartConnect,
      onChangeEdgeView: handleEdgeChangeView,
      onChangeDecoratorView: handleDecoratorChangeView,
    }),
    [
      activeEditableLines,
      handleEdgeChangeView,
      handleDecoratorChangeView,
      handleSmartConnect,
      hoverState,
      lineEditorState,
      smartConnectLineState,
      movingCells,
    ]
  );
  // istanbul ignore next
  const handleCanvasContextMenu = useCallback(
    (event: React.MouseEvent<SVGElement>) => {
      event.preventDefault();
      onCanvasContextMenu([event.clientX, event.clientY]);
      onSwitchActiveTarget?.(null);
    },
    [onCanvasContextMenu, onSwitchActiveTarget]
  );
  // istanbul ignore next
  const handleCanvasKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGElement>) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const modKey = isMac ? "metaKey" : "ctrlKey";

      if (!event[modKey]) return; // 没按 Ctrl/Command 直接跳过
      const key = event.key.toLowerCase();
      switch (key) {
        case "c":
          if (!event.shiftKey) {
            onCanvasCopy();
            event.preventDefault();
          }
          break;

        case "v":
          if (!event.shiftKey) {
            onCanvasPaste();
            event.preventDefault();
          }
          break;

        case "g":
          if (event.shiftKey) {
            // Ctrl+Shift+G → 取消组合
            onCanvasUngroup?.();
          } else {
            // Ctrl+G → 组合
            onCanvasGroup?.();
          }
          event.preventDefault();
          break;

        default:
          break;
      }
    },
    [onCanvasCopy, onCanvasPaste, onCanvasGroup, onCanvasUngroup]
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root || dragBehavior !== "lasso") {
      return;
    }
    const rootRect = root.getBoundingClientRect();
    // istanbul ignore next
    const onMouseDown = (event: MouseEvent) => {
      handleLasso(event, {
        transform,
        offset: [rootRect.left, rootRect.top],
        onLassoing(rect) {
          setLassoRect(rect);
        },
        onLassoed(rect) {
          setLassoRect(null);
          const lassoedCells: (NodeCell | DecoratorCell | EdgeCell)[] = [];
          for (const cell of cells) {
            if (isEdgeCell(cell) || isNodeCell(cell) || isDecoratorCell(cell)) {
              const x = get(cell, "view.x", 0);
              const y = get(cell, "view.y", 0);
              const width = get(cell, "view.width", 0);
              const height = get(cell, "view.height", 0);
              if (
                x >= rect.x &&
                x + width <= rect.x + rect.width &&
                y >= rect.y &&
                y + height <= rect.y + rect.height
              ) {
                lassoedCells.push(cell);
              }
            }
          }
          onSwitchActiveTarget?.(
            lassoedCells.length > 1
              ? { type: "multi", targets: lassoedCells.map(cellToTarget) }
              : lassoedCells.length === 1
                ? cellToTarget(lassoedCells[0])
                : null
          );
        },
      });
    };
    root.addEventListener("mousedown", onMouseDown);
    return () => {
      root.removeEventListener("mousedown", onMouseDown);
    };
  }, [transform, cells, dragBehavior, onSwitchActiveTarget]);

  return (
    <HoverStateContext.Provider value={hoverStateContextValue}>
      <svg
        onKeyDown={handleCanvasKeyDown}
        onContextMenu={handleCanvasContextMenu}
        width="100%"
        height="100%"
        ref={rootRef}
        className={classNames("root", { grabbing, pannable, ready })}
        tabIndex={-1}
      >
        <defs>
          {markers.map((marker, index) => (
            <MarkerComponent
              key={index}
              id={`${markerPrefix}${index}`}
              type={marker.markerType}
              strokeColor={marker.strokeColor}
            />
          ))}
        </defs>
        <g
          transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
        >
          <g className={classNames("cells", { allowEdgeToArea })}>
            {cells.map((cell) => (
              <CellComponent
                key={`${cell.type}:${isEdgeCell(cell) ? `${cell.source}~${cell.target}` : cell.id}`}
                dragoverContainer={
                  !isEdgeCell(cell) && activeContainers.includes(cell.id)
                }
                layout={layout}
                layoutOptions={layoutOptions}
                cell={cell}
                cells={cells}
                degraded={degraded}
                degradedNodeLabel={degradedNodeLabel}
                defaultNodeBricks={defaultNodeBricks}
                transform={transform}
                lineConfMap={lineConfMap}
                editableLineMap={editableLineMap}
                activeTarget={activeTarget}
                unrelatedCells={unrelatedCells}
                allowEdgeToArea={allowEdgeToArea}
                curActiveEditableLine={curActiveEditableLine}
                locked={isLocked(cell, lockedIds)}
                containerLocked={
                  isNodeCell(cell) &&
                  !!cell.containerId &&
                  lockedIds.includes(cell.containerId)
                }
                groupLocked={
                  isNodeCell(cell) &&
                  !!cell.groupId &&
                  lockedIds.includes(cell.groupId)
                }
                updateCurActiveEditableLine={setCurActiveEditableLine}
                onCellsMoving={handleCellsMoving}
                onCellsMoved={handleCellsMoved}
                onCellResizing={handleCellResizing}
                onCellResized={handleCellResized}
                onSwitchActiveTarget={onSwitchActiveTarget}
                onCellContextMenu={onCellContextMenu}
                onDecoratorTextChange={onDecoratorTextChange}
                onDecoratorTextEditing={handleDecoratorTextEditing}
                onDecoratorGroupPlusClick={onDecoratorGroupPlusClick}
                onNodeBrickResize={handleNodeBrickResize}
                onCellMouseEnter={handleCellMouseEnter}
                onCellMouseLeave={handleCellMouseLeave}
              />
            ))}
          </g>
          <g>
            <ConnectLineComponent
              connectLineState={connectLineState}
              transform={transform}
              markerEnd={`${markerPrefix}0`}
              onConnect={handleConnect}
            />
          </g>
          {lassoRect && (
            <rect
              x={lassoRect.x}
              y={lassoRect.y}
              width={lassoRect.width}
              height={lassoRect.height}
              fill="var(--palette-gray-5)"
              fillOpacity={0.3}
              stroke="var(--palette-gray-5)"
              strokeDasharray={2}
            />
          )}
          {lineConnectorConf && (
            <g>
              <SmartConnectLineComponent
                transform={transform}
                lineSettings={lineSettings}
                options={lineConnectorConf}
              />
              <EditingLineComponent
                cells={cells}
                editableLineMap={editableLineMap}
                transform={transform}
                options={lineConnectorConf}
                activeEditableLine={curActiveEditableLine}
              />
            </g>
          )}
          <g>
            {guideLines.map((line, index) => (
              <path
                key={index}
                d={`M${line[0].join(" ")} L${line[1].join(" ")}`}
                stroke="var(--palette-orange-5)"
                fill="none"
                strokeWidth={1 / transform.k}
              />
            ))}
          </g>
          <g>
            {lineConnectorConf &&
              activeEditableLines?.map((activeEdge) => (
                <LineEditorComponent
                  editableLineMap={editableLineMap}
                  scale={transform.k}
                  activeEditableLine={activeEdge}
                  updateCurActiveEditableLine={setCurActiveEditableLine}
                  key={
                    isEdgeCell(activeEdge)
                      ? `${activeEdge.source}-${activeEdge.target}`
                      : activeEdge.id
                  }
                />
              ))}
          </g>
          {lineConnectorConf && (
            <LineConnectorComponent
              activeTarget={activeTarget}
              editableLineMap={editableLineMap}
              scale={transform.k}
              activeEditableLine={curActiveEditableLine}
              disabled={!!connectLineState}
            />
          )}
        </g>
      </svg>
      <ZoomBarComponent
        shadowRoot={host.shadowRoot!}
        scale={transform.k}
        scaleRange={scaleRange}
        onZoomChange={handleZoomSlide}
        onReCenter={reCenter}
      />
    </HoverStateContext.Provider>
  );
}

export function uuidV4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getConnectPoints(
  relativePoints: ReadonlyArray<NodePosition>,
  view: NodeView,
  border = 1
) {
  const padding = DEFAULT_NODE_PADDING_FOR_SMART_LINES;
  const halfPadding = padding / 2;

  const viewWithBorderAndPadding: NodeView = {
    x: view.x + border / 2 - halfPadding,
    y: view.y + border / 2 - halfPadding,
    width: view.width - border + padding,
    height: view.height - border + padding,
  };

  return relativePoints.map((p) => ({
    x: viewWithBorderAndPadding.x + p.x * viewWithBorderAndPadding.width,
    y: viewWithBorderAndPadding.y + p.y * viewWithBorderAndPadding.height,
  }));
}
