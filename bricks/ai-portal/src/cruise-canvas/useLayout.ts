import dagre from "@dagrejs/dagre";
import { useMemo, useRef } from "react";
import type {
  NodePosition,
  NodeRect,
  GraphEdge,
  GraphNode,
  SizeTuple,
} from "./interfaces";
import {
  EDGE_SEP,
  END_NODE_ID,
  FEEDBACK_NODE_ID,
  NODE_SEP,
  RANK_SEP,
  START_NODE_ID,
} from "./constants";

export interface UseLayoutOptions {
  rawNodes: GraphNode[] | undefined;
  rawEdges: GraphEdge[] | undefined;
  sizeMap: Map<string, SizeTuple> | null;
  completed?: boolean;
  failed?: boolean;
  showFeedback?: boolean;
  showFeedbackAfterFailed?: boolean;
}

export function useLayout({
  rawNodes: _rawNodes,
  rawEdges: _rawEdges,
  sizeMap,
  completed,
  failed,
  showFeedback,
  showFeedbackAfterFailed,
}: UseLayoutOptions) {
  const memoizedPositionsRef = useRef<Map<string, NodePosition> | null>(null);

  const { initialNodes, initialEdges } = useMemo(() => {
    const initialNodes: GraphNode[] = [
      {
        type: "start",
        id: START_NODE_ID,
      },
    ];
    const initialEdges: GraphEdge[] = [];
    const finishedNodeIds: string[] = [];
    const rawNodes = _rawNodes ?? [];
    const rawEdges = _rawEdges ?? [];

    const hasSource = new Set<string>(rawEdges.map((edge) => edge.target));
    const shouldAppend =
      completed || (failed && showFeedback && showFeedbackAfterFailed);
    const hasTarget = shouldAppend
      ? new Set<string>(rawEdges.map((edge) => edge.source))
      : null;

    for (const node of rawNodes) {
      if (!hasSource.has(node.id)) {
        initialEdges.push({
          source: START_NODE_ID,
          target: node.id,
        });
      }

      if (shouldAppend && !hasTarget!.has(node.id)) {
        finishedNodeIds.push(node.id);
      }
    }

    initialNodes.push(...rawNodes);
    initialEdges.push(...rawEdges);

    if (finishedNodeIds.length > 0) {
      if (completed) {
        initialNodes.push({
          id: END_NODE_ID,
          type: "end",
        });
        initialEdges.push(
          ...finishedNodeIds.map((id) => ({
            source: id,
            target: END_NODE_ID,
          }))
        );
        if (showFeedback) {
          initialNodes.push({
            id: FEEDBACK_NODE_ID,
            type: "feedback",
          });
          initialEdges.push({
            source: END_NODE_ID,
            target: FEEDBACK_NODE_ID,
          });
        }
      } else {
        initialNodes.push({
          id: FEEDBACK_NODE_ID,
          type: "feedback",
        });
        for (const id of finishedNodeIds) {
          initialEdges.push({
            source: id,
            target: FEEDBACK_NODE_ID,
          });
        }
      }
    }

    const memoizedPositions = memoizedPositionsRef.current;
    if (memoizedPositions) {
      for (const node of initialNodes) {
        const view = memoizedPositions.get(node.id);
        if (view) {
          node.view = view as NodeRect;
        }
      }
    }

    return { initialNodes, initialEdges };
  }, [
    _rawNodes,
    _rawEdges,
    completed,
    failed,
    showFeedback,
    showFeedbackAfterFailed,
  ]);

  const startNodePositionRef = useRef<NodePosition | null>(null);

  return useMemo(() => {
    for (const node of initialNodes) {
      if (!sizeMap?.has(node.id)) {
        return { sizeReady: false, nodes: initialNodes, edges: [] };
      }
    }

    const graph = new dagre.graphlib.Graph();
    graph.setGraph({
      rankdir: "TB",
      nodesep: NODE_SEP,
      edgesep: EDGE_SEP,
      ranksep: RANK_SEP,
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

    // Make the start node position unchanged
    let offsets: NodePosition | null = null;

    const nodes = initialNodes.map<GraphNode>((node) => {
      const nodeView = graph.node(node.id);
      const x = nodeView.x - nodeView.width / 2;
      const y = nodeView.y - nodeView.height / 2;

      if (node.type === "start") {
        if (startNodePositionRef.current) {
          offsets = {
            x: startNodePositionRef.current.x - x,
            y: startNodePositionRef.current.y - y,
          };
        } else {
          startNodePositionRef.current = { x, y };
        }
      }

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

    if (offsets) {
      for (const node of nodes) {
        Object.assign(node.view!, getPositionWithOffsets(node.view!, offsets));
      }
    }

    const memoizedPositions = (memoizedPositionsRef.current ??= new Map());
    for (const node of nodes) {
      const { x, y } = node.view!;
      memoizedPositions.set(node.id, { x, y });
    }

    const edges = initialEdges.map((edge) => {
      const source = graph.node(edge.source);
      const sourcePosition = getPositionWithOffsets(source, offsets);
      const target = graph.node(edge.target);
      const targetPosition = getPositionWithOffsets(target, offsets);
      // const turnY =
      //   (sourcePosition.y +
      //     source.height / 2 +
      //     targetPosition.y -
      //     target.height / 2) /
      //   2;
      const turnY = targetPosition.y - (target.height + RANK_SEP) / 2;
      const points: NodePosition[] = [
        { x: sourcePosition.x, y: sourcePosition.y + source.height / 2 },
        { x: sourcePosition.x, y: turnY },
        { x: targetPosition.x, y: turnY },
        { x: targetPosition.x, y: targetPosition.y - target.height / 2 },
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
}

function getPositionWithOffsets<T extends NodePosition>(
  position: T,
  offsets: NodePosition | null
): NodePosition {
  if (!offsets) {
    return {
      x: position.x,
      y: position.y,
    };
  }
  return {
    x: position.x + offsets.x,
    y: position.y + offsets.y,
  };
}
