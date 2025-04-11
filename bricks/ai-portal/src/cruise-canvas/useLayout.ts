import dagre from "@dagrejs/dagre";
import { useMemo, useRef } from "react";
import type {
  Edge,
  Node,
  NodePosition,
  RawNode,
  SizeTuple,
} from "./interfaces";
import { END_NODE_ID, START_NODE_ID } from "./constants";

export interface UseLayoutOptions {
  rawNodes: RawNode[] | undefined;
  sizeMap: Map<string, SizeTuple> | null;
}

export function useLayout({ rawNodes, sizeMap }: UseLayoutOptions) {
  const { initialNodes, initialEdges } = useMemo(() => {
    const initialNodes: Node[] = [
      {
        id: START_NODE_ID,
        type: "start",
      },
    ];
    const initialEdges: Omit<Edge, "points">[] = [];
    const groupChildrenMap = new Map<string, string[]>();
    const finishedNodeIds: string[] = [];

    for (const node of rawNodes ?? []) {
      if (node.type === "group") {
        groupChildrenMap.set(node.id, node.groupChildren);
      } else {
        const groupChildren = node.parent
          ? groupChildrenMap.get(node.parent)
          : undefined;
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
      initialEdges.push(
        ...finishedNodeIds.map((id) => ({
          source: id,
          target: END_NODE_ID,
        }))
      );
    }

    return { initialNodes, initialEdges };
  }, [rawNodes]);

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

    const nodes = initialNodes.map<Node>((node) => {
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

    const edges = initialEdges.map((edge) => {
      const source = graph.node(edge.source);
      const sourcePosition = getPositionWithOffsets(source, offsets);
      const target = graph.node(edge.target);
      const targetPosition = getPositionWithOffsets(target, offsets);
      const turnY =
        (sourcePosition.y + source.height / 2 + targetPosition.y - target.height / 2) / 2;
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

function getPositionWithOffsets<T extends NodePosition>(position: T, offsets: NodePosition | null): NodePosition {
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
