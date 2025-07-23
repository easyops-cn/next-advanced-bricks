import { get, pick } from "lodash";
import dagre from "@dagrejs/dagre";
import { extractPartialRectTuple } from "../../diagram/processors/extractPartialRectTuple";
import type {
  Cell,
  ForceNode,
  LayoutOptionsDagre,
  NodeId,
  NodeView,
} from "../../draw-canvas/interfaces";
import {
  isEdgeCell,
  isGroupDecoratorCell,
  isNodeCell,
  isNodeOrAreaDecoratorCell,
} from "../../draw-canvas/processors/asserts";
import type { FullRectTuple } from "../../diagram/interfaces";

export interface DagreLayoutOptions {
  cells: Cell[];
  layoutOptions?: LayoutOptionsDagre;
  allowEdgeToArea?: boolean;
}

export function dagreLayout({
  cells,
  layoutOptions,
  allowEdgeToArea,
}: DagreLayoutOptions): {
  getNodeView: (id: NodeId) => NodeView;
  nodePaddings: FullRectTuple;
} {
  const { nodePadding, ...dagreGraphOptions } = {
    nodePadding: 0,
    rankdir: "TB",
    ranksep: 50,
    edgesep: 10,
    nodesep: 50,
    // align: undefined,
    ...pick(layoutOptions, [
      "nodePadding",
      "rankdir",
      "ranksep",
      "edgesep",
      "nodesep",
      "align",
    ]),
  };
  const nodePaddings = extractPartialRectTuple(nodePadding);

  if (!cells.some(isNodeCell)) {
    // Dagre cannot render empty nodes
    return {
      getNodeView: () => null!,
      nodePaddings,
    };
  }

  const graph = new dagre.graphlib.Graph<ForceNode>();
  graph.setGraph(dagreGraphOptions);
  // Default to assigning a new object as a label for each new edge.
  graph.setDefaultEdgeLabel(function () {
    return {};
  });
  for (const cell of cells) {
    if (
      (allowEdgeToArea && isNodeOrAreaDecoratorCell(cell)) ||
      isNodeCell(cell) ||
      isGroupDecoratorCell(cell)
    ) {
      graph.setNode(cell.id, {
        id: cell.id,
        width: get(cell, "view.width", 0) + nodePaddings[1] + nodePaddings[3],
        height: get(cell, "view.height", 0) + nodePaddings[0] + nodePaddings[2],
      });
    } else if (isEdgeCell(cell)) {
      graph.setEdge(cell.source, cell.target);
    }
  }
  dagre.layout(graph);

  return {
    getNodeView: (id: NodeId) => graph.node(id),
    nodePaddings,
  };
}
