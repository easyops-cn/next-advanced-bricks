import React, {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import { TextareaAutoResize } from "@next-shared/form";
import { MarkdownComponent } from "@next-shared/markdown";
import { maxBy } from "lodash";
import { select } from "d3-selection";
import { CmdbObjectApi_getObjectRef } from "@next-api-sdk/cmdb-sdk";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import { K, NS, locales, t } from "./i18n.js";
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
// import Summarization from "./summarization.md";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useTaskDetail } from "./useTaskDetail.js";
import { useTaskGraph } from "./useTaskGraph.js";
import { AsyncWrappedCMDB } from "./cmdb.js";
import { PlanProgress } from "./PlanProgress/PlanProgress.js";
import { ZoomBar } from "./ZoomBar/ZoomBar.js";
import { NodeStart } from "./NodeStart/NodeStart.js";

initializeI18n(NS, locales);

const { defineElement, property } = createDecorators();

const MemoizedNodeComponent = memo(NodeComponent);

const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

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

export interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  // Define react event handlers here.
}

export function CruiseCanvasComponent({
  taskId,
  task: propTask,
  jobs: propJobs,
}: CruiseCanvasComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const { task: _task, jobs: _jobs, plan, humanInputRef } = useTaskDetail(taskId);
  const task = taskId ? _task : propTask;
  const jobs = taskId ? _jobs : (propJobs ?? []);
  const graph = useTaskGraph(task, jobs);
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;
  const completed = task?.state === "completed";

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
    completed,
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
    const latestNode = maxBy(nodes, (node) => node._timestamp);
    if (latestNode) {
      const transform = transformRef.current;
      const y1 = latestNode.view!.y + latestNode.view!.height;
      const transformedY1 = y1 * transform.k + transform.y;
      const padding = 60;
      const diffY = offsetHeight - padding - transformedY1;
      if (diffY < 0) {
        // Make the latest node visible
        zoomer.translateBy(select(root), 0, diffY);
      }
    }
  }, [nodes, sizeReady, zoomer]);

  const handleScaleChange = useCallback((scale: number) => {
    zoomer.scaleTo(select(rootRef.current!), scale);
  }, [zoomer]);

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
        className={classNames(styles.canvas, { [styles.ready]: sizeReady && centered })}
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
                .points!.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`)
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
      <PlanProgress plan={plan} />
      <ZoomBar scale={transform.k} onScaleChange={handleScaleChange} />
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
      className={classNames(styles.node, state === "submitted"
        ? styles["state-submitted"]
        : state === "working"
        ? styles["state-working"]
        : null, {
        [styles.ready]: x != null && y != null,
      })}
      ref={nodeRef}
      style={{
        left: x,
        top: y,
      }}
    >
      {type === "start" ? (
        // <div className={styles["node-start"]} />
        <NodeStart />
      ) : type === "end" ? (
        <div className={styles["node-end"]} />
      ) : type === "requirement" ? (
        <div className={`${styles["node-requirement"]} ${styles["size-medium"]}`}>{content}</div>
      ) : type === "instruction" ? (
        <div className={styles["node-instruction"]}>{job!.instruction}</div>
      ) : type === "job" ? (
        <div className={`${styles["node-default"]} ${styles["size-medium"]}`}>
          {[
            "ask_user_more",
            "ask_user_confirm",
            "ask_user_select_from_cmdb",
          ].includes(job!.toolCall?.name as string) ? (
            <>
              <div className={`${styles.message} ${styles["role-assistant"]}`}>
                <MarkdownComponent
                  content={job!.toolCall!.arguments?.question as string}
                />
              </div>
              {state === "input-required" &&
                (job!.toolCall!.name === "ask_user_more" ? (
                  <HumanInputComponent
                    jobId={job!.id}
                    humanInput={humanInput}
                  />
                ) : job!.toolCall!.name === "ask_user_confirm" ? (
                  <HumanConfirmComponent
                    jobId={job!.id}
                    humanInput={humanInput}
                  />
                ) : job!.toolCall!.name === "ask_user_select_from_cmdb" ? (
                  <HumanSelectFromCmdb
                    jobId={job!.id}
                    humanInput={humanInput}
                  />
                ) : null)}
            </>
          ) : null}
          {job!.messages?.map((message, index) => (
            <div key={index} className={`${styles.message} ${styles[`role-${message.role}`]}`}>
              {message.parts?.map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {part.type === "text" ? (
                    <MarkdownComponent content={part.text} />
                  ) : part.type === "file" ? (
                    <div>{part.file.name}</div>
                  ) : (
                    <div>{JSON.stringify(part.data)}</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className={`${styles["node-default"]} ${styles["size-medium"]}`}>
          {`Unknown job type: "${type}"`}
        </div>
      )}
    </div>
  );
}

function HumanInputComponent({
  jobId,
  humanInput,
}: {
  jobId: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div /* className="node-ask-user-more size-medium" */ ref={containerRef}>
      {/* <div className="message">
        <MarkdownComponent content={node.content} />
      </div> */}
      <TextareaAutoResize
        className={styles["human-input"]}
        containerRef={containerRef}
        autoResize
        minRows={2}
        placeholder="Type your message here..."
        submitWhen="enter-without-shift"
        onSubmit={(e) => {
          const input = e.currentTarget.value;
          if (input) {
            humanInput?.(jobId, input);
          }
        }}
      />
    </div>
  );
}

function HumanConfirmComponent({
  jobId,
  humanInput,
}: {
  jobId: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  return (
    <div style={{ marginTop: "1em" }}>
      <WrappedButton
        type="primary"
        onClick={() => {
          humanInput?.(jobId, t(K.CONFIRM));
        }}
      >
        {t(K.CONFIRM)}
      </WrappedButton>
      <WrappedButton
        onClick={() => {
          humanInput?.(jobId, t(K.CANCEL));
        }}
        style={{ marginLeft: "0.5em" }}
      >
        {t(K.CANCEL)}
      </WrappedButton>
    </div>
  );
}

function HumanSelectFromCmdb({
  jobId,
  humanInput,
}: {
  jobId: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  const objectId = "HOST";
  const attrId = "ip";

  const [objectList, setObjectList] = useState<any[] | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const objects = (
          await CmdbObjectApi_getObjectRef({ ref_object: objectId })
        ).data;
        if (!ignore) {
          setObjectList(objects);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("fetch object list failed:", e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [objectId]);

  return (
    <div style={{ marginTop: "1em" }}>
      <Suspense>
        <AsyncWrappedCMDB
          objectList={objectList}
          objectId={objectId}
          fieldId={attrId}
          onChangeV2={(e) => {
            humanInput?.(jobId, e.detail.map((i) => i[attrId]).join("\n"));
          }}
        />
      </Suspense>
    </div>
  );
}
