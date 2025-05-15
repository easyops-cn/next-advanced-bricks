// istanbul ignore file: experimental
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
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
import { select } from "d3-selection";
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
import { CANVAS_PADDING_BOTTOM, DONE_STATES } from "./constants.js";
import { WrappedIcon, WrappedLink } from "./bricks.js";
import { CanvasContext } from "./CanvasContext.js";
import { ToolCallDetail } from "./ToolCallDetail/ToolCallDetail.js";

initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();

const MemoizedNodeComponent = memo(NodeComponent);

export interface CruiseCanvasProps {
  taskId?: string;
  task?: TaskBaseDetail;
  jobs?: Job[];
  goBackUrl?: string;
  flagShowTaskActions?: boolean;
}

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

  @property({ type: Boolean })
  accessor flagShowTaskActions: boolean | undefined;

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

  @event({ type: "stop" })
  accessor #stopEvent!: EventEmitter<void>;

  #onStop = () => {
    this.#stopEvent.emit();
  };

  render() {
    return (
      <CruiseCanvasComponent
        taskId={this.taskId}
        jobs={this.jobs}
        task={this.task}
        goBackUrl={this.goBackUrl}
        flagShowTaskActions={this.flagShowTaskActions}
        onShare={this.#onShare}
        onPause={this.#onPause}
        onResume={this.#onResume}
        onStop={this.#onStop}
      />
    );
  }
}

export interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  onShare: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function CruiseCanvasComponent({
  taskId,
  task: propTask,
  jobs: propJobs,
  goBackUrl,
  flagShowTaskActions,
  onShare,
  onPause,
  onResume,
  onStop,
}: CruiseCanvasComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    task: _task,
    jobs: _jobs,
    plan: _plan,
    error,
    humanInputRef,
  } = useTaskDetail(taskId);
  const task = taskId ? _task : propTask;
  const jobs = taskId ? _jobs : propJobs;
  const plan = taskId ? _plan : propTask?.plan;
  const graph = useTaskGraph(task, jobs);
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;

  const pageTitle = task?.title ?? "";

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
    state: task?.state,
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
  });

  const taskDone = DONE_STATES.includes(task?.state ?? "working");
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
      zoomer.translateBy(select(rootRef.current!), 0, diffY);
    }
  }, [bottom, transformRef, zoomer]);

  // Detect if the user scrolled up manually
  useEffect(() => {
    const bottom = bottomRef.current;
    const root = rootRef.current;
    if (!root || bottom === null) {
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

  const [activeToolCallJobId, setActiveToolCallJobId] = useState<string | null>(
    null
  );

  const canvasContextValue = useMemo(
    () => ({
      flagShowTaskActions,
      humanInput,
      onShare,
      onPause,
      onResume,
      onStop,
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
      onStop,
      flagShowTaskActions,
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
                !DONE_STATES.includes(node.state ?? "working")
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
        <PlanProgress plan={plan} state={task?.state} />
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
      ) : (
        <NodeJob state={state} job={job!} />
      )}
    </div>
  );
}
