import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import dagre from "@dagrejs/dagre";
import classNames from "classnames";
import { select } from "d3-selection";
import { ZoomTransform } from "d3-zoom";
import ResizeObserver from "resize-observer-polyfill";
import { MarkdownComponent } from "@next-shared/markdown";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";
import { useZoom } from "./useZoom.js";
import type { Edge, Node, NodePosition, RawNode, SizeTuple } from "./interfaces.js";
import Summarization from "./summarization.md";
import { END_NODE_ID, START_NODE_ID } from "./constants.js";

initializeI18n(NS, locales);


const { defineElement, property } = createDecorators();

export interface CruiseCanvasProps {
  nodes: RawNode[] | undefined;
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

  render() {
    return (
      <CruiseCanvasComponent nodes={this.nodes} />
    );
  }
}

export interface CruiseCanvasComponentProps extends CruiseCanvasProps {
  // Define react event handlers here.
}

export function CruiseCanvasComponent({ nodes: rawNodes }: CruiseCanvasComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

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

  const { initialNodes, initialEdges } = useMemo(() => {
    const initialNodes: Node[] = [
      {
        id: START_NODE_ID,
        type: "start",
      }
    ];
    const initialEdges: Omit<Edge, "points">[] = [];
    const groupChildrenMap = new Map<string, string[]>();
    const finishedNodeIds: string[] = [];

    for (const node of rawNodes ?? []) {

      if (node.type === "group") {
        groupChildrenMap.set(node.id, node.groupChildren);
      } else {
        const groupChildren = node.parent ? groupChildrenMap.get(node.parent) : undefined;
        if (groupChildren) {
          for (const child of groupChildren) {
            initialEdges.push({
              source: child,
              target: node.id,
            });
          }
        } else {
          initialEdges.push({
            source: node.parent ?? START_NODE_ID,
            target: node.id,
          });
        }
        initialNodes.push(node);
      }

      if (node.finished) {
        finishedNodeIds.push(node.id);
      }
    }

    if (finishedNodeIds.length > 0) {
      initialNodes.push({
        id: END_NODE_ID,
        type: "end",
      });
      initialEdges.push(...finishedNodeIds.map(id => ({
        source: id,
        target: END_NODE_ID,
      })));
    }

    return { initialNodes, initialEdges };
  }, [rawNodes]);

  const { sizeReady: sizeReady, nodes, edges } = useMemo(() => {
    for (const node of initialNodes) {
      if (!sizeMap?.has(node.id)) {
        return { sizeReady: false, nodes: initialNodes, edges: [] };
      }
    }

    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      rankdir: "TB",
      nodesep: 50,
      edgesep: 10,
      ranksep: 50,
    });
    // Default to assigning a new object as a label for each new edge.
    graph.setDefaultEdgeLabel(function () {
      return {};
    });
    for (const edge of initialEdges) {
      graph.setEdge(edge.source, edge.target);
    }
    for (const node of initialNodes) {
      const [width, height] = sizeMap!.get(node.id)!;
      graph.setNode(node.id, {
        id: node.id,
        width,
        height,
      });
    }
    dagre.layout(graph);

    const nodes = initialNodes.map<Node>((node) => {
      const nodeView = graph.node(node.id);
      const x = nodeView.x - nodeView.width / 2;
      const y = nodeView.y - nodeView.height / 2;
      return {
        ...node,
        view: {
          x,
          y,
          width: nodeView.width,
          height: nodeView.height,
        },
      };
    });

    const edges = initialEdges.map((edge) => {
      const source = graph.node(edge.source);
      const target = graph.node(edge.target);
      const turnY = (source.y + source.height / 2 + target.y - target.height / 2) / 2;
      const points: NodePosition[] = [
        { x: source.x, y: source.y + source.height / 2 },
        { x: source.x, y: turnY },
        { x: target.x, y: turnY },
        { x: target.x, y: target.y - target.height / 2 },
      ];

      return {
        ...edge,
        points,
      };
    });

    return {
      sizeReady: true,
      nodes,
      edges,
    };
  }, [initialEdges, initialNodes, sizeMap]);

  const { grabbing, transform, zoomer/* , scaleRange */ } = useZoom({
    rootRef,
    zoomable: sizeReady,
    scrollable: sizeReady,
    pannable: sizeReady,
  });

  const [centered, setCentered] = useState(false);

  // Transform to horizontal center once.
  useEffect(() => {
    const root = rootRef.current;
    if (sizeReady && root && !centered) {
      if (nodes.length === 0) {
        return;
      }

      let left = Infinity;
      let right = -Infinity;

      for (const node of nodes) {
        const view = node.view!;
        const r = view.x + view.width;
        if (view.x < left) {
          left = view.x;
        }
        if (r > right) {
          right = r;
        }
      }

      const width = right - left;

      zoomer.transform(
        select(root as HTMLElement),
        new ZoomTransform(1, (root.clientWidth - width) / 2, 30)
      );
      setCentered(true);
    }
  }, [centered, nodes, sizeReady, zoomer]);

  return <div className="root" ref={rootRef} style={{
    cursor: grabbing ? "grabbing" : "grab",
  }}>
    <div className={classNames("canvas", { ready: sizeReady && centered })} style={{
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
    }}>
      <svg className="edges">
        {edges.map((edge) => (
          <path className="edge" key={`${edge.source}-${edge.target}`} d={edge.points!.map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")} />
        ))}
      </svg>
      {nodes.map((node) => (
        <NodeComponent key={node.id} node={node} onResize={handleNodeResize} />
      ))}
    </div>
  </div>;
}

interface NodeComponentProps {
  node: Node;
  onResize: (id: string, size: SizeTuple | null) => void;
}

function NodeComponent({node, onResize}: NodeComponentProps) {
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
    <div className="node" ref={nodeRef} style={{
      left: view?.x,
      top: view?.y,
    }}>
      {type === "start"
        ? <div className="node-start" />
        : type === "end"
        ? <div className="node-end" />
        : type === "requirement"
        ? <div className="node-requirement">
            {node.content}
          </div>
        : type === "instruction"
        ? <div className="node-instruction">
            {node.content}
          </div>
        : type === "summarize"
        ? <div className="node-summarize">
            <div className="node-title">{node.title}</div>
            <MarkdownComponent content={Summarization} />
          </div>
        : type === "tool" && node.tag === "online search"
        ? <div className="node-online-search">
            <div className="node-title">{node.title}</div>
            <MarkdownComponent content={node.content} />
          </div>
        : type === "tool" && node.tag === "generate image"
        ? <div className="node-generate-image">
            <img src={node.content} />
          </div>
        : <div className="node-default" style={{ width: 60, height: 60 }}>
            Unknown node
          </div>}
    </div>
  );
}
