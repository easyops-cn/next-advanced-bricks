import React, { useCallback, useEffect, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import { TextareaAutoResize } from "@next-shared/form";
import { MarkdownComponent } from "@next-shared/markdown";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { useZoom } from "./useZoom.js";
import type {
  Node,
  RawEdge,
  RawNode,
  SizeTuple,
} from "./interfaces.js";
// import Summarization from "./summarization.md";
import { useAutoCenter } from "./useAutoCenter.js";
import { useLayout } from "./useLayout.js";
import { useRunDetail } from "./useRunDetail.js";

initializeI18n(NS, locales);

const { defineElement, property } = createDecorators();

export interface CruiseCanvasProps {
  nodes: RawNode[] | undefined;
  edges: RawEdge[] | undefined;
  taskId: string | undefined;
}

/**
 * 构件 `ai-portal.cruise-canvas`
 */
export
@defineElement("ai-portal.cruise-canvas", {
  styleTexts: [styleText],
})
class CruiseCanvas extends ReactNextElement implements CruiseCanvasProps {
  @property({ attribute: false })
  accessor nodes: RawNode[] | undefined;

  @property({ attribute: false })
  accessor edges: RawEdge[] | undefined;

  @property()
  accessor taskId: string | undefined;

  render() {
    return (
      <CruiseCanvasComponent
        taskId={this.taskId}
        nodes={this.nodes}
        edges={this.edges}
      />
    );
  }
}

export interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  // Define react event handlers here.
}

export function CruiseCanvasComponent({
  taskId,
  nodes: propNodes,
  edges: propEdges,
}: CruiseCanvasComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const runDetail = useRunDetail(propNodes ? undefined : taskId);
  const rawNodes = propNodes ?? runDetail?.nodes;
  const rawEdges = propEdges ?? runDetail?.edges;
  const completed = runDetail?.task.state === "completed";
  const humanInput = runDetail?.humanInput;

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
          <NodeComponent
            key={node.id}
            node={node}
            onResize={handleNodeResize}
            humanInput={humanInput}
          />
        ))}
      </div>
    </div>
  );
}

interface NodeComponentProps {
  node: Node;
  onResize: (id: string, size: SizeTuple | null) => void;
  humanInput?: (jobId: string, input: string) => void;
}

function NodeComponent({ node, onResize, humanInput }: NodeComponentProps) {
  const { id, type, view } = node;
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
      className={`node state-${node.state ?? "unknown"}`}
      ref={nodeRef}
      style={{
        left: view?.x,
        top: view?.y,
      }}
    >
      {type === "start" ? (
        <div className="node-start" />
      ) : type === "end" ? (
        <div className="node-end" />
      ) : type === "requirement" ? (
        <div className="node-requirement size-medium">{node.content}</div>
      ) : type === "instruction" ? (
        <div className="node-instruction">{node.content}</div>
      ) : // : type === "summarize"
      // ? <div className="node-summarize size-large">
      //     <div className="node-title">{node.title}</div>
      //     <MarkdownComponent content={node.content} />
      //   </div>
      // : type === "job" && node.tag === "generate image"
      // ? <div className="node-generate-image size-medium type-image">
      //     <img src={node.content} />
      //   </div>
      // type === "job" &&
      //   (node.tag === "ask user more" || node.state === "input-required") ? (
      //   <NodeAskUserMore node={node} humanInput={humanInput} />
      // ) :
      type === "job" ? (
        <div className="node-default size-medium">
          {node.messages?.map((message, index) => (
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
          {node.state === "input-required" && (
            <NodeAskUserMore jobId={node.jobId} humanInput={humanInput} />
          )}
        </div>
      ) : (
        <div className="node-default size-medium">
          {`Unknown job type: "${type}"`}
        </div>
      )}
    </div>
  );
}

function NodeAskUserMore({
  // node,
  jobId,
  humanInput,
}: {
  // node: ToolRawNode;
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
