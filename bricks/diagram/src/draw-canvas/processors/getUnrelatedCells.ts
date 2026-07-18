import type { ActiveTarget, Cell, ConnectLineState } from "../interfaces";
import { targetIsActive } from "./targetIsActive";

export type RelatedCellsScope = "adjacent" | "chain";

export function getUnrelatedCells(
  cells: Cell[],
  connectLineState: ConnectLineState | null,
  activeTarget: ActiveTarget | null,
  allowEdgeToArea?: boolean,
  relatedCellsScope: RelatedCellsScope = "adjacent"
): Cell[] {
  const unrelated: Cell[] = [];
  if (connectLineState) {
    const existedTargets = new Set<string>();
    for (const cell of cells) {
      if (cell.type === "edge" && cell.source === connectLineState.source.id) {
        existedTargets.add(cell.target);
      }
    }
    for (const cell of cells) {
      switch (cell.type) {
        case "node":
          if (existedTargets.has(cell.id)) {
            unrelated.push(cell);
          }
          break;
        case "decorator":
          if (
            !allowEdgeToArea ||
            cell.decorator == "text" ||
            existedTargets.has(cell.id)
          ) {
            unrelated.push(cell);
          }
          break;
        default:
          unrelated.push(cell);
      }
    }
  } else {
    switch (activeTarget?.type) {
      case "multi": {
        if (relatedCellsScope === "chain" && activeTarget.targets.length > 1) {
          for (const cell of cells) {
            if (!targetIsActive(cell, activeTarget)) {
              unrelated.push(cell);
            }
          }
          break;
        }
        const nodesMap = new Map<string, Cell>();
        const activeNodeIds = new Set<string>();
        for (const active of activeTarget.targets) {
          if (active.type === "node") {
            activeNodeIds.add(active.id);
          } else if (relatedCellsScope === "chain" && active.type === "edge") {
            activeNodeIds.add(active.source);
            activeNodeIds.add(active.target);
          }
        }
        const { relatedNodeIds, relatedEdges } = getRelatedCells(
          cells,
          activeNodeIds,
          relatedCellsScope
        );
        for (const cell of cells) {
          if (cell.type === "node") {
            nodesMap.set(cell.id, cell);
          } else if (cell.type === "edge") {
            if (
              !relatedEdges.has(cell) &&
              !targetIsActive(cell, activeTarget)
            ) {
              unrelated.push(cell);
            }
          } else if (!targetIsActive(cell, activeTarget)) {
            unrelated.push(cell);
          }
        }
        for (const [id, cell] of nodesMap) {
          if (!relatedNodeIds.has(id)) {
            unrelated.push(cell);
          }
        }
        break;
      }

      case "node": {
        const nodesMap = new Map<string, Cell>();
        const { relatedNodeIds, relatedEdges } = getRelatedCells(
          cells,
          new Set([activeTarget.id]),
          relatedCellsScope
        );
        for (const cell of cells) {
          if (cell.type === "node") {
            nodesMap.set(cell.id, cell);
          } else if (cell.type === "edge") {
            if (!relatedEdges.has(cell)) {
              unrelated.push(cell);
            }
          } else {
            unrelated.push(cell);
          }
        }
        for (const [id, cell] of nodesMap) {
          if (!relatedNodeIds.has(id)) {
            unrelated.push(cell);
          }
        }
        break;
      }

      case "edge":
        for (const cell of cells) {
          if (
            !(cell.type === "edge"
              ? targetIsActive(cell, activeTarget)
              : cell.type === "node" &&
                (cell.id === activeTarget.source ||
                  cell.id === activeTarget.target))
          ) {
            unrelated.push(cell);
          }
        }
        break;
    }
  }

  return unrelated;
}

function getRelatedCells(
  cells: Cell[],
  activeNodeIds: Set<string>,
  relatedCellsScope: RelatedCellsScope
): {
  relatedNodeIds: Set<string>;
  relatedEdges: Set<Cell>;
} {
  const relatedNodeIds = new Set(activeNodeIds);
  const relatedEdges = new Set<Cell>();

  if (relatedCellsScope === "adjacent") {
    for (const cell of cells) {
      if (cell.type !== "edge") {
        continue;
      }
      if (activeNodeIds.has(cell.source) || activeNodeIds.has(cell.target)) {
        relatedEdges.add(cell);
        relatedNodeIds.add(cell.source);
        relatedNodeIds.add(cell.target);
      }
    }
    return { relatedNodeIds, relatedEdges };
  }

  collectDirectedRelatedCells(cells, [...activeNodeIds], "upstream", {
    relatedNodeIds,
    relatedEdges,
  });
  collectDirectedRelatedCells(cells, [...activeNodeIds], "downstream", {
    relatedNodeIds,
    relatedEdges,
  });

  return { relatedNodeIds, relatedEdges };
}

function collectDirectedRelatedCells(
  cells: Cell[],
  initialQueue: string[],
  direction: "upstream" | "downstream",
  related: {
    relatedNodeIds: Set<string>;
    relatedEdges: Set<Cell>;
  }
): void {
  const visited = new Set(initialQueue);
  const queue = [...initialQueue];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    for (const cell of cells) {
      if (cell.type !== "edge") {
        continue;
      }
      let nextNodeId: string | undefined;
      if (direction === "downstream" && cell.source === nodeId) {
        nextNodeId = cell.target;
      } else if (direction === "upstream" && cell.target === nodeId) {
        nextNodeId = cell.source;
      }
      if (!nextNodeId) {
        continue;
      }
      related.relatedEdges.add(cell);
      related.relatedNodeIds.add(nextNodeId);
      if (!visited.has(nextNodeId)) {
        visited.add(nextNodeId);
        queue.push(nextNodeId);
      }
    }
  }
}
