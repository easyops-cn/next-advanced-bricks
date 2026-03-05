import React, {
  createRef,
  forwardRef,
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
import "@next-core/theme";
import { uniqueId } from "lodash";
import classNames from "classnames";
import { select } from "d3-selection";
import type { RangeTuple, SizeTuple } from "../diagram/interfaces";
import type {
  ActiveTarget,
  InitialCell,
  NodeBrickConf,
  CellContextMenuDetail,
  EdgeLineConf,
  Cell,
  LayoutType,
  LayoutOptions,
  AutoSize,
} from "../draw-canvas/interfaces";
import { MarkerComponent } from "../diagram/MarkerComponent";
import { sameTarget } from "../draw-canvas/processors/sameTarget";
import { CellComponent } from "../draw-canvas/CellComponent";
import { initializeCells } from "../draw-canvas/processors/initializeCells";
import {
  DEFAULT_DEGRADED_THRESHOLD,
  DEFAULT_NODE_SIZE,
} from "../draw-canvas/constants";
import { useZoom } from "../shared/canvas/useZoom";
import { useActiveTarget } from "../shared/canvas/useActiveTarget";
import { rootReducer } from "../draw-canvas/reducers";
import { getUnrelatedCells } from "../draw-canvas/processors/getUnrelatedCells";
import { isEdgeCell, isNodeCell } from "../draw-canvas/processors/asserts";
import { ZoomBarComponent } from "../shared/canvas/ZoomBarComponent";
import { useLayout } from "../shared/canvas/useLayout";
import { useReady } from "../shared/canvas/useReady";
import { useLineMarkers } from "../shared/canvas/useLineMarkers";
import { updateCells } from "../draw-canvas/processors/updateCells";
import styleText from "../shared/canvas/styles.shadow.css";
import zoomBarStyleText from "../shared/canvas/ZoomBarComponent.shadow.css";
import { useEditableLineMap } from "../shared/canvas/useEditableLineMap";

const { defineElement, property, event, method } = createDecorators();

export interface EoDisplayCanvasProps {
  cells: InitialCell[] | undefined;
  layout: LayoutType;
  layoutOptions?: LayoutOptions;
  autoSize?: AutoSize;
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
  scaleRange?: RangeTuple;
  hideZoomBar?: boolean;
  autoCenterWhenCellsChange?: boolean;
  doNotResetActiveTargetForSelector?: string;
  doNotResetActiveTargetOutsideCanvas?: boolean;
  extraStyleTexts?: string[];
}

const EoDisplayCanvasComponent = forwardRef(LegacyEoDisplayCanvasComponent);

export interface EoDisplayCanvasEventsMap {
  "activeTarget.change": CustomEvent<ActiveTarget | null>;
  "cell.contextmenu": CustomEvent<CellContextMenuDetail>;
  "cell.click": CustomEvent<CellContextMenuDetail>;
}

export interface EoDisplayCanvasEventsMapping {
  onActiveTargetChange: "activeTarget.change";
  onCellContextmenu: "cell.contextmenu";
  onCellClick: "cell.click";
}

/**
 * @description 用于展示查看的画布构件，支持 manual、force、dagre 多种布局，可展示节点、边和装饰器，支持缩放、平移、激活目标高亮、淡化无关元素等功能。
 * @category diagram
 */
export
@defineElement("eo-display-canvas", {
  styleTexts: [styleText, zoomBarStyleText],
})
class EoDisplayCanvas extends ReactNextElement implements EoDisplayCanvasProps {
  /**
   * @description 画布中的单元格数据，包含节点（node）、边（edge）和装饰器（decorator）。
   */
  @property({ attribute: false })
  accessor cells: InitialCell[] | undefined;

  /**
   * @description 画布布局类型，支持 `manual`（手动定位）、`force`（力导向）、`dagre`（层次有向图）。
   */
  @property({ type: String })
  accessor layout: LayoutType;

  /**
   * @description 布局算法选项，根据 layout 类型不同，支持不同参数（如 dagre 的 ranksep/nodesep，force 的碰撞参数等）。
   */
  @property({ attribute: false })
  accessor layoutOptions: LayoutOptions | undefined;

  /**
   * @description 是否自动计算节点尺寸，启用后画布会根据节点内容自动调整节点大小。
   */
  @property({ attribute: false })
  accessor autoSize: AutoSize | undefined;

  /**
   * @description 节点默认尺寸，格式为 `[width, height]`，在节点未指定尺寸时使用。
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

  // Set `attribute` to `false` event if it accepts string value.
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
   * @description 当前激活目标，可以是节点（`{ type: "node", id }`）或边（`{ type: "edge", id }`）等，为 null 表示无激活目标。
   */
  @property({ attribute: false })
  accessor activeTarget: ActiveTarget | null | undefined;

  /**
   * @description 当鼠标悬浮到某节点上时，隐藏其他跟该节点无关的元素，高亮相关节点和边。
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
   * @description 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。
   */
  @property({ attribute: false })
  accessor scaleRange: RangeTuple | undefined;

  /**
   * 隐藏右下角放大缩小的控制栏
   */
  @property({ type: Boolean })
  accessor hideZoomBar: boolean | undefined;

  /**
   * 每当 cells 改变时，重新自动居中
   */
  @property({ type: Boolean })
  accessor autoCenterWhenCellsChange: boolean | undefined;

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

  @property({ attribute: false })
  accessor extraStyleTexts: string[] | undefined;

  /**
   * @detail `ActiveTarget | null` — 当前激活目标，节点/边对象或 null
   * @description 激活目标变化时触发，当用户点击节点或边使其激活，或点击空白处取消激活时触发。
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
   * @detail `CellContextMenuDetail` — 右键菜单详情，包含 `{ cell: 对应的单元格, clientX: 鼠标X坐标, clientY: 鼠标Y坐标 }`
   * @description 用户右键点击节点或边时触发，常用于弹出上下文菜单。
   */
  @event({ type: "cell.contextmenu" })
  accessor #cellContextMenu!: EventEmitter<CellContextMenuDetail>;

  #handleCellContextMenu = (detail: CellContextMenuDetail) => {
    this.#cellContextMenu.emit(detail);
  };

  /**
   * @detail `CellContextMenuDetail` — 点击详情，包含 `{ cell: 对应的单元格, clientX: 鼠标X坐标, clientY: 鼠标Y坐标 }`
   * @description 用户左键点击节点或边时触发。
   */
  @event({ type: "cell.click" })
  accessor #cellClick!: EventEmitter<CellContextMenuDetail>;

  #handleCellClick = (detail: CellContextMenuDetail) => {
    this.#cellClick.emit(detail);
  };

  #ref = createRef<DisplayCanvasRef>();

  /**
   * @description 将画布视图重置并居中，使所有单元格重新显示在视口中央。
   */
  @method()
  center() {
    this.#ref.current?.center();
  }

  render() {
    return (
      <EoDisplayCanvasComponent
        shadowRoot={this.shadowRoot!}
        cells={this.cells}
        layout={this.layout}
        layoutOptions={this.layoutOptions}
        autoSize={this.autoSize}
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
        scaleRange={this.scaleRange}
        hideZoomBar={this.hideZoomBar}
        doNotResetActiveTargetForSelector={
          this.doNotResetActiveTargetForSelector
        }
        doNotResetActiveTargetOutsideCanvas={
          this.doNotResetActiveTargetOutsideCanvas
        }
        autoCenterWhenCellsChange={this.autoCenterWhenCellsChange}
        extraStyleTexts={this.extraStyleTexts}
        onActiveTargetChange={this.#handleActiveTargetChange}
        onSwitchActiveTarget={this.#handleSwitchActiveTarget}
        onCellContextMenu={this.#handleCellContextMenu}
        onCellClick={this.#handleCellClick}
        ref={this.#ref}
      />
    );
  }
}

interface EoDisplayCanvasComponentProps extends EoDisplayCanvasProps {
  shadowRoot: ShadowRoot;
  onActiveTargetChange(target: ActiveTarget | null): void;
  onSwitchActiveTarget(target: ActiveTarget | null): void;
  onCellContextMenu(detail: CellContextMenuDetail): void;
  onCellClick(detail: CellContextMenuDetail): void;
}

interface DisplayCanvasRef {
  center: () => void;
}

function LegacyEoDisplayCanvasComponent(
  {
    shadowRoot,
    cells: initialCells,
    layout,
    layoutOptions,
    autoSize,
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
    scaleRange: _scaleRange,
    hideZoomBar,
    autoCenterWhenCellsChange,
    doNotResetActiveTargetForSelector,
    doNotResetActiveTargetOutsideCanvas,
    extraStyleTexts,
    onActiveTargetChange,
    onSwitchActiveTarget,
    onCellContextMenu,
    onCellClick,
  }: EoDisplayCanvasComponentProps,
  ref: React.Ref<DisplayCanvasRef>
) {
  const [{ cells, layoutKey }, dispatch] = useReducer(
    rootReducer,
    initialCells,
    (initialCells) => ({
      cells: initializeCells(initialCells, { defaultNodeSize }),
      layoutKey: 1,
    })
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

  const { grabbing, transform, zoomer, scaleRange } = useZoom({
    rootRef,
    zoomable,
    scrollable,
    pannable,
    draggable: true,
    scaleRange: _scaleRange,
    onSwitchActiveTarget,
  });

  const { centered, setCentered, getNextLayoutKey } = useLayout({
    layout,
    layoutOptions,
    autoSize,
    rootRef,
    cells,
    zoomable,
    zoomer,
    scaleRange,
    layoutKey,
    autoCenterWhenCellsChange,
    dispatch,
  });

  const reCenter = useCallback(() => {
    setCentered(false);
  }, [setCentered]);

  useImperativeHandle(
    ref,
    () => ({
      center: reCenter,
    }),
    [reCenter]
  );

  const previousCellsRef = useRef(initialCells);

  useEffect(() => {
    if (initialCells !== previousCellsRef.current) {
      previousCellsRef.current = initialCells;
      const result = updateCells({
        canvasWidth: shadowRoot.host.clientWidth,
        canvasHeight: shadowRoot.host.clientHeight,
        defaultNodeSize,
        layout,
        previousCells: cells,
        cells: initialCells,
        scaleRange,
        transform,
      });
      dispatch({ type: "update-cells", payload: result.cells });
    }
  }, [
    cells,
    defaultNodeSize,
    initialCells,
    layout,
    scaleRange,
    shadowRoot,
    transform,
  ]);

  const activeTarget = useActiveTarget({
    rootRef,
    activeTarget: _activeTarget,
    doNotResetActiveTargetForSelector,
    doNotResetActiveTargetOutsideCanvas,
    onActiveTargetChange,
  });

  const defPrefix = useMemo(() => `${uniqueId("diagram-")}-`, []);
  const markerPrefix = `${defPrefix}line-arrow-`;

  const handleNodeBrickResize = useCallback(
    (id: string, size: SizeTuple | null) => {
      dispatch({
        type: "update-node-size",
        payload: { id, size },
        layoutKey: getNextLayoutKey(),
      });
    },
    [getNextLayoutKey]
  );

  const [hoverCell, setHoverCell] = useState<Cell | null>(null);
  const handleCellMouseEnter = useCallback((cell: Cell) => {
    setHoverCell(cell);
  }, []);
  const handleCellMouseLeave = useCallback((cell: Cell) => {
    setHoverCell((prev) => (prev === cell ? null : prev));
  }, []);

  const [unrelatedCells, setUnrelatedCells] = useState<Cell[]>([]);
  useEffect(() => {
    const nextUnrelated = fadeUnrelatedCells
      ? getUnrelatedCells(cells, null, hoverCell || activeTarget)
      : [];
    // Do not update the state when prev and next are both empty.
    setUnrelatedCells((prev) =>
      prev.length === 0 && nextUnrelated.length === 0 ? prev : nextUnrelated
    );
  }, [cells, fadeUnrelatedCells, hoverCell, activeTarget]);

  const handleZoomSlide = useCallback(
    (value: number) => {
      // istanbul ignore next
      if (process.env.NODE_ENV !== "test") {
        zoomer.scaleTo(select(rootRef.current!), value / 100);
      }
    },
    [zoomer]
  );

  const { lineConfMap, markers } = useLineMarkers({
    cells,
    defaultEdgeLines,
    markerPrefix,
  });
  const editableLineMap = useEditableLineMap({ cells, lineConfMap });

  const ready = useReady({ cells, layout, centered });

  return (
    <>
      {extraStyleTexts?.map((text, index) => (
        <style key={index}>{text}</style>
      ))}
      <svg
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
          <g className="cells">
            {cells.map((cell) => (
              <CellComponent
                key={`${cell.type}:${isEdgeCell(cell) ? `${cell.source}~${cell.target}` : cell.id}`}
                layout={layout}
                cell={cell}
                cells={cells}
                degraded={degraded}
                degradedNodeLabel={degradedNodeLabel}
                defaultNodeBricks={defaultNodeBricks}
                lineConfMap={lineConfMap}
                editableLineMap={editableLineMap}
                transform={transform}
                activeTarget={activeTarget}
                readOnly
                hoverCell={hoverCell}
                unrelatedCells={unrelatedCells}
                onSwitchActiveTarget={onSwitchActiveTarget}
                onCellContextMenu={onCellContextMenu}
                onCellClick={onCellClick}
                onNodeBrickResize={handleNodeBrickResize}
                onCellMouseEnter={
                  fadeUnrelatedCells && (isNodeCell(cell) || isEdgeCell(cell))
                    ? handleCellMouseEnter
                    : undefined
                }
                onCellMouseLeave={
                  fadeUnrelatedCells && (isNodeCell(cell) || isEdgeCell(cell))
                    ? handleCellMouseLeave
                    : undefined
                }
              />
            ))}
          </g>
        </g>
      </svg>
      {!hideZoomBar && (
        <ZoomBarComponent
          shadowRoot={shadowRoot}
          scale={transform.k}
          scaleRange={scaleRange}
          onZoomChange={handleZoomSlide}
          onReCenter={reCenter}
        />
      )}
    </>
  );
}
