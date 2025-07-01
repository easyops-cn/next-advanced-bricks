import { without } from "lodash";
import type {
  RangeTuple,
  SizeTuple,
  TransformLiteral,
} from "../../diagram/interfaces";
import {
  DEFAULT_NODE_GAP_H,
  DEFAULT_NODE_GAP_V,
  SYMBOL_FOR_SIZE_INITIALIZED,
} from "../constants";
import type {
  Cell,
  DecoratorCell,
  InitialCell,
  LayoutOptions,
  LayoutType,
  NodeCell,
  NodeId,
  NodeView,
} from "../interfaces";
import {
  isContainerDecoratorCell,
  isDecoratorCell,
  isEdgeCell,
  isNodeCell,
  isNoPoint,
  isNoSize,
} from "./asserts";
import { initializeCells } from "./initializeCells";
import { transformToCenter } from "./transformToCenter";
import { forceLayout } from "../../shared/canvas/forceLayout";
import { dagreLayout } from "../../shared/canvas/dagreLayout";
import { sameTarget } from "./sameTarget";
import { generateNewPointsWithLayout } from "./generateNewPointsWithLayout";
import { initaliContainerLayout } from "./initaliContainerLayout";

export function updateCells({
  cells,
  layout,
  previousCells,
  defaultNodeSize,
  canvasWidth,
  canvasHeight,
  scaleRange,
  transform,
  reason,
  parent,
  allowEdgeToArea,
  layoutOptions,
}: {
  cells: InitialCell[] | undefined;
  layout?: LayoutType;
  previousCells: Cell[];
  defaultNodeSize: SizeTuple;
  canvasWidth: number;
  canvasHeight: number;
  scaleRange: RangeTuple;
  transform: TransformLiteral;
  reason?: "add-related-nodes";
  parent?: NodeId;
  allowEdgeToArea?: boolean;
  layoutOptions?: LayoutOptions;
}): {
  cells: Cell[];
  updated: Cell[];
  shouldReCenter: boolean;
} {
  const isManualLayout = layout !== "force" && layout !== "dagre";
  const newCells = initializeCells(cells, {
    defaultNodeSize,
    layoutOptions,
    isInitialize: false,
  });
  const updateCandidates: (NodeCell | DecoratorCell)[] = [];
  let shouldReCenter = false;

  const previousSizeInitializedNodes = new Map<string, NodeCell>();
  let previousShouldCentered = false;
  for (const cell of previousCells) {
    if (isDecoratorCell(cell)) {
      previousShouldCentered = true;
    } else if (isNodeCell(cell)) {
      previousShouldCentered = true;
      if (cell[SYMBOL_FOR_SIZE_INITIALIZED]) {
        previousSizeInitializedNodes.set(cell.id, cell);
      }
    }
  }

  const nodesMap = new Map<string, NodeCell>();
  for (const cell of newCells) {
    if (isNodeCell(cell)) {
      nodesMap.set(cell.id, cell);
      const previousNode = previousSizeInitializedNodes.get(cell.id);
      if (previousNode) {
        cell.view.width = previousNode.view.width;
        cell.view.height = previousNode.view.height;
        cell[SYMBOL_FOR_SIZE_INITIALIZED] = true;
      }
    }
  }

  let handled = false;

  if (reason === "add-related-nodes" && parent) {
    // Place these unpositioned downstream nodes below the parent node, and
    // on the right side of the positioned siblings.
    const downstreamNodeIds = new Set<string>();
    for (const cell of newCells) {
      if (
        isEdgeCell(cell) &&
        cell.source === parent &&
        cell.target !== parent
      ) {
        downstreamNodeIds.add(cell.target);
      }
    }
    const parentNode = nodesMap.get(parent);
    if (parentNode?.view.x !== undefined && parentNode.view.y !== undefined) {
      handled = true;
      /**
       * 临时解决一次性添加多层的节点手工布局报错
       */
      if (isManualLayout) {
        for (const cell of newCells) {
          if (
            (isNodeCell(cell) && cell.view.x === undefined) ||
            (isNodeCell(cell) && cell.view.y === undefined)
          ) {
            downstreamNodeIds.add(cell.id);
          }
        }
      }
      const downstreamNodes = [...downstreamNodeIds]
        .map((id) => nodesMap.get(id))
        .filter(Boolean) as NodeCell[];
      let rightMostNode: NodeCell | undefined = undefined;
      for (const node of downstreamNodes) {
        if (node.view.x !== undefined && node.view.y !== undefined) {
          // Find the rightmost node that is below the parent node.
          if (
            (!rightMostNode || node.view.x > rightMostNode.view.x) &&
            node.view.y > parentNode.view.y
          ) {
            rightMostNode = node;
          }
        } else {
          // Unpositioned nodes
          updateCandidates.push(node);
        }
      }
      if (updateCandidates.length > 0 && isManualLayout) {
        let nextX: number;
        let nextY: number;
        if (rightMostNode) {
          // Place unpositioned nodes on the right side of the rightmost positioned siblings.
          nextX =
            rightMostNode.view.x +
            rightMostNode.view.width +
            DEFAULT_NODE_GAP_H;
          nextY = rightMostNode.view.y;
        } else {
          // If there are no positioned siblings, just place them below the parent.
          const totalWidth = updateCandidates.reduce(
            (acc, node) => acc + node.view.width + DEFAULT_NODE_GAP_H,
            -DEFAULT_NODE_GAP_H
          );
          nextX =
            parentNode.view.x - totalWidth / 2 + parentNode.view.width / 2;
          nextY =
            parentNode.view.y + parentNode.view.height + DEFAULT_NODE_GAP_V;
        }
        for (const node of updateCandidates) {
          node.view.x = nextX;
          node.view.y = nextY;
          nextX += node.view.width + DEFAULT_NODE_GAP_H;
        }
      }
    }
  }

  if (!handled) {
    // By default, place unpositioned nodes in a grid.
    const positionedNodes: NodeCell[] = [];
    let hasDecorators = false;
    for (const cell of newCells) {
      if (isNodeCell(cell)) {
        if (isNoPoint(cell.view)) {
          updateCandidates.push(cell);
        } else {
          positionedNodes.push(cell);
        }
      } else if (isDecoratorCell(cell)) {
        hasDecorators = true;
      }
    }

    if (isManualLayout) {
      if (!previousShouldCentered) {
        // If the previous cells are not centered, use the centered transform instead.
        transform = transformToCenter(without(newCells, ...updateCandidates), {
          canvasWidth,
          canvasHeight,
          scaleRange,
        });
      }

      let getNodeView: (id: NodeId) => NodeView;

      // If there is no positioned nodes, or only one while without decorators and unpositioned nodes exist,
      // then there is no relative positions, we can place the nodes with dagre layout.
      // Otherwise, use the force layout.
      if (
        positionedNodes.length === 0 ||
        (positionedNodes.length === 1 &&
          !hasDecorators &&
          updateCandidates.length > 0)
      ) {
        // The positioned node (if exists) will be updated.
        updateCandidates.push(...positionedNodes);
        ({ getNodeView } = dagreLayout({ cells: newCells, allowEdgeToArea }));
        // Only re-center when there is no cells previous,
        // or the cell ids are not changed (this happens when updateCells called by backend right after dropNode).
        shouldReCenter =
          previousCells.length === 0 ||
          (previousCells.length === newCells.length &&
            previousCells.every((cell, index) =>
              sameTarget(cell, newCells[index])
            ));
      } else {
        ({ getNodeView } = forceLayout({
          cells: newCells,
          fixedPosition: true,
          allowEdgeToArea,
          center: [
            (canvasWidth / 2 - transform.x) / transform.k,
            (canvasHeight / 2 - transform.y) / transform.k,
          ],
        }));
      }
      /**
       * 首次通过updateCells渲染时，才会存在容器，节点都没有位置大小，
       */
      const containerCells = newCells.filter(
        (cell) => isContainerDecoratorCell(cell) && isNoSize(cell.view)
      ) as DecoratorCell[];
      if (containerCells.length > 0) {
        updateCandidates.push(...containerCells);
        initaliContainerLayout(newCells);
      } else {
        generateNewPointsWithLayout(newCells, { defaultNodeSize });
      }

      for (const cell of newCells) {
        if (isNodeCell(cell) && isNoPoint(cell.view)) {
          const view = getNodeView(cell.id);
          cell.view.x = view.x;
          cell.view.y = view.y;
        }
      }
    }
  }

  return { cells: newCells, updated: updateCandidates, shouldReCenter };
}
