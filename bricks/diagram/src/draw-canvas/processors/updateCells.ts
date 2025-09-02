import { get, without } from "lodash";
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
  isGroupDecoratorCell,
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
import { initialContainerLayout } from "./initialContainerLayout";

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
  parentNode,
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
  parentNode?: NodeCell;
  allowEdgeToArea?: boolean;
  layoutOptions?: LayoutOptions;
}): {
  cells: Cell[];
  updated: Cell[];
  shouldReCenter: boolean;
} {
  const isManualLayout = layout !== "force" && layout !== "dagre";

  // --- Step 1: 初始化 ---
  const newCells = initializeCells(cells, {
    defaultNodeSize,
    layoutOptions,
    isInitialize: false,
  });
  const updateCandidates: (NodeCell | DecoratorCell)[] = [];
  let shouldReCenter = false;

  // 记录已存在的节点尺寸，避免丢失
  const prevSizeNodes = new Map<string, NodeCell>();
  let prevShouldCentered = false;
  for (const c of previousCells) {
    if (isDecoratorCell(c) || isNodeCell(c)) {
      prevShouldCentered = true;
      if (isNodeCell(c) && c[SYMBOL_FOR_SIZE_INITIALIZED]) {
        prevSizeNodes.set(c.id, c);
      }
    }
  }

  // 构建 id -> node 映射，复用尺寸
  const nodesMap = new Map<string, NodeCell>();
  for (const c of newCells) {
    if (isNodeCell(c)) {
      nodesMap.set(c.id, c);
      const prevNode = prevSizeNodes.get(c.id);
      if (prevNode) {
        Object.assign(c.view, {
          width: prevNode.view.width,
          height: prevNode.view.height,
        });
        c[SYMBOL_FOR_SIZE_INITIALIZED] = true;
      }
    }
  }

  // --- Step 2: 特殊场景 - add-related-nodes ---
  let handled = false;
  if (reason === "add-related-nodes") {
    handled = layoutRelatedNodes({
      newCells,
      nodesMap,
      parent,
      parentNode,
      isManualLayout,
      updateCandidates,
      handled,
    });
  }

  // --- Step 3: 常规布局 ---
  if (!handled) {
    const positioned: NodeCell[] = [];
    let hasDecorators = false;

    for (const c of newCells) {
      if (isNodeCell(c)) {
        if (isNoPoint(c.view)) updateCandidates.push(c);
        else positioned.push(c);
      } else if (isDecoratorCell(c)) {
        hasDecorators = true;
      }
    }

    if (isManualLayout) {
      // 没有居中过，执行一次居中变换
      if (!prevShouldCentered) {
        transform = transformToCenter(without(newCells, ...updateCandidates), {
          canvasWidth,
          canvasHeight,
          scaleRange,
        });
      }

      let getNodeView: (id: NodeId) => NodeView;
      if (
        positioned.length === 0 ||
        (positioned.length === 1 &&
          !hasDecorators &&
          updateCandidates.length > 0)
      ) {
        // 使用 dagre 初始布局
        updateCandidates.push(...positioned);
        ({ getNodeView } = dagreLayout({ cells: newCells, allowEdgeToArea }));
        shouldReCenter =
          previousCells.length === 0 ||
          (previousCells.length === newCells.length &&
            previousCells.every((cell, i) => sameTarget(cell, newCells[i])));
      } else {
        // 使用 force layout 固定已存在位置
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

      // --- Step 4: 容器、分组布局 ---
      const containerCells = newCells.filter(
        (cell) => isContainerDecoratorCell(cell) && isNoSize(cell.view)
      ) as DecoratorCell[];
      const groupCells = newCells.filter(
        (cell) => isGroupDecoratorCell(cell) && isNoSize(cell.view)
      ) as DecoratorCell[];

      const containerAndGroupCells = [...containerCells, ...groupCells];
      const nodeLayout =
        get(layoutOptions, "initialLayout") === "layered-staggered"
          ? "staggered"
          : "dagre";
      if (containerAndGroupCells.length > 0) {
        initialContainerLayout(newCells, { nodeLayout });
        updateCandidates.push(...containerAndGroupCells);
      } else {
        generateNewPointsWithLayout(newCells, { defaultNodeSize });
      }

      // --- Step 5: 更新未定位节点 ---
      for (const c of newCells) {
        if (isNodeCell(c) && isNoPoint(c.view)) {
          const v = getNodeView(c.id);
          c.view.x = v.x;
          c.view.y = v.y;
        }
      }
    }
  }

  return { cells: newCells, updated: updateCandidates, shouldReCenter };
}

/**
 * 布局 add-related-nodes 的子节点
 */
function layoutRelatedNodes({
  newCells,
  nodesMap,
  parent,
  parentNode,
  isManualLayout,
  updateCandidates,
  handled,
}: {
  newCells: Cell[];
  nodesMap: Map<string, NodeCell>;
  parent?: NodeId;
  parentNode?: NodeCell;
  isManualLayout: boolean;
  updateCandidates: (NodeCell | DecoratorCell)[];
  handled: boolean;
}): boolean {
  const parentNodeCell = parent ? nodesMap.get(parent) : parentNode;

  if (!parentNodeCell || isNoPoint(parentNodeCell.view)) return handled;

  // 构建父->子[]
  const adjacency = new Map<string, string[]>();
  const queue: { id: string; parentId: string }[] = [];

  for (const c of newCells) {
    if (isEdgeCell(c) && c.source && c.target) {
      if (!adjacency.has(c.source)) adjacency.set(c.source, []);
      adjacency.get(c.source)!.push(c.target);
      queue.push({ id: c.target, parentId: c.source });
    }
  }

  while (queue.length > 0) {
    const { id, parentId } = queue.shift()!;
    const node = nodesMap.get(id);
    const parent = nodesMap.get(parentId);
    if (!node || !parent) continue;

    if (isNoPoint(node.view)) {
      if (isManualLayout) {
        const siblings = adjacency.get(parentId)!;
        const index = siblings.indexOf(id);
        const baseX =
          parent.view.x + parent.view.width / 2 - node.view.width / 2;
        const baseY = parent.view.y + parent.view.height + DEFAULT_NODE_GAP_V;

        let offsetX = 0;
        if (index > 0) {
          const step = Math.ceil(index / 2);
          const dir = 1 - 2 * (index % 2);
          offsetX = dir * step * (node.view.width + DEFAULT_NODE_GAP_H);
        }

        node.view.x = baseX + offsetX;
        node.view.y = baseY;
      }

      updateCandidates.push(node);
    }

    (adjacency.get(id) || []).forEach((cid) =>
      queue.push({ id: cid, parentId: id })
    );
  }

  return !newCells.some((c) => c.type === "decorator" && isNoPoint(c.view));
}
