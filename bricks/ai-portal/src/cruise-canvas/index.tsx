import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import { TextareaAutoResize } from "@next-shared/form";
import { MarkdownComponent } from "@next-shared/markdown";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { useZoom } from "./useZoom.js";
import type { SizeTuple, GraphNode, Job, RequirementGraphNode, JobGraphNode, TaskBaseDetail } from "./interfaces.js";
// import Summarization from "./summarization.md";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useTaskDetail } from "./useTaskDetail.js";
import { useTaskGraph } from "./useTaskGraph.js";

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
  styleTexts: [styleText],
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

  const { task: _task, jobs: _jobs, humanInputRef } = useTaskDetail(taskId);
  const task = taskId ? _task : propTask;
  const jobs = taskId ? _jobs : propJobs ?? [];
  const graph = useTaskGraph(task, jobs);
  const rawNodes = graph?.nodes;
  const rawEdges = graph?.edges;
  const completed = task?.state === "completed";

  const humanInput = useCallback((jobId: string, input: string) => {
    humanInputRef.current?.(jobId, input);
  }, [humanInputRef]);

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

  return (
    <div
      className="root"
      ref={rootRef}
      style={{
        cursor: grabbing ? "grabbing" : "grab",
      }}
    >
      <div
        className={classNames("canvas", { ready: sizeReady && centered })}
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
        }}
      >
        <svg className="edges">
          {edges.map((edge) => (
            <path
              className="edge"
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

function NodeComponent({ id, type, state, job, content, x, y, onResize, humanInput }: NodeComponentProps) {
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
      className={classNames(`node state-${state ?? "unknown"}`, {
        ready: x != null && y != null,
      })}
      ref={nodeRef}
      style={{
        left: x,
        top: y,
      }}
    >
      {type === "start" ? (
        <div className="node-start" />
      ) : type === "end" ? (
        <div className="node-end" />
      ) : type === "requirement" ? (
        <div className="node-requirement size-medium">{content}</div>
      ) : type === "instruction" ? (
        <div className="node-instruction">{job!.instruction}</div>
      ) :
      type === "job" ? (
        <div className="node-default size-medium">
          {["ask_user_more", "ask_user_confirm"].includes(job!.toolCall?.name as string) ? (
            <>
              <div className="message role-assistant">
                <MarkdownComponent content={job!.toolCall!.arguments?.question as string} />
              </div>
              {state === "input-required" && (
                job!.toolCall!.name === "ask_user_more"
                  ? <HumanInputComponent jobId={job!.id} humanInput={humanInput} />
                  : job!.toolCall!.name === "ask_user_confirm"
                  ? <HumanConfirmComponent jobId={job!.id} humanInput={humanInput} />
                  : null
              )}
            </>
          ) : null}
          {job!.messages?.map((message, index) => (
            <div key={index} className={`message role-${message.role}`}>
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
        <div className="node-default size-medium">
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
      <WrappedButton type="primary" onClick={() => { humanInput?.(jobId, "yes") }}>
        Yes
      </WrappedButton>
      <WrappedButton onClick={() => { humanInput?.(jobId, "no") }} style={{ marginLeft: "0.5em" }}>
        No
      </WrappedButton>
    </div>
  );
}
