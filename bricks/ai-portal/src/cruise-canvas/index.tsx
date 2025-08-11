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
import { select, type Selection, type TransitionLike } from "d3-selection";
import { ZoomTransform } from "d3-zoom";
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
  ZoomAction,
  FileInfo,
  FeedbackDetail,
} from "./interfaces.js";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useTaskDetail } from "./useTaskDetail.js";
import { useTaskGraph } from "./useTaskGraph.js";
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
  END_NODE_ID,
  GENERAL_DONE_STATES,
} from "./constants.js";
import { WrappedIcon } from "../shared/bricks";
import { CanvasContext } from "./CanvasContext.js";
import { ToolCallDetail } from "./ToolCallDetail/ToolCallDetail.js";
import { getScrollTo } from "./utils/getScrollTo.js";
import { handleKeyboardNav } from "./utils/handleKeyboardNav.js";
import { ExpandedView } from "../shared/ExpandedView/ExpandedView.js";
import { Nav } from "./Nav/Nav.js";
import { ReplayToolbar } from "../shared/ReplayToolbar/ReplayToolbar.js";
import { ChatBox } from "../shared/ChatBox/ChatBox.js";
import { FilePreview } from "./FilePreview/FilePreview.js";
import { NodeFeedback } from "./NodeFeedback/NodeFeedback.js";
import { TaskContext } from "../shared/TaskContext.js";

initializeI18n(NS, locales);

const { defineElement, property, event, method } = createDecorators();

const MemoizedNodeComponent = memo(NodeComponent);

export interface CruiseCanvasProps {
  taskId?: string;
  task?: TaskBaseDetail;
  jobs?: Job[];
  replay?: boolean;
  replayDelay?: number;
  supports?: Record<string, boolean>;
  showHiddenJobs?: boolean;
  showFeedback?: boolean;
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

  /** 是否启用回放。仅初始设置有效。 */
  @property({ type: Boolean })
  accessor replay: boolean | undefined;

  /**
   * 设置回放时消息之间的时间间隔，单位为秒。仅初始设置有效。
   *
   * @default 2
   */
  @property({ type: Number })
  accessor replayDelay: number | undefined;

  @property({ attribute: false })
  accessor supports: Record<string, boolean> | undefined;

  @property({ type: Boolean })
  accessor showHiddenJobs: boolean | undefined;

  @property({ type: Boolean })
  accessor showFeedback: boolean | undefined;

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

  @event({ type: "feedback.submit" })
  accessor #feedbackSubmitEvent!: EventEmitter<FeedbackDetail>;

  #onSubmitFeedback = (detail: FeedbackDetail) => {
    this.#feedbackSubmitEvent.emit(detail);
  };

  #ref = createRef<CruiseCanvasRef>();

  @method()
  resumed() {
    this.#ref.current?.resumed();
  }

  @method()
  feedbackSubmitDone() {
    this.#ref.current?.feedbackSubmitDone();
  }

  @method()
  feedbackSubmitFailed() {
    this.#ref.current?.feedbackSubmitFailed();
  }

  render() {
    return (
      <CruiseCanvasComponent
        taskId={this.taskId}
        jobs={this.jobs}
        task={this.task}
        replay={this.replay}
        replayDelay={this.replayDelay}
        supports={this.supports}
        showHiddenJobs={this.showHiddenJobs}
        showFeedback={this.showFeedback}
        onShare={this.#onShare}
        onPause={this.#onPause}
        onResume={this.#onResume}
        onCancel={this.#onCancel}
        onSubmitFeedback={this.#onSubmitFeedback}
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
  onSubmitFeedback: (detail: FeedbackDetail) => void;
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
  feedbackSubmitDone: () => void;
  feedbackSubmitFailed: () => void;
}

function LegacyCruiseCanvasComponent(
  {
    taskId,
    task: propTask,
    jobs: propJobs,
    replay,
    replayDelay,
    supports,
    showHiddenJobs,
    showFeedback: propShowFeedback,
    onShare,
    onPause,
    onResume,
    onCancel,
    onSubmitFeedback,
  }: CruiseCanvasComponentProps,
  ref: React.Ref<CruiseCanvasRef>
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    task: _task,
    jobs: _jobs,
    error,
    humanInputRef,
    resumedRef,
    skipToResults,
    watchAgain,
  } = useTaskDetail(taskId, replay, replayDelay);
  const task = taskId ? _task : propTask;
  const jobs = taskId ? _jobs : propJobs;
  const plan = task?.plan;
  const graph = useTaskGraph(task, jobs, { showHiddenJobs });
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;
  const nav = graph?.nav;
  const views = graph?.views;
  const jobLevels = graph?.jobLevels;
  const pageTitle = task?.title ?? "";
  const taskState = task?.state;
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const currentNavId = useMemo(() => {
    if (activeNodeId) {
      const [type, jobId] = activeNodeId.split(":");
      if (type === "job" || type === "view") {
        return jobId;
      }
    }
    return null;
  }, [activeNodeId]);

  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);
  const [showFeedback, setShowFeedback] = useState<boolean>(!!propShowFeedback);
  useEffect(() => {
    setShowFeedback(!!propShowFeedback);
  }, [propShowFeedback]);

  const handleSubmitFeedback = useCallback(
    (detail: FeedbackDetail) => {
      setSubmittingFeedback(true);
      onSubmitFeedback(detail);
    },
    [onSubmitFeedback]
  );

  useImperativeHandle(
    ref,
    () => ({
      resumed: () => resumedRef.current?.(),
      feedbackSubmitDone: () => {
        setSubmittedFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
        }, 3000);
      },
      feedbackSubmitFailed: () => {
        setSubmittingFeedback(false);
      },
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
    showFeedback,
  });

  // Disable auto scroll when the user manually scrolled up
  const detectScrolledUpRef = useRef(false);
  const manualScrolledUpRef = useRef(false);

  const [hoverOnScrollableContent, setHoverOnScrollableContent] =
    useState(false);

  const { grabbing, transform, transformRef, zoomer /* , scaleRange */ } =
    useZoom({
      rootRef,
      zoomable: sizeReady,
      scrollable: sizeReady && !hoverOnScrollableContent,
      pannable: sizeReady,
      manualScrolledUpRef,
    });

  const transitionRef = useRef(false);

  const pushZoomTransition = useMemo(() => {
    let nextAction: ZoomAction | null = null;

    const run = (action: ZoomAction) => {
      const current = transformRef.current;
      const target = typeof action === "function" ? action(current) : action;

      if (!target) {
        return;
      }

      const { transform, translateBy } = target;

      let selection:
        | Selection<HTMLDivElement, unknown, null, undefined>
        | TransitionLike<HTMLDivElement, unknown> = select(rootRef.current!);

      if (transitionEnabledRef.current && target.duration !== 0) {
        transitionRef.current = true;
        selection = selection
          .transition()
          .duration(target.duration ?? 300)
          .ease((t) => t * (2 - t)) // Ease in-out
          .on("end", () => {
            transitionRef.current = false;
            if (nextAction) {
              const next = nextAction;
              nextAction = null;
              run(next);
            }
          });
      }

      if (transform) {
        zoomer.transform(
          selection,
          new ZoomTransform(
            transform.k ?? current.k,
            transform.x ?? current.x,
            transform.y ?? current.y
          )
        );
      } else {
        zoomer.translateBy(selection, translateBy[0] ?? 0, translateBy[1] ?? 0);
      }
    };

    return (action: ZoomAction) => {
      if (transitionRef.current) {
        nextAction = action;
      } else {
        run(action);
      }
    };
  }, [transformRef, zoomer]);

  const { centered, setCentered, reCenterRef } = useAutoCenter({
    nodes,
    sizeReady,
    zoomer,
    rootRef,
    pushZoomTransition,
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

  // Make the latest (bottom most) node visible
  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      bottom === null ||
      (detectScrolledUpRef.current && manualScrolledUpRef.current)
    ) {
      return;
    }
    pushZoomTransition((current) => {
      const { offsetHeight } = root;
      const transformedBottom = bottom * current.k + current.y;
      const diffY = offsetHeight - CANVAS_PADDING_BOTTOM - transformedBottom;
      if (diffY < 0) {
        // Use `zoomer.transform()` which will not be restricted to its translate/scale extent
        return {
          transform: {
            y: current.y + diffY,
          },
          duration: diffY > -100 ? 100 : diffY < -500 ? 300 : 200,
        };
      }
      return null;
    });
  }, [bottom, pushZoomTransition]);

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
    detectScrolledUpRef.current = diffY < 0;
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

  const fullRect = useMemo(() => {
    if (!sizeReady) {
      return null;
    }
    return mergeRects(nodes.map((node) => node.view!));
  }, [nodes, sizeReady]);

  useEffect(() => {
    if (!fullRect) {
      return;
    }
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const distance = 20;
    const { offsetWidth, offsetHeight } = root;
    const viewportWidth = offsetWidth / transform.k;
    const viewportHeight = offsetHeight / transform.k;
    const minX = -(viewportWidth - distance - fullRect.x);
    const maxX = viewportWidth - distance + (fullRect.x + fullRect.width);
    const minY = -(viewportHeight - distance - fullRect.y);
    const maxY = viewportHeight - distance + (fullRect.y + fullRect.height);

    zoomer.translateExtent([
      [minX, minY],
      [maxX, maxY],
    ]);
  }, [zoomer, transform.k, fullRect]);

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
        pushZoomTransition({
          translateBy: [x, y],
          duration: behavior === "instant" ? 0 : undefined,
        });
      }
    },
    [nodes, pushZoomTransition, transformRef]
  );

  const scrollBy = useCallback(
    (
      direction: "up" | "down" | "left" | "right",
      range: "line" | "page" | "document"
    ) => {
      const root = rootRef.current;
      if (!root || !sizeReady) {
        return;
      }
      let x = 0;
      let y = 0;
      let duration = 300;
      let distance: number;
      const isHorizontal = direction === "left" || direction === "right";
      if (range === "line") {
        const lineHeight = 40;
        distance =
          lineHeight * (direction === "up" || direction === "left" ? 1 : -1);
        duration = 150;
      } else if (range === "page") {
        const pageHeight = root.offsetHeight - CANVAS_PADDING_BOTTOM;
        distance = pageHeight * (direction === "up" ? -1 : 1);
      } else {
        const { y: top, height } = mergeRects(nodes.map((node) => node.view!));

        if (direction === "down") {
          const bottom = top + height;
          const targetHeight = bottom - top + CANVAS_PADDING_BOTTOM;
          distance = root.offsetHeight - targetHeight - transformRef.current.y;
        } else {
          distance = top + CANVAS_PADDING_TOP - transformRef.current.y;
        }
      }

      if (isHorizontal) {
        x = distance;
      } else {
        y = distance;
      }

      if (x || y) {
        pushZoomTransition({
          translateBy: [x, y],
          duration,
        });
      }
    },
    [nodes, pushZoomTransition, sizeReady, transformRef]
  );

  const [activeToolCallJobId, setActiveToolCallJobId] = useState<string | null>(
    null
  );

  const [activeExpandedViewJobId, setActiveExpandedViewJobId] = useState<
    string | null
  >(null);

  const [activeFile, setActiveFile] = React.useState<FileInfo | null>(null);

  const taskContextValue = useMemo(
    () => ({
      humanInput,
      onShare,
      onPause,
      onResume,
      onCancel,
      supports,
      activeExpandedViewJobId,
      setActiveExpandedViewJobId,
      activeToolCallJobId,
      setActiveToolCallJobId,
    }),
    [
      humanInput,
      onCancel,
      onPause,
      onResume,
      onShare,
      supports,
      activeExpandedViewJobId,
      activeToolCallJobId,
    ]
  );

  const canvasContextValue = useMemo(
    () => ({
      onNodeResize,
      onSubmitFeedback: handleSubmitFeedback,
      setActiveNodeId,
      hoverOnScrollableContent,
      setHoverOnScrollableContent,
      setActiveFile,
      setShowFeedback,
      submittingFeedback,
      submittedFeedback,
    }),
    [
      hoverOnScrollableContent,
      onNodeResize,
      handleSubmitFeedback,
      submittingFeedback,
      submittedFeedback,
    ]
  );

  const activeToolCallJob = useMemo(() => {
    if (!activeToolCallJobId) {
      return null;
    }
    return jobs?.find((job) => job.id === activeToolCallJobId);
  }, [activeToolCallJobId, jobs]);

  const handleRootClick = useCallback((e: React.MouseEvent) => {
    for (const element of e.nativeEvent.composedPath()) {
      if (
        element instanceof HTMLElement &&
        element.classList.contains(styles.node)
      ) {
        // If the click is on a node, do not reset active node
        return;
      }
      if (element === rootRef.current) {
        break;
      }
    }
    setActiveNodeId(null);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || activeToolCallJob || activeExpandedViewJobId || activeFile) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        document.activeElement !== document.body &&
        document.activeElement !== root
      ) {
        return;
      }

      const keyboardAction = handleKeyboardNav(e, { activeNodeId, nodes });
      if (!keyboardAction) {
        return;
      }
      const { action, node } = keyboardAction;

      if (action === "scroll") {
        scrollBy(keyboardAction.direction, keyboardAction.range);
      } else if (action === "enter") {
        if (node.type !== "job" && node.type !== "view") {
          return;
        }
        const askUser = node.job.toolCall?.name === "ask_human";
        const askUserPlan =
          node.job.toolCall?.name === "ask_human_confirming_plan";
        if (askUser || askUserPlan) {
          return;
        }
      }
      e.preventDefault();
      e.stopPropagation();

      if (action === "enter") {
        if (node.type === "view") {
          setActiveExpandedViewJobId(node.job.id);
        } else {
          setActiveToolCallJobId((node as JobGraphNode).job.id);
        }
      } else if (action === "switch-active-node") {
        if (node) {
          setActiveNodeId(node.id);
          if (node.type === "job" || node.type === "view") {
            scrollTo({
              jobId: node.job.id,
              behavior: "smooth",
            });
          } else {
            scrollTo({
              nodeId: node.id,
              behavior: "smooth",
            });
          }
        } else {
          setActiveNodeId(null);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeNodeId,
    activeToolCallJob,
    activeExpandedViewJobId,
    activeFile,
    nodes,
    scrollTo,
    scrollBy,
  ]);

  return (
    <TaskContext.Provider value={taskContextValue}>
      <CanvasContext.Provider value={canvasContextValue}>
        <div
          className={classNames(styles.root, { [styles.loading]: !task })}
          ref={rootRef}
          style={{
            cursor: grabbing ? "grabbing" : "grab",
          }}
          tabIndex={-1}
          onClick={handleRootClick}
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
              {edges.map((edge) =>
                edge.source === END_NODE_ID ||
                edge.target === END_NODE_ID ? null : (
                  <path
                    className={styles.edge}
                    key={`${edge.source}-${edge.target}`}
                    d={edge
                      .points!.map(
                        ({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`
                      )
                      .join(" ")}
                  />
                )
              )}
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
                active={activeNodeId === node.id}
              />
            ))}
          </div>
        </div>
        <div className={styles.widgets}>
          <Nav
            nav={nav}
            plan={plan}
            jobs={jobs}
            jobLevels={jobLevels}
            currentNavId={currentNavId}
            taskState={taskState}
            onClick={(jobId: string) => {
              setActiveNodeId(`job:${jobId}`);
              scrollTo({ jobId, block: "start" });
            }}
          />
          <ZoomBar
            scale={transform.k}
            onScaleChange={handleScaleChange}
            onReCenter={handleReCenter}
          />
          {replay ? (
            <div className={styles["footer-container"]}>
              <ReplayToolbar
                taskDone={taskDone}
                skipToResults={skipToResults}
                watchAgain={() => {
                  watchAgain();
                  setCentered(false);
                }}
              />
            </div>
          ) : supports?.chat ? (
            <div className={styles["footer-container"]}>
              <ChatBox taskState={taskState} taskDone={taskDone} />
            </div>
          ) : null}
        </div>
        {activeToolCallJob && <ToolCallDetail job={activeToolCallJob} />}
        {activeExpandedViewJobId && <ExpandedView views={views!} />}
        {activeFile && <FilePreview file={activeFile} />}
      </CanvasContext.Provider>
    </TaskContext.Provider>
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
  active?: boolean;
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
  active,
}: NodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { onNodeResize, setActiveNodeId } = useContext(CanvasContext);

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

  const handleClick = useCallback(() => {
    if (type !== "start" && type !== "instruction") {
      setActiveNodeId(id);
    }
  }, [id, setActiveNodeId, type]);

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
      onClick={handleClick}
    >
      {type === "start" ? (
        <NodeStart />
      ) : type === "end" ? (
        <NodeEnd />
      ) : type === "feedback" ? (
        <NodeFeedback />
      ) : type === "requirement" ? (
        <NodeRequirement
          content={content}
          startTime={startTime}
          loading={taskLoading}
          active={active}
        />
      ) : type === "instruction" ? (
        <NodeInstruction
          content={job!.instruction}
          loading={instructionLoading}
        />
      ) : type === "view" ? (
        <NodeView job={job!} active={active} />
      ) : (
        <NodeJob state={state} job={job!} active={active} />
      )}
    </div>
  );
}
