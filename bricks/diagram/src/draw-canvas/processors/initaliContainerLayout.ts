import { forEach, get, groupBy, isNil, orderBy } from "lodash";
import type {
  BaseNodeCell,
  Cell,
  DecoratorCell,
  InitialCell,
  NodeCell,
} from "../interfaces";
import {
  isContainerDecoratorCell,
  isEdgeCell,
  isNoPoint,
  isNoSize,
} from "./asserts";
import { dagreLayout } from "../../shared/canvas/dagreLayout";
import { computeContainerRect } from "./computeContainerRect";
import { DEFAULT_AREA_HEIGHT, DEFAULT_AREA_WIDTH } from "../constants";

/**
 * 初始化容器内节点层次布局以及同步容器大小位置
 * @param cells
 */
export function initaliContainerLayout(cells: InitialCell[]) {
  const nodeCells = cells.filter(
    (c) => c.type === "node" && !isNil(c.containerId)
  ) as NodeCell[];
  if (!nodeCells.length) return;
  const edgeCells = cells.filter(isEdgeCell);
  const decoratorCells = cells.filter(
    isContainerDecoratorCell
  ) as DecoratorCell[];
  const containerGroup: Record<string, Omit<Cell, "DecoratorCell">[]> = {};
  const groupNameMap: Record<string, Set<string>> = {};

  // 分组节点
  forEach(groupBy(nodeCells, "containerId"), (groupedNodes, containerId) => {
    containerGroup[containerId] = groupedNodes;
    groupNameMap[containerId] = new Set(groupedNodes.map((node) => node.id));
  });

  // 把边加入所属容器组
  edgeCells.forEach((edge) => {
    for (const [groupId, idSet] of Object.entries(groupNameMap)) {
      if (idSet.has(edge.source) && idSet.has(edge.target)) {
        containerGroup[groupId].push(edge);
        break;
      }
    }
  });

  let containerGap = 0,
    maxContainerWidth = 0,
    nodeViews: NodeCell[] = [];
  const uniformWidthContainers: DecoratorCell[] = [];
  // 排序容器层级，level越大越后面；没有大小都排后面
  const sortedContainerIds = orderBy(
    decoratorCells.filter((cell) => containerGroup[cell.id]),
    [(o) => (isNoSize(o.view) ? 1 : 0), (o) => get(o, "view.level", 1)],
    ["asc", "asc"]
  ).map((cell) => cell.id);
  sortedContainerIds.forEach((groupId) => {
    const containerCell = decoratorCells.find((d) => d.id === groupId)!;
    const groupedNodes = containerGroup[groupId] as Cell[];

    const isVertical = ["top", "bottom"].includes(
      get(containerCell, "view.direction", "top")
    );
    if (isVertical) containerGap += 40;

    const { getNodeView } = dagreLayout({ cells: groupedNodes });
    nodeViews = groupedNodes
      .filter((cell) => cell.type === "node")
      .map((node: NodeCell) => {
        if (isNoPoint(node.view)) {
          const view = getNodeView(node.id);
          node.view = {
            ...node.view,
            x: view.x,
            y: view.y + containerGap,
            width: view.width,
            height: view.height,
          };
        }
        return node;
      });
    let containerHeight = 0,
      containerWidth = 0;

    if (isNoSize(containerCell.view)) {
      const containerRect = computeContainerRect(nodeViews as BaseNodeCell[]);
      containerHeight = get(containerRect, "height", DEFAULT_AREA_HEIGHT);
      containerWidth = get(containerRect, "width", DEFAULT_AREA_WIDTH);
      containerCell.view = { ...containerCell.view, ...containerRect };
      uniformWidthContainers.push(containerCell);
    } else {
      containerHeight = get(containerCell, "view.height");
      containerWidth = get(containerCell, "view.width");
    }
    maxContainerWidth = Math.max(containerWidth, maxContainerWidth);
    containerGap += containerHeight + 50;
  });

  // 统一容器宽度
  uniformWidthContainers.forEach((container) => {
    container.view.width = Math.max(DEFAULT_AREA_WIDTH, maxContainerWidth);
  });
}
