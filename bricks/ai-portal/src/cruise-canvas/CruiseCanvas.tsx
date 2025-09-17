// istanbul ignore file: experimental
import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { getRuntime } from "@next-core/runtime";
import "@next-core/theme";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import { select, type Selection, type TransitionLike } from "d3-selection";
import { ZoomTransform } from "d3-zoom";
import { mergeRects } from "@next-shared/diagram";
import styles from "./styles.module.css";
import { useZoom } from "./useZoom.js";
import type {
  SizeTuple,
  GraphNode,
  Job,
  RequirementGraphNode,
  JobGraphNode,
  ZoomAction,
  FileInfo,
  FeedbackDetail,
  JobState,
} from "./interfaces.js";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useConversationDetail } from "./useConversationDetail";
import { useConversationGraph } from "./useConversationGraph";
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
  END_NODE_ID,
  FEEDBACK_NODE_ID,
} from "./constants.js";
import { DONE_STATES, GENERAL_DONE_STATES } from "../shared/constants.js";
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
import { NodeFeedback } from "../shared/NodeFeedback/NodeFeedback.js";
import { TaskContext } from "../shared/TaskContext.js";
import { NodeLoading } from "./NodeLoading/NodeLoading.js";
import { JsxEditor } from "../shared/JsxEditor/JsxEditor.js";
import { NodeError } from "./NodeError/NodeError.js";
import type { GeneratedView } from "../shared/interfaces";
import type { CruiseCanvasProps } from ".";

const MemoizedNodeComponent = memo(NodeComponent);

interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  conversationId: string;
  onShare: () => void;
  onTerminate: () => void;
  onSubmitFeedback: (detail: FeedbackDetail) => void;
  onSwitchToChat: () => void;
  onFeedbackOnView: (viewId: string) => void;
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

export interface CruiseCanvasRef {
  resumed?: () => void;
  feedbackSubmitDone: () => void;
  feedbackSubmitFailed: () => void;
  feedbackOnViewDone: (viewId: string) => void;
}

export function CruiseCanvasComponent(
  {
    conversationId,
    initialRequest,
    replay,
    replayDelay,
    supports,
    showHiddenJobs,
    showFeedback: propShowFeedback,
    showFeedbackAfterFailed,
    showFeedbackOnView,
    showUiSwitch,
    showJsxEditor,
    previewUrlTemplate,
    onShare,
    onTerminate,
    onSubmitFeedback,
    onSwitchToChat,
    onFeedbackOnView,
  }: CruiseCanvasComponentProps,
  ref: React.Ref<CruiseCanvasRef>
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const {
    conversation,
    tasks,
    error,
    humanInputRef,
    skipToResults,
    watchAgain,
  } = useConversationDetail(
    conversationId,
    initialRequest,
    replay,
    replayDelay
  );
  const plan = tasks[tasks.length - 1]?.plan;
  const graph = useConversationGraph(conversation, tasks, { showHiddenJobs });
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;
  const nav = graph?.nav;
  const views = graph?.views;
  const jobMap = graph?.jobMap;
  const jobLevels = graph?.jobLevels;
  const pageTitle = conversation?.title ?? "";
  const conversationState = conversation?.state;
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
  const [feedbackDoneViews, setFeedbackDoneViews] = useState<
    Set<string> | undefined
  >();

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
      feedbackSubmitDone: () => {
        setSubmittedFeedback(true);
        setTimeout(() => {
          setShowFeedback(false);
        }, 3000);
      },
      feedbackSubmitFailed: () => {
        setSubmittingFeedback(false);
      },
      feedbackOnViewDone: (viewId: string) => {
        setFeedbackDoneViews((prev) => {
          const newSet = new Set(prev);
          newSet.add(viewId);
          return newSet;
        });
      },
    }),
    []
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
    completed: conversationState === "completed",
    failed: conversationState === "failed",
    error,
    sizeMap,
    showFeedback,
    showFeedbackAfterFailed,
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

  const conversationDone = DONE_STATES.includes(conversationState);
  const canChat = conversationDone || conversationState === "input-required";

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
  const [activeJsxEditorJob, setActiveJsxEditorJob] = useState<
    Job | undefined
  >();
  const [manuallyUpdatedViews, setManuallyUpdatedViews] = useState<
    Map<string, GeneratedView> | undefined
  >();
  const updateView = useCallback((jobId: string, view: GeneratedView) => {
    setManuallyUpdatedViews((prev) => {
      const next = new Map(prev);
      next.set(jobId, view);
      return next;
    });
  }, []);

  const workspace = conversation?.id;

  const taskContextValue = useMemo(
    () => ({
      workspace,
      previewUrlTemplate,

      humanInput,
      onShare,
      onTerminate,
      supports,

      activeExpandedViewJobId,
      setActiveExpandedViewJobId,
      activeToolCallJobId,
      setActiveToolCallJobId,

      submittingFeedback,
      submittedFeedback,
      onSubmitFeedback: handleSubmitFeedback,
      setShowFeedback,

      showJsxEditor,
      activeJsxEditorJob,
      setActiveJsxEditorJob,
      manuallyUpdatedViews,
      updateView,
      showFeedbackOnView,
      onFeedbackOnView,
      feedbackDoneViews,
    }),
    [
      workspace,
      previewUrlTemplate,

      humanInput,
      onTerminate,
      onShare,
      supports,

      activeExpandedViewJobId,
      activeToolCallJobId,

      submittingFeedback,
      submittedFeedback,
      handleSubmitFeedback,

      showJsxEditor,
      activeJsxEditorJob,
      manuallyUpdatedViews,
      updateView,
      showFeedbackOnView,
      onFeedbackOnView,
      feedbackDoneViews,
    ]
  );

  const canvasContextValue = useMemo(
    () => ({
      onNodeResize,
      setActiveNodeId,
      hoverOnScrollableContent,
      setHoverOnScrollableContent,
      setActiveFile,
    }),
    [hoverOnScrollableContent, onNodeResize]
  );

  const activeToolCallJob = useMemo(() => {
    if (!activeToolCallJobId) {
      return null;
    }
    return jobMap?.get(activeToolCallJobId) || null;
  }, [activeToolCallJobId, jobMap]);

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
          className={classNames(styles.root, {
            [styles.loading]: !conversation,
          })}
          ref={rootRef}
          style={{
            cursor: grabbing ? "grabbing" : "grab",
          }}
          tabIndex={-1}
          onClick={handleRootClick}
        >
          {!conversation && (
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
                edge.target === END_NODE_ID ||
                edge.target === FEEDBACK_NODE_ID ? null : (
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
                startTime={conversation?.startTime}
                instructionLoading={
                  node.type === "instruction" &&
                  !nonLeafNodes.has(node.id) &&
                  !DONE_STATES.includes(node.state!) &&
                  !GENERAL_DONE_STATES.includes(conversationState!)
                }
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
            jobMap={jobMap}
            jobLevels={jobLevels}
            currentNavId={currentNavId}
            taskState={conversationState}
            onClick={(jobId: string) => {
              setActiveNodeId(`job:${jobId}`);
              scrollTo({ jobId, block: "start" });
            }}
          />
          <ZoomBar
            scale={transform.k}
            showUiSwitch={showUiSwitch}
            onScaleChange={handleScaleChange}
            onReCenter={handleReCenter}
            onSwitchToChat={onSwitchToChat}
          />
          {replay ? (
            <div className={styles["footer-container"]}>
              <ReplayToolbar
                taskDone={conversationDone}
                skipToResults={skipToResults}
                watchAgain={() => {
                  watchAgain();
                  setCentered(false);
                }}
              />
            </div>
          ) : supports?.chat ? (
            <div className={styles["footer-container"]}>
              <ChatBox state={conversationState} canChat={canChat} />
            </div>
          ) : null}
        </div>
        {activeToolCallJob && <ToolCallDetail job={activeToolCallJob} />}
        {activeExpandedViewJobId && <ExpandedView views={views!} />}
        {activeFile && <FilePreview file={activeFile} />}
        {showJsxEditor && activeJsxEditorJob && <JsxEditor />}
      </CanvasContext.Provider>
    </TaskContext.Provider>
  );
}

interface NodeComponentProps {
  id: string;
  type: GraphNode["type"];
  content?: string;
  job?: Job;
  state?: JobState;
  startTime?: number;
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
          active={active}
        />
      ) : type === "loading" ? (
        <NodeLoading />
      ) : type === "error" ? (
        <NodeError content={content!} />
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
