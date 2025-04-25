import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
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
} from "./interfaces.js";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useTaskDetail } from "./useTaskDetail.js";
import { useTaskGraph } from "./useTaskGraph.js";
import { PlanProgress } from "./PlanProgress/PlanProgress.js";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ZoomBar } from "./ZoomBar/ZoomBar.js";
import { NodeStart } from "./NodeStart/NodeStart.js";
import { NodeRequirement } from "./NodeRequirement/NodeRequirement.js";
import { NodeInstruction } from "./NodeInstruction/NodeInstruction.js";
import { NodeJob } from "./NodeJob/NodeJob.js";

initializeI18n(NS, locales);

const { defineElement, property } = createDecorators();

const MemoizedNodeComponent = memo(NodeComponent);

export interface CruiseCanvasProps {
  taskId: string | undefined;
  task: TaskBaseDetail | undefined;
  jobs: Job[] | undefined;
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

  render() {
    return (
      <CruiseCanvasComponent
        taskId={this.taskId}
        jobs={this.jobs}
        task={this.task}
      />
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  // Define react event handlers here.
}

export function CruiseCanvasComponent({
  taskId,
  task: propTask,
  jobs: propJobs,
}: CruiseCanvasComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const {
    task: _task,
    jobs: _jobs,
    plan,
    humanInputRef,
  } = useTaskDetail(taskId);
  const task = taskId ? _task : propTask;
  const jobs = taskId ? _jobs : (propJobs ?? []);
  const graph = useTaskGraph(task, jobs);
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;

  const humanInput = useCallback(
    (jobId: string, input: string) => {
      humanInputRef.current?.(jobId, input);
    },
    [humanInputRef]
  );

  const [sizeMap, setSizeMap] = useState<Map<string, SizeTuple> | null>(null);
  const handleNodeResize = useCallback((id: string, size: SizeTuple | null) => {
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

  const { grabbing, transform, zoomer /* , scaleRange */ } = useZoom({
    rootRef,
    zoomable: sizeReady,
    scrollable: sizeReady,
    pannable: sizeReady,
  });

  const centered = useAutoCenter({
    nodes,
    sizeReady,
    zoomer,
    rootRef,
  });

  const transformRef = useRef(transform);
  transformRef.current = transform;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !sizeReady) {
      return;
    }
    const { offsetHeight } = root;
    let maxStartTime = -Infinity;
    const latestNodes: GraphNode[] = [];

    for (const node of nodes) {
      if (node.startTime > maxStartTime) {
        maxStartTime = node.startTime;
        latestNodes.length = 0;
        latestNodes.push(node);
      } else if (node.startTime === maxStartTime) {
        latestNodes.push(node);
      }
    }

    if (latestNodes.length > 0) {
      const transform = transformRef.current;
      const y1 = Math.max(
        ...latestNodes.map((node) => node.view!.y + node.view!.height)
      );
      const transformedY1 = y1 * transform.k + transform.y;
      const padding = 72;
      const diffY = offsetHeight - padding - transformedY1;
      if (diffY < 0) {
        // Make the latest node visible
        zoomer.translateBy(select(root), 0, diffY);
      }
    }
  }, [nodes, sizeReady, zoomer]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleScaleChange = useCallback(
    (scale: number) => {
      zoomer.scaleTo(select(rootRef.current!), scale);
    },
    [zoomer]
  );

  return (
    <>
      <div
        className={styles.root}
        ref={rootRef}
        style={{
          cursor: grabbing ? "grabbing" : "grab",
        }}
      >
        <div
          className={classNames(styles.canvas, {
            [styles.ready]: sizeReady && centered,
          })}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
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
              x={node.view?.x}
              y={node.view?.y}
              onResize={handleNodeResize}
              humanInput={humanInput}
            />
          ))}
        </div>
      </div>
      <div className={styles.widgets}>
        <PlanProgress plan={plan} state={task?.state} />
        {/* <ZoomBar scale={transform.k} onScaleChange={handleScaleChange} /> */}
      </div>
    </>
  );
}

interface NodeComponentProps {
  id: string;
  type: GraphNode["type"];
  content?: string;
  job?: Job;
  state?: string;
  x?: number;
  y?: number;
  onResize: (id: string, size: SizeTuple | null) => void;
  humanInput?: (jobId: string, input: string) => void;
}

function NodeComponent({
  id,
  type,
  state,
  job,
  content,
  x,
  y,
  onResize,
  humanInput,
}: NodeComponentProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = nodeRef.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(() => {
      onResize(id, [element.offsetWidth, element.offsetHeight]);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      onResize(id, null);
    };
  }, [id, onResize]);

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
      className={classNames(
        styles.node,
        state === "submitted"
          ? styles["state-submitted"]
          : state === "working"
            ? styles["state-working"]
            : null,
        {
          [styles.ready]: x != null && y != null,
        }
      )}
      ref={nodeRef}
      style={{
        left: x,
        top: y,
      }}
    >
      {type === "start" ? (
        <NodeStart />
      ) : type === "end" ? (
        <div className={styles["node-end"]} />
      ) : type === "requirement" ? (
        <NodeRequirement content={content} />
      ) : type === "instruction" ? (
        <NodeInstruction content={job!.instruction} />
      ) : type === "job" ? (
        <NodeJob state={state} job={job!} humanInput={humanInput} />
      ) : (
        <div className={`${styles["node-default"]} ${styles["size-medium"]}`}>
          {`Unknown job type: "${type}"`}
        </div>
      )}
    </div>
  );
}
