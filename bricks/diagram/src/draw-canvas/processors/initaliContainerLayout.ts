import { forEach, get, groupBy, isNil } from "lodash";
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

  // 排序容器层级，高层级优先布局
  const sortedContainerIds = decoratorCells
    .filter((cell) => containerGroup[cell.id])
    .sort((a, b) => get(b, "view.level", 1) - get(a, "view.level", 1))
    .map((cell) => cell.id);

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
    const containerRect = computeContainerRect(nodeViews as BaseNodeCell[]);
    const { height, width } = containerRect;
    if (isNoSize(containerCell.view)) {
      containerCell.view = { ...containerCell.view, ...containerRect };
      if (width! > maxContainerWidth) maxContainerWidth = width!;
      uniformWidthContainers.push(containerCell);
    }
    containerGap += height! + 50;
  });

  // 统一容器宽度
  uniformWidthContainers.forEach((container) => {
    container.view.width = maxContainerWidth;
  });
}
