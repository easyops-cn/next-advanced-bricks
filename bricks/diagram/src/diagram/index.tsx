import React, {
  createRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { select } from "d3-selection";
import { ZoomTransform, zoom } from "d3-zoom";
import classNames from "classnames";
import { uniqueId } from "lodash";
import ResizeObserver from "resize-observer-polyfill";
import type {
  DiagramEdge,
  DiagramNode,
  LayoutOptions,
  LineConf,
  NodeBrickConf,
  PositionTuple,
  RefRepository,
  RenderedLineLabel,
  TransformLiteral,
  LineTarget,
  ConnectLineDetail,
  ConnectNodesOptions,
  ConnectLineState,
  ActiveTarget,
  RangeTuple,
  LineLabel,
  LineLabelConf,
  TextOptions,
  DragNodesOptions,
  NodeMovement,
  ManualLayoutStatus,
  LineMaskRects,
} from "./interfaces";
import { NodeComponentGroup } from "./NodeComponent";
import { handleKeyboard } from "./processors/handleKeyboard";
import { transformToCenter } from "./processors/transformToCenter";
import { getRenderedLines } from "./processors/getRenderedLines";
import { normalizeLinesAndMarkers } from "./processors/normalizeLinesAndMarkers";
import { LineLabelComponentGroup } from "./LineLabelComponent";
import { LineComponent } from "./LineComponent";
import { MarkerComponent } from "./MarkerComponent";
import { LineMaskComponent } from "./LineMaskComponent";
import { ConnectLineComponent } from "./ConnectLineComponent";
import { getRenderedLineLabels } from "./processors/getRenderedLineLabels";
import { handleNodesMouseDown } from "./processors/handleNodesMouseDown";
import { DEFAULT_SCALE_RANGE_MAX, DEFAULT_SCALE_RANGE_MIN } from "./constants";
import { useRenderedDiagram } from "./hooks/useRenderedDiagram";
import { adjustLineLabels } from "./processors/adjustLineLabels";
import styleText from "./styles.shadow.css";
import { useUserView } from "./hooks/useUserView";
import { sameTarget } from "./processors/sameTarget";
import { getLineMaskRects } from "./processors/getLineMaskRects";

const { defineElement, property, event, method } = createDecorators();

export interface EoDiagramProps {
  layout?: "dagre" | "force";
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  nodeBricks?: NodeBrickConf[];
  lines?: LineConf[];
  layoutOptions?: LayoutOptions;
  connectNodes?: ConnectNodesOptions;
  dragNodes?: DragNodesOptions;
  activeTarget?: ActiveTarget | null;
  disableKeyboardAction?: boolean;
  zoomable?: boolean;
  scrollable?: boolean;
  pannable?: boolean;
  scaleRange?: RangeTuple;
}

export interface DiagramRef {
  callOnLineLabel(id: string, method: string, ...args: unknown[]): void;
}

export const EoDiagramComponent = forwardRef(LegacyEoDiagramComponent);

export interface EoDiagramEventsMap {
  "activeTarget.change": CustomEvent<ActiveTarget | null>;
  "node.delete": CustomEvent<DiagramNode>;
  "edge.delete": CustomEvent<DiagramEdge>;
  "line.click": CustomEvent<LineTarget>;
  "line.dblclick": CustomEvent<LineTarget>;
  "nodes.connect": CustomEvent<ConnectLineDetail>;
}

export interface EoDiagramEventsMapping {
  onActiveTargetChange: "activeTarget.change";
  onNodeDelete: "node.delete";
  onEdgeDelete: "edge.delete";
  onLineClick: "line.click";
  onLineDblclick: "line.dblclick";
  onNodesConnect: "nodes.connect";
}

/**
 * @description 图表构件，支持 dagre（有向无环图）和 force（力导向图）两种布局，可渲染节点和连线，支持缩放、平移、拖拽节点、连线交互等功能。
 * @category diagram
 */
export
@defineElement("eo-diagram", {
  styleTexts: [styleText],
})
class EoDiagram extends ReactNextElement implements EoDiagramProps {
  /**
   * @description 图表布局类型，支持 `dagre`（层次有向图）和 `force`（力导向图）。
   * @required
   */
  @property({ type: String })
  accessor layout: "dagre" | "force" | undefined;

  /**
   * @description 节点数据列表，每个节点需包含唯一 `id` 字段。
   */
  @property({ attribute: false })
  accessor nodes: DiagramNode[] | undefined;

  /**
   * @description 边（连线）数据列表，每条边需包含 `source` 和 `target` 字段，指向节点 id。
   */
  @property({ attribute: false })
  accessor edges: DiagramEdge[] | undefined;

  /**
   * @description 节点砖块配置，指定渲染节点使用的自定义构件，可按节点类型匹配不同配置。
   */
  @property({ attribute: false })
  accessor nodeBricks: NodeBrickConf[] | undefined;

  /**
   * @description 连线样式配置，支持箭头、颜色、标签、交互等多种选项。
   */
  @property({ attribute: false })
  accessor lines: LineConf[] | undefined;

  /**
   * @description 布局算法选项，dagre 布局支持 rankdir、ranksep、nodesep 等，force 布局支持 dummyNodesOnEdges、collide 等。
   */
  @property({ attribute: false })
  accessor layoutOptions: LayoutOptions | undefined;

  /**
   * @description 当前激活目标，可以是节点（`{ type: "node", nodeId }`) 或边（`{ type: "edge", edge }`），为 null 表示无激活目标。
   */
  @property({ attribute: false })
  accessor activeTarget: ActiveTarget | null | undefined;

  /**
   * @description 是否禁用键盘操作（删除节点/边、切换激活节点），当有标签正在编辑时可临时禁用以避免冲突。
   */
  @property({ type: Boolean })
  accessor disableKeyboardAction: boolean | undefined;

  /**
   * @description 连线交互配置，启用后支持从节点拖拽出新的连线，可配置连线样式和源节点过滤条件。
   */
  @property({ attribute: false })
  accessor connectNodes: ConnectNodesOptions | undefined;

  /**
   * @description 拖拽节点配置，启用后支持手动拖拽节点调整位置，可配置是否保存用户视图。
   */
  @property({ attribute: false })
  accessor dragNodes: DragNodesOptions | undefined;

  /**
   * @description 是否允许通过鼠标滚轮或触控板捏合手势缩放图表，默认为 true。
   */
  @property({ type: Boolean })
  accessor zoomable: boolean | undefined = true;

  /**
   * @description 是否允许通过滚轮平移图表（非捏合手势），默认为 true。
   */
  @property({ type: Boolean })
  accessor scrollable: boolean | undefined = true;

  /**
   * @description 是否允许通过鼠标拖拽平移图表，默认为 true。
   */
  @property({ type: Boolean })
  accessor pannable: boolean | undefined = true;

  /**
   * @description 缩放比例范围，格式为 `[min, max]`，默认范围由内部常量决定。
   */
  @property({ attribute: false })
  accessor scaleRange: RangeTuple | undefined;

  /**
   * @detail `ActiveTarget | null` — 当前激活目标，`{ type: "node", nodeId }` 或 `{ type: "edge", edge }` 或 null
   * @description 激活目标变化时触发，当用户点击节点或边使其激活，或点击空白处取消激活时触发。
   */
  @event({ type: "activeTarget.change" })
  accessor #activeTargetChangeEvent!: EventEmitter<ActiveTarget | null>;

  #handleActiveTargetChange = (target: ActiveTarget | null) => {
    this.#activeTargetChangeEvent.emit(target);
  };

  /**
   * @detail `DiagramNode` — 被删除的节点对象，包含节点 id 及其他自定义字段
   * @description 用户按 Delete/Backspace 键且当前激活目标为节点时触发，需外部处理实际删除逻辑。
   */
  @event({ type: "node.delete" })
  accessor #nodeDelete!: EventEmitter<DiagramNode>;

  #handleNodeDelete = (node: DiagramNode) => {
    this.#nodeDelete.emit(node);
  };

  /**
   * @detail `DiagramEdge` — 被删除的边对象，包含 source、target 及其他自定义字段
   * @description 用户按 Delete/Backspace 键且当前激活目标为边时触发，需外部处理实际删除逻辑。
   */
  @event({ type: "edge.delete" })
  accessor #edgeDelete!: EventEmitter<DiagramEdge>;

  #handleEdgeDelete = (edge: DiagramEdge) => {
    this.#edgeDelete.emit(edge);
  };

  /**
   * @detail `LineTarget` — 被点击的连线信息，包含 `{ id: 连线唯一标识, edge: 对应的边数据 }`
   * @description 用户点击可交互连线时触发。
   */
  @event({ type: "line.click" })
  accessor #lineClick!: EventEmitter<LineTarget>;

  #handleLineClick = (line: LineTarget) => {
    this.#lineClick.emit(line);
  };

  /**
   * @detail `LineTarget` — 被双击的连线信息，包含 `{ id: 连线唯一标识, edge: 对应的边数据 }`
   * @description 用户双击可交互连线时触发，常用于触发连线标签编辑。
   */
  @event({ type: "line.dblclick" })
  accessor #lineDoubleClick!: EventEmitter<LineTarget>;

  #handleLineDoubleClick = (line: LineTarget) => {
    this.#lineDoubleClick.emit(line);
  };

  /**
   * @detail `ConnectLineDetail` — 连线详情，包含 `{ source: 起始节点, target: 目标节点 }`
   * @description 用户从一个节点拖拽连线到另一个节点并释放时触发，需外部处理实际建立连接的逻辑。
   */
  @event({ type: "nodes.connect" })
  accessor #connectNodes!: EventEmitter<ConnectLineDetail>;

  #handleNodesConnect = (detail: ConnectLineDetail) => {
    this.#connectNodes.emit(detail);
  };

  #handleSwitchActiveTarget = (target: ActiveTarget | null) => {
    if (!sameTarget(target, this.activeTarget)) {
      this.activeTarget = target;
    }
  };

  #diagramRef = createRef<DiagramRef>();

  /**
   * @description 调用指定 id 的连线标签构件上的方法，常用于触发标签编辑（如 `callOnLineLabel(id, "enableEditing")`）。
   * @param id 连线标签的 id（格式通常为 `${lineId}-${placement}`）
   * @param method 要调用的方法名
   * @param args 传递给方法的参数列表
   */
  @method()
  callOnLineLabel(id: string, method: string, ...args: unknown[]) {
    this.#diagramRef.current?.callOnLineLabel(id, method, ...args);
  }

  render() {
    return (
      <EoDiagramComponent
        ref={this.#diagramRef}
        layout={this.layout}
        nodes={this.nodes}
        edges={this.edges}
        nodeBricks={this.nodeBricks}
        lines={this.lines}
        layoutOptions={this.layoutOptions}
        connectNodes={this.connectNodes}
        dragNodes={this.dragNodes}
        activeTarget={this.activeTarget}
        disableKeyboardAction={this.disableKeyboardAction}
        zoomable={this.zoomable}
        scrollable={this.scrollable}
        pannable={this.pannable}
        scaleRange={this.scaleRange}
        onActiveTargetChange={this.#handleActiveTargetChange}
        onSwitchActiveTarget={this.#handleSwitchActiveTarget}
        onNodeDelete={this.#handleNodeDelete}
        onEdgeDelete={this.#handleEdgeDelete}
        onLineClick={this.#handleLineClick}
        onLineDoubleClick={this.#handleLineDoubleClick}
        onNodesConnect={this.#handleNodesConnect}
      />
    );
  }
}

export interface EoDiagramComponentProps extends EoDiagramProps {
  onActiveTargetChange?(target: ActiveTarget | null): void;
  onSwitchActiveTarget?(target: ActiveTarget | null): void;
  onNodeDelete?(node: DiagramNode): void;
  onEdgeDelete?(edge: DiagramEdge): void;
  onLineClick?(line: LineTarget): void;
  onLineDoubleClick?(line: LineTarget): void;
  onNodesConnect?(detail: ConnectLineDetail): void;
}

export function LegacyEoDiagramComponent(
  {
    layout,
    nodes,
    edges,
    nodeBricks,
    lines,
    layoutOptions,
    connectNodes,
    dragNodes,
    activeTarget: _activeTarget,
    disableKeyboardAction,
    zoomable,
    scrollable,
    pannable,
    scaleRange: _scaleRange,
    onActiveTargetChange,
    onSwitchActiveTarget,
    onNodeDelete,
    onEdgeDelete,
    onLineClick,
    onLineDoubleClick,
    onNodesConnect,
  }: EoDiagramComponentProps,
  ref: React.Ref<DiagramRef>
) {
  const [nodesReady, setNodesReady] = useState(false);
  const [nodesRenderId, setNodesRenderId] = useState(0);
  const [nodesRefRepository, setNodesRefRepository] =
    useState<RefRepository | null>(null);
  const [lineLabelsReady, setLineLabelsReady] = useState(false);
  const [lineLabelsRenderId, setLineLabelsRenderId] = useState(0);
  const [lineLabelsRefRepository, setLineLabelsRefRepository] =
    useState<RefRepository | null>(null);
  const [renderedLineLabels, setRenderedLineLabels] = useState<
    RenderedLineLabel[]
  >([]);

  const [grabbing, setGrabbing] = useState(false);
  const [transform, setTransform] = useState<TransformLiteral>({
    k: 1,
    x: 0,
    y: 0,
  });

  const linePathsRef = useRef(new Map<string, SVGPathElement | null>());

  const rootRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<HTMLDivElement>(null);
  const [centered, setCentered] = useState(false);

  const { userViewReady, userViewNodesMap, saveUserView } = useUserView(
    dragNodes?.save
  );

  const [connectLineTo, setConnectLineTo] = useState<PositionTuple>([0, 0]);
  const [connectLineState, setConnectLineState] =
    useState<ConnectLineState | null>(null);
  const [manualLayoutStatus, setManualLayoutStatus] =
    useState<ManualLayoutStatus>("initial");
  const [nodeMovement, setNodeMovement] = useState<NodeMovement | null>(null);

  useImperativeHandle(ref, () => ({
    callOnLineLabel(id, method, ...args) {
      (
        lineLabelsRefRepository?.get(id)
          ?.firstElementChild as unknown as Record<string, Function>
      )?.[method](...args);
    },
  }));

  useEffect(() => {
    const onNodesMouseDown = (event: MouseEvent) => {
      handleNodesMouseDown(event, {
        nodes,
        nodesRefRepository,
        connectNodes,
        dragNodes,
        scale: transform.k,
        setConnectLineState,
        setConnectLineTo,
        setManualLayoutStatus,
        setNodeMovement,
        onSwitchActiveTarget,
        onNodesConnect,
      });
    };
    // Bind mousedown event manually, since the React event handler can't work with
    // d3-zoom inside shadow DOM.
    const nodesContainer = nodesRef.current;
    nodesContainer?.addEventListener("mousedown", onNodesMouseDown);
    return () => {
      nodesContainer?.removeEventListener("mousedown", onNodesMouseDown);
    };
  }, [
    nodes,
    connectNodes,
    dragNodes,
    transform.k,
    nodesRefRepository,
    onNodesConnect,
    onSwitchActiveTarget,
  ]);

  const { normalizedLines, normalizedLinesMap, markers } = useMemo(
    () => normalizeLinesAndMarkers(edges, lines),
    [edges, lines]
  );

  const lineLabels = useMemo(() => {
    return normalizedLines.flatMap(({ line: { text, label, $id }, edge }) => {
      if (!text && !label) {
        return [] as LineLabel[];
      }

      let key: "label" | "text";
      let list: LineLabelConf[] | TextOptions[];
      if (label) {
        key = "label";
        list = ([] as LineLabelConf[]).concat(label);
      } else {
        key = "text";
        list = ([] as TextOptions[]).concat(text!);
      }

      return list.map<LineLabel>((item) => ({
        [key as "label"]: item as LineLabelConf,
        id: `${$id}-${item.placement ?? "center"}`,
        edge,
      }));
    });
  }, [normalizedLines]);

  const { nodes: renderedNodes, edges: renderedEdges } = useRenderedDiagram({
    layout,
    nodes,
    edges,
    manualLayoutStatus,
    userViewReady,
    userViewNodesMap,
    nodeMovement,
    nodesRefRepository,
    lineLabelsRefRepository,
    normalizedLinesMap,
    layoutOptions,
    nodesRenderId,
    lineLabelsRenderId,
  });

  useEffect(
    () => {
      if (manualLayoutStatus === "finished") {
        saveUserView(
          renderedNodes.map((node) => ({
            id: node.id,
            x: node.x,
            y: node.y,
          }))
        );
      }
    },
    // Only save user view when manual layout is just finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manualLayoutStatus]
  );

  const renderedLines = useMemo(
    () => getRenderedLines(renderedEdges, renderedNodes, normalizedLines),
    [normalizedLines, renderedNodes, renderedEdges]
  );

  const newActiveTarget = _activeTarget ?? null;
  const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(
    newActiveTarget
  );

  useEffect(() => {
    setActiveTarget((previous) =>
      sameTarget(previous, newActiveTarget) ? previous : newActiveTarget
    );
  }, [newActiveTarget]);

  const activeTargetChangeInitialized = useRef(false);
  useEffect(() => {
    if (!activeTargetChangeInitialized.current) {
      activeTargetChangeInitialized.current = true;
      return;
    }
    onActiveTargetChange?.(activeTarget);
  }, [activeTarget, onActiveTargetChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || disableKeyboardAction) {
      return;
    }
    const onKeydown = (event: KeyboardEvent) => {
      const action = handleKeyboard(event, {
        renderedNodes,
        activeTarget,
      });

      if (action?.action === "delete-node") {
        onNodeDelete?.(action.node);
      } else if (action?.action === "delete-edge") {
        onEdgeDelete?.(action.edge);
      } else if (action?.action === "switch-active-node" && action.node) {
        onSwitchActiveTarget?.({ type: "node", nodeId: action.node.id });
      }
    };
    root.addEventListener("keydown", onKeydown);
    return () => {
      root.removeEventListener("keydown", onKeydown);
    };
  }, [
    activeTarget,
    renderedNodes,
    disableKeyboardAction,
    onSwitchActiveTarget,
    onNodeDelete,
    onEdgeDelete,
  ]);

  const handleNodesRendered = useCallback(
    (refRepository: RefRepository | null) => {
      if (refRepository) {
        setNodesRenderId((previous) => previous + 1);
        setNodesRefRepository(refRepository);
      }
      setNodesReady((previous) => previous || !!refRepository);
    },
    []
  );

  const handleLineLabelsRendered = useCallback(
    (refRepository: RefRepository | null) => {
      if (refRepository) {
        setLineLabelsRenderId((previous) => previous + 1);
        setLineLabelsRefRepository(refRepository);
      }
      setLineLabelsReady((previous) => previous || !!refRepository);
    },
    []
  );

  const scaleRange = useMemo(
    () =>
      _scaleRange ??
      ([DEFAULT_SCALE_RANGE_MIN, DEFAULT_SCALE_RANGE_MAX] as RangeTuple),
    [_scaleRange]
  );

  const zoomer = useMemo(() => zoom<HTMLDivElement, unknown>(), []);

  useEffect(() => {
    let moved = false;
    zoomer
      .scaleExtent(zoomable ? scaleRange : [1, 1])
      .on("start", () => {
        moved = false;
        setGrabbing(true);
      })
      .on("zoom", (e: { transform: TransformLiteral }) => {
        moved = true;
        setTransform(e.transform);
      })
      .on("end", () => {
        setGrabbing(false);
        if (!moved) {
          onSwitchActiveTarget?.(null);
        }
      });
  }, [onSwitchActiveTarget, scaleRange, zoomable, zoomer]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const rootSelection = select(root);

    const unsetZoom = () => {
      rootSelection
        .on(".zoom", null)
        .on(".zoom.custom", null)
        .on("wheel", null);
    };

    if (!(zoomable || scrollable || pannable)) {
      unsetZoom();
      return;
    }

    if (zoomable || scrollable) {
      // Do not override default d3 zoom handler.
      // Only handles *panning*
      rootSelection.on(
        "wheel.zoom.custom",
        (e: WheelEvent & { wheelDeltaX: number; wheelDeltaY: number }) => {
          // Mac OS trackpad pinch event is emitted as a wheel.zoom and d3.event.ctrlKey set to true
          if (!e.ctrlKey) {
            // Stop immediate propagation for default d3 zoom handler
            e.stopImmediatePropagation();
            if (scrollable) {
              e.preventDefault();
              zoomer.translateBy(
                rootSelection,
                e.wheelDeltaX / 5,
                e.wheelDeltaY / 5
              );
            }
          }
          // zoomer.scaleBy(rootSelection, Math.pow(2, defaultWheelDelta(e)))
        }
      );
    }

    rootSelection
      .call(zoomer)
      .on("wheel", (e: WheelEvent) => e.preventDefault())
      .on("dblclick.zoom", null);

    if (!pannable) {
      rootSelection
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);
    }

    return unsetZoom;
  }, [pannable, scrollable, zoomable, zoomer]);

  useEffect(() => {
    const root = rootRef.current;
    if (renderedNodes.length === 0 || !root || centered) {
      return;
    }
    const { k, x, y } = transformToCenter(renderedNodes, {
      canvasWidth: root.clientWidth,
      canvasHeight: root.clientHeight,
      scaleRange: zoomable ? scaleRange : undefined,
    });
    zoomer.transform(select(root), new ZoomTransform(k, x, y));
    setCentered(true);
  }, [centered, renderedNodes, scaleRange, zoomable, zoomer]);

  const defPrefix = useMemo(() => `${uniqueId("diagram-")}-`, []);
  const markerPrefix = `${defPrefix}line-arrow-`;
  const maskPrefix = `${defPrefix}mask-`;
  const activeLineMarkerPrefix = `${defPrefix}active-line-`;

  useEffect(() => {
    setRenderedLineLabels((previous) =>
      getRenderedLineLabels(previous, renderedLines, linePathsRef.current)
    );
  }, [renderedLines]);

  const [lineMaskRects, setLineMaskRects] = React.useState<LineMaskRects>(
    new Map()
  );

  useEffect(() => {
    if (!lineLabelsRefRepository) {
      return;
    }
    const updateLineMaskRects = () => {
      setLineMaskRects(
        getLineMaskRects(renderedLineLabels, lineLabelsRefRepository)
      );
    };

    adjustLineLabels(renderedLineLabels, lineLabelsRefRepository);

    const observer = new ResizeObserver(updateLineMaskRects);
    for (const lineLabel of lineLabelsRefRepository.values()) {
      observer.observe(lineLabel);
    }
    return () => {
      observer.disconnect();
    };
  }, [lineLabelsRenderId, lineLabelsRefRepository, renderedLineLabels]);

  if (layout !== "dagre" && layout !== "force") {
    return <div>{`Diagram layout not supported: "${layout}"`}</div>;
  }

  return (
    <div
      className={classNames("diagram", {
        ready: nodesReady && centered,
        grabbing,
        pannable,
      })}
      tabIndex={-1}
      ref={rootRef}
    >
      <svg width="100%" height="100%" className="lines">
        <defs>
          {markers.map(({ type, strokeColor }, index) => (
            <MarkerComponent
              key={index}
              id={`${markerPrefix}${index}`}
              type={type}
              strokeColor={strokeColor}
            />
          ))}
          {[...lineMaskRects].map(([lineId, rects]) => (
            <LineMaskComponent
              key={lineId}
              lineId={lineId}
              rects={rects}
              maskPrefix={maskPrefix}
              renderedLineLabels={renderedLineLabels}
            />
          ))}
          <marker
            id={`${activeLineMarkerPrefix}start`}
            viewBox="0 0 8 8"
            refX={4}
            refY={4}
            markerWidth={8}
            markerHeight={8}
            orient="auto"
          >
            <path
              d="M 0.5 0.5 H 7.5 V 7.5 H 0.5 Z"
              stroke="var(--palette-gray-7)"
              strokeWidth={1}
              fill="var(--palette-gray-1)"
            />
          </marker>
          <marker
            id={`${activeLineMarkerPrefix}end`}
            viewBox="0 0 14 8"
            refX={3}
            refY={4}
            markerWidth={14}
            markerHeight={8}
            orient="auto"
          >
            <path
              d="M 0.5 1.5 L 5.5 4 L 0.5 6.5 z"
              stroke="var(--palette-blue-3)"
              strokeWidth={1}
              fill="var(--palette-blue-3)"
            />
            <path
              d="M 6.5 0.5 H 13.5 V 7.5 H 6.5 Z"
              stroke="var(--palette-gray-7)"
              strokeWidth={1}
              fill="var(--palette-gray-1)"
            />
          </marker>
        </defs>
        <g
          transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}
        >
          {renderedLines.map((line) => (
            <LineComponent
              key={line.line.$id}
              line={line}
              linePaths={linePathsRef.current}
              lineMaskRects={lineMaskRects}
              maskPrefix={maskPrefix}
              markerPrefix={markerPrefix}
              activeLineMarkerPrefix={activeLineMarkerPrefix}
              active={
                activeTarget?.type === "edge" &&
                activeTarget.edge.source === line.edge.source &&
                activeTarget.edge.target === line.edge.target
              }
              activeRelated={
                activeTarget?.type === "node" &&
                (line.edge.source === activeTarget.nodeId ||
                  line.edge.target === activeTarget.nodeId)
              }
              onLineClick={onLineClick}
              onLineDoubleClick={onLineDoubleClick}
            />
          ))}
        </g>
      </svg>
      <div
        className={classNames("line-labels", { ready: lineLabelsReady })}
        style={{
          left: transform.x,
          top: transform.y,
          transform: `scale(${transform.k})`,
        }}
      >
        <LineLabelComponentGroup
          labels={lineLabels}
          onRendered={handleLineLabelsRendered}
        />
      </div>
      <div
        className="nodes"
        ref={nodesRef}
        style={{
          left: transform.x,
          top: transform.y,
          transform: `scale(${transform.k})`,
        }}
      >
        <NodeComponentGroup
          nodes={nodes}
          nodeBricks={nodeBricks}
          // nodePositions={nodePositions}
          onRendered={handleNodesRendered}
        />
      </div>
      <ConnectLineComponent
        connectLineState={connectLineState}
        connectLineTo={connectLineTo}
        markerPrefix={markerPrefix}
      />
    </div>
  );
}
