import dagre from "@dagrejs/dagre";
import { useMemo, useRef } from "react";
import type {
  NodePosition,
  NodeView,
  GraphEdge,
  GraphNode,
  SizeTuple,
  TaskState,
} from "./interfaces";
import { END_NODE_ID, START_NODE_ID } from "./constants";

export interface UseLayoutOptions {
  rawNodes: GraphNode[] | undefined;
  rawEdges: GraphEdge[] | undefined;
  sizeMap: Map<string, SizeTuple> | null;
  state?: TaskState;
}

export function useLayout({
  rawNodes: _rawNodes,
  rawEdges: _rawEdges,
  sizeMap,
  state,
}: UseLayoutOptions) {
  const memoizedPositionsRef = useRef<Map<string, NodePosition> | null>(null);
  const completed = state === "completed";

  const { initialNodes, initialEdges } = useMemo(() => {
    const initialNodes: GraphNode[] = [
      {
        type: "start",
        id: START_NODE_ID,
        startTime: 0,
      },
    ];
    const initialEdges: GraphEdge[] = [];
    const finishedNodeIds: string[] = [];
    const rawNodes = _rawNodes ?? [];
    const rawEdges = _rawEdges ?? [];

    const hasSource = new Set<string>(rawEdges.map((edge) => edge.target));
    const hasTarget = completed
      ? new Set<string>(rawEdges.map((edge) => edge.source))
      : null;

    for (const node of rawNodes) {
      if (!hasSource.has(node.id)) {
        initialEdges.push({
          source: START_NODE_ID,
          target: node.id,
        });
      }

      if (completed && !hasTarget!.has(node.id)) {
        finishedNodeIds.push(node.id);
      }
    }

    initialNodes.push(...rawNodes);
    initialEdges.push(...rawEdges);

    if (finishedNodeIds.length > 0) {
      initialNodes.push({
        id: END_NODE_ID,
        type: "end",
        startTime: Infinity,
      });
      initialEdges.push(
        ...finishedNodeIds.map((id) => ({
          source: id,
          target: END_NODE_ID,
        }))
      );
    }

    const memoizedPositions = memoizedPositionsRef.current;
    if (memoizedPositions) {
      for (const node of initialNodes) {
        const view = memoizedPositions.get(node.id);
        if (view) {
          node.view = view as NodeView;
        }
      }
    }

    return { initialNodes, initialEdges };
  }, [completed, _rawEdges, _rawNodes]);

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
      const turnY = targetPosition.y - target.height / 2 - 25;
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
