// istanbul ignore file: experimental
import React, {
  createRef,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { getRuntime, handleHttpError } from "@next-core/runtime";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import { select, type Selection } from "d3-selection";
import { mergeRects } from "@next-shared/diagram";
import { NS, locales } from "./i18n.js";
import styles from "./styles.module.css";
import { useZoom } from "./useZoom.js";
import type {
  SizeTuple,
  GraphNode,
  Job,
  RequirementGraphNode,
  JobGraphNode,
  TaskBaseDetail,
  GraphEdge,
} from "./interfaces.js";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useTaskDetail } from "./useTaskDetail.js";
import { useTaskGraph } from "./useTaskGraph.js";
import { PlanProgress } from "./PlanProgress/PlanProgress.js";
import { ZoomBar } from "./ZoomBar/ZoomBar.js";
import { NodeStart } from "./NodeStart/NodeStart.js";
import { NodeRequirement } from "./NodeRequirement/NodeRequirement.js";
import { NodeInstruction } from "./NodeInstruction/NodeInstruction.js";
import { NodeJob } from "./NodeJob/NodeJob.js";
import { NodeEnd } from "./NodeEnd/NodeEnd.js";
import { NodeView } from "./NodeView/NodeView.js";
import {
  CANVAS_PADDING_BOTTOM,
  CANVAS_PADDING_LEFT,
  CANVAS_PADDING_RIGHT,
  CANVAS_PADDING_TOP,
  DONE_STATES,
  GENERAL_DONE_STATES,
} from "./constants.js";
import { WrappedIcon, WrappedLink } from "./bricks.js";
import { CanvasContext } from "./CanvasContext.js";
import { ToolCallDetail } from "./ToolCallDetail/ToolCallDetail.js";
import { getScrollTo } from "./utils/getScrollTo.js";

initializeI18n(NS, locales);

const { defineElement, property, event, method } = createDecorators();

const MemoizedNodeComponent = memo(NodeComponent);

export interface CruiseCanvasProps {
  taskId?: string;
  task?: TaskBaseDetail;
  jobs?: Job[];
  goBackUrl?: string;
}

const CruiseCanvasComponent = forwardRef(LegacyCruiseCanvasComponent);

/**
 * 构件 `ai-portal.cruise-canvas`
 */
export
@defineElement("ai-portal.cruise-canvas", {
  // Will wrap v2 bricks which don't support in shadow DOM.
  shadowOptions: false,
})
class CruiseCanvas extends ReactNextElement implements CruiseCanvasProps {
  @property()
  accessor taskId: string | undefined;

  @property({ attribute: false })
  accessor task: TaskBaseDetail | undefined;

  @property({ attribute: false })
  accessor jobs: Job[] | undefined;

  @property()
  accessor goBackUrl: string | undefined;

  @event({ type: "share" })
  accessor #shareEvent!: EventEmitter<void>;

  #onShare = () => {
    this.#shareEvent.emit();
  };

  @event({ type: "pause" })
  accessor #pauseEvent!: EventEmitter<void>;

  #onPause = () => {
    this.#pauseEvent.emit();
  };

  @event({ type: "resume" })
  accessor #resumeEvent!: EventEmitter<void>;

  #onResume = () => {
    this.#resumeEvent.emit();
  };

  @event({ type: "cancel" })
  accessor #cancelEvent!: EventEmitter<void>;

  #onCancel = () => {
    this.#cancelEvent.emit();
  };

  #ref = createRef<CruiseCanvasRef>();

  @method()
  resumed() {
    this.#ref.current?.resumed();
  }

  render() {
    return (
      <CruiseCanvasComponent
        taskId={this.taskId}
        jobs={this.jobs}
        task={this.task}
        goBackUrl={this.goBackUrl}
        onShare={this.#onShare}
        onPause={this.#onPause}
        onResume={this.#onResume}
        onCancel={this.#onCancel}
        ref={this.#ref}
      />
    );
  }
}

interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  onShare: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

interface ScrollToOptions {
  nodeId?: string;
  jobId?: string;

  /**
   * @default "auto"
   */
  behavior?: "smooth" | "instant" | "auto";

  /**
   * When set to "start", force scroll even if the node is fully visible.
   *
   * @default "nearest"
   */
  block?: "start" | "nearest";
}

interface CruiseCanvasRef {
  resumed: () => void;
}

function LegacyCruiseCanvasComponent(
  {
    taskId,
    task: propTask,
    jobs: propJobs,
    goBackUrl,
    onShare,
    onPause,
    onResume,
    onCancel,
  }: CruiseCanvasComponentProps,
  ref: React.Ref<CruiseCanvasRef>
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    task: _task,
    jobs: _jobs,
    plan: _plan,
    error,
    humanInputRef,
    resumedRef,
  } = useTaskDetail(taskId);
  const task = taskId ? _task : propTask;
  const jobs = taskId ? _jobs : propJobs;
  const plan = taskId ? _plan : propTask?.plan;
  const graph = useTaskGraph(task, jobs);
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;
  const nav = graph?.nav;
  const pageTitle = task?.title ?? "";
  const taskState = task?.state;

  useImperativeHandle(
    ref,
    () => ({
      resumed: () => resumedRef.current?.(),
    }),
    [resumedRef]
  );

  // Enable transition after 3 seconds to avoid initial flicker
  const transitionEnabledRef = useRef(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      transitionEnabledRef.current = true;
    }, 3e3);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const transitionRef = useRef(false);
  const selectTransition = useCallback(
    (
      selection: Selection<HTMLDivElement, unknown, null, undefined>,
      duration?: number
    ) => {
      if (!transitionEnabledRef.current || duration === 0) {
        return selection;
      }
      transitionRef.current = true;
      return selection
        .transition()
        .duration(duration ?? 300)
        .ease((t) => t * (2 - t)) // Ease in-out
        .on("end", () => {
          transitionRef.current = false;
        });
    },
    []
  );

  useEffect(() => {
    getRuntime().applyPageTitle(pageTitle);
  }, [pageTitle]);

  useEffect(() => {
    if (error) {
      handleHttpError(error);
    }
  }, [error]);

  const humanInput = useCallback(
    (jobId: string, input: string) => {
      humanInputRef.current?.(jobId, input);
    },
    [humanInputRef]
  );

  const [sizeMap, setSizeMap] = useState<Map<string, SizeTuple> | null>(null);
  const onNodeResize = useCallback((id: string, size: SizeTuple | null) => {
    // Handle resize logic here
    setSizeMap((prev) => {
      if (!size) {
        if (!prev) {
          return null;
        }
        const newMap = new Map(prev);
        const deleted = newMap.delete(id);
        return deleted ? newMap : prev;
      }
      return prev ? new Map(prev).set(id, size) : new Map([[id, size]]);
    });
  }, []);

  const { sizeReady, nodes, edges } = useLayout({
    rawNodes,
    rawEdges,
    state: taskState,
    sizeMap,
  });

  const { grabbing, transform, transformRef, zoomer /* , scaleRange */ } =
    useZoom({
      rootRef,
      zoomable: sizeReady,
      scrollable: sizeReady,
      pannable: sizeReady,
    });

  const { centered, setCentered, reCenterRef } = useAutoCenter({
    nodes,
    sizeReady,
    zoomer,
    rootRef,
    selectTransition,
  });

  const taskDone = DONE_STATES.includes(taskState ?? "working");
  const taskLoading = !taskDone && nodes.length === 2;

  const nonLeafNodes = useMemo(() => {
    return new Set<string>(edges.map((edge) => edge.source));
  }, [edges]);

  const bottom = useMemo(() => {
    if (!sizeReady) {
      return null;
    }

    const leafNodes: GraphNode[] = [];
    for (const node of nodes) {
      if (!nonLeafNodes.has(node.id)) {
        leafNodes.push(node);
      }
    }
    if (leafNodes.length > 0) {
      const y1 = Math.max(
        ...leafNodes.map((node) => node.view!.y + node.view!.height)
      );
      return y1;
    }

    return null;
  }, [nodes, nonLeafNodes, sizeReady]);

  const bottomRef = useRef<number | null>(null);
  useEffect(() => {
    bottomRef.current = bottom;
  }, [bottom]);

  // Disable auto scroll when the user manually scrolled up
  const manualScrolledUpRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || bottom === null || manualScrolledUpRef.current) {
      return;
    }
    const { offsetHeight } = root;
    const transform = transformRef.current;
    const transformedBottom = bottom * transform.k + transform.y;
    const diffY = offsetHeight - CANVAS_PADDING_BOTTOM - transformedBottom;
    if (diffY < 0) {
      // Make the latest node visible
      zoomer.translateBy(
        selectTransition(
          select(root),
          diffY > -100 ? 100 : diffY < -500 ? 300 : 200
        ),
        0,
        diffY / transform.k
      );
    }
  }, [bottom, transformRef, zoomer, selectTransition]);

  // Detect if the user scrolled up manually
  useEffect(() => {
    const bottom = bottomRef.current;
    const root = rootRef.current;
    if (!root || bottom === null || transitionRef.current) {
      return;
    }
    const { offsetHeight } = root;
    const transformedBottom = bottom * transform.k + transform.y;

    const diffY = offsetHeight - CANVAS_PADDING_BOTTOM - transformedBottom;
    manualScrolledUpRef.current = diffY < 0;
  }, [transform, zoomer]);

  const handleReCenter = useCallback(() => {
    reCenterRef.current = true;
    setCentered(false);
  }, [reCenterRef, setCentered]);

  const handleScaleChange = useCallback(
    (scale: number) => {
      zoomer.scaleTo(select(rootRef.current!), scale);
    },
    [zoomer]
  );

  const [activeNavId, setActiveNavId] = useState<string | undefined>();

  // Find the active nav item by node position against the canvas top
  useEffect(() => {
    if (!sizeReady) {
      return;
    }

    const timer = setTimeout(() => {
      let distance = Infinity;
      let navId: string | undefined;
      for (const node of nodes) {
        if (node.type === "instruction") {
          const y = node.view!.y * transform.k + transform.y;
          const diff = y - CANVAS_PADDING_TOP;
          if (diff >= 0 && diff < distance) {
            distance = diff;
            navId = node.job.id;
          }
        }
      }
      setActiveNavId(navId);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [nodes, sizeReady, transform]);

  const scrollTo = useCallback(
    ({ nodeId, jobId, behavior, block }: ScrollToOptions) => {
      /**
       * - When the node is fully visible, take no action.
       * - Otherwise, scroll to make it fully visible while make the scroll
       *   distance as small as possible.
       * - Special cases:
       *   - When the node is higher or wider than the viewport, scroll to
       *     the top or left of the node.
       */
      const root = rootRef.current;
      const targets = nodes.filter((n) => {
        if (nodeId && n.id !== nodeId) {
          return false;
        }
        if (jobId && (n as JobGraphNode).job?.id !== jobId) {
          return false;
        }
        return true;
      });
      if (!root || targets.length === 0) {
        return;
      }
      const rect = mergeRects(targets.map((node) => node.view!));

      const { x, y } = getScrollTo(
        rect,
        [root.offsetWidth, root.offsetHeight],
        [
          CANVAS_PADDING_TOP,
          CANVAS_PADDING_RIGHT,
          CANVAS_PADDING_BOTTOM,
          CANVAS_PADDING_LEFT,
        ],
        transformRef.current,
        block
      );

      if (x || y) {
        zoomer.translateBy(
          selectTransition(
            select(root),
            behavior === "instant" ? 0 : undefined
          ),
          x,
          y
        );
      }
    },
    [nodes, selectTransition, transformRef, zoomer]
  );

  const [activeToolCallJobId, setActiveToolCallJobId] = useState<string | null>(
    null
  );

  const canvasContextValue = useMemo(
    () => ({
      humanInput,
      onShare,
      onPause,
      onResume,
      onCancel,
      onNodeResize,
      activeToolCallJobId,
      setActiveToolCallJobId,
    }),
    [
      activeToolCallJobId,
      onNodeResize,
      humanInput,
      onShare,
      onPause,
      onResume,
      onCancel,
    ]
  );

  const activeToolCallJob = useMemo(() => {
    if (!activeToolCallJobId) {
      return null;
    }
    return jobs?.find((job) => job.id === activeToolCallJobId);
  }, [activeToolCallJobId, jobs]);

  return (
    <CanvasContext.Provider value={canvasContextValue}>
      <div
        className={classNames(styles.root, { [styles.loading]: !task })}
        ref={rootRef}
        style={{
          cursor: grabbing ? "grabbing" : "grab",
        }}
      >
        {!task && (
          <div className={styles["loading-icon"]}>
            <WrappedIcon
              lib="antd"
              theme="outlined"
              icon="loading-3-quarters"
              spinning
            />
          </div>
        )}
        <div
          className={classNames(styles.canvas, {
            [styles.ready]: sizeReady && centered,
          })}
          style={{
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.k})`,
          }}
        >
          <svg className={styles.edges}>
            {edges.map((edge) => (
              <path
                className={styles.edge}
                key={`${edge.source}-${edge.target}`}
                d={edge
                  .points!.map(
                    ({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`
                  )
                  .join(" ")}
              />
            ))}
          </svg>
          {nodes.map((node) => (
            <MemoizedNodeComponent
              key={node.id}
              id={node.id}
              type={node.type}
              content={(node as RequirementGraphNode).content}
              job={(node as JobGraphNode).job}
              state={node.state}
              startTime={task?.startTime}
              taskLoading={taskLoading}
              instructionLoading={
                node.type === "instruction" &&
                !nonLeafNodes.has(node.id) &&
                !DONE_STATES.includes(node.state ?? "working") &&
                !GENERAL_DONE_STATES.includes(taskState ?? "working")
              }
              edges={edges}
              x={node.view?.x}
              y={node.view?.y}
            />
          ))}
        </div>
      </div>
      <div className={styles.widgets}>
        {goBackUrl && (
          <WrappedLink className={styles["go-back"]} url={goBackUrl}>
            <WrappedIcon lib="fa" prefix="fas" icon="arrow-left-long" />
          </WrappedLink>
        )}
        <div className={styles["nav-container"]}>
          <ul className={styles.nav}>
            {nav?.map((item) => (
              <li
                key={item.id}
                className={classNames(styles["nav-item"], {
                  [styles.active]: activeNavId === item.id,
                })}
              >
                <a
                  className={styles["nav-link"]}
                  onClick={() => {
                    scrollTo({ jobId: item.id, block: "start" });
                  }}
                >
                  <span className={styles["nav-link-text"]}>{item.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <PlanProgress plan={plan} state={taskState} />
        <ZoomBar
          scale={transform.k}
          onScaleChange={handleScaleChange}
          onReCenter={handleReCenter}
        />
      </div>
      {activeToolCallJob && <ToolCallDetail job={activeToolCallJob} />}
    </CanvasContext.Provider>
  );
}

interface NodeComponentProps {
  id: string;
  type: GraphNode["type"];
  edges: GraphEdge[];
  content?: string;
  job?: Job;
  state?: string;
  startTime?: number;
  taskLoading?: boolean;
  instructionLoading?: boolean;
  x?: number;
  y?: number;
}

function NodeComponent({
  id,
  type,
  state,
  job,
  content,
  startTime,
  taskLoading,
  instructionLoading,
  x,
  y,
}: NodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { onNodeResize } = useContext(CanvasContext);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => {
      onNodeResize(id, [element.offsetWidth, element.offsetHeight]);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      onNodeResize(id, null);
    };
  }, [id, onNodeResize]);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }
    const handleMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
    };
    element.addEventListener("mousedown", handleMouseDown);
    return () => {
      element.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  return (
    <div
      className={classNames(styles.node, {
        [styles.ready]: x != null && y != null,
      })}
      ref={nodeRef}
      style={{
        left: x,
        top: y,
      }}
    >
      {type === "start" ? (
        <NodeStart />
      ) : type === "end" ? (
        <NodeEnd />
      ) : type === "requirement" ? (
        <NodeRequirement
          content={content}
          startTime={startTime}
          loading={taskLoading}
        />
      ) : type === "instruction" ? (
        <NodeInstruction
          content={job!.instruction}
          loading={instructionLoading}
        />
      ) : type === "view" ? (
        <NodeView job={job!} />
      ) : (
        <NodeJob state={state} job={job!} />
      )}
    </div>
  );
}
