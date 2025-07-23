import { forEach, groupBy, isNil } from "lodash";
import { DecoratorCell, InitialCell, NodeCell, NodeView } from "../interfaces";
import {
  isContainerDecoratorCell,
  isGroupDecoratorCell,
  isNoPoint,
} from "./asserts";
import { SizeTuple } from "../../diagram/interfaces";
import { CONTAINERGAP } from "../constants";
import { computeBoundingBox } from "./computeBoundingBox";
import { GROUPPADDING } from "./initaliGroupLayout";
interface Point {
  x: number;
  y: number;
}

/**
 * 在容器内新加节点时，计算新节点的点按位置
 * 按网格排布避免重叠
 * @param cells
 * @param defaultNodeSize 默认节点大小
 * @returns void
 */
export function generateNewPointsWithLayout(
  cells: InitialCell[],
  { defaultNodeSize }: { defaultNodeSize: SizeTuple }
) {
  const newContainerChildCells = cells.filter(
    (c) => c.type === "node" && isNoPoint(c.view!) && !isNil(c.containerId)
  ) as NodeCell[];
  const newGroupChildCells = cells.filter(
    (c) => c.type === "node" && isNoPoint(c.view!) && !isNil(c.groupId)
  ) as NodeCell[];
  if (newGroupChildCells.length) {
    const groupMap: Record<string, NodeCell[]> = {};
    forEach(
      groupBy(newGroupChildCells, "groupId"),
      (groupedNodes, containerId) => {
        groupMap[containerId] = groupedNodes;
      }
    );

    const groupCells = cells.filter(
      (c) => isGroupDecoratorCell(c) && groupMap[c.id]
    ) as DecoratorCell[];
    groupCells.forEach((group) => {
      const groupId = group.id;
      const newNodes = groupMap[groupId];
      const groupView = !isNoPoint(group.view)
        ? group.view
        : (computeBoundingBox(
            cells.filter(
              (c) => c.type === "node" && c.groupId === groupId
            ) as NodeCell[],
            {
              padding: GROUPPADDING,
            }
          ) as NodeView);
      const existingPoints = cells
        .filter(
          (c) =>
            (c as NodeCell)?.groupId === groupId &&
            !isNoPoint((c as NodeCell).view)
        )
        .map((node) => ({ x: node.view!.x, y: node.view!.y })) as Point[];
      newNodes.forEach((node) => {
        const nodeWidth = node.view?.width || defaultNodeSize[0];
        const nodeHeight = node.view?.height || defaultNodeSize[1];
        const gap = 10; // 间距
        const padding = CONTAINERGAP; // 内边距

        const newPoint = computeNodePoints(
          groupView,
          existingPoints,
          nodeWidth,
          nodeHeight,
          gap,
          padding
        );
        if (newPoint) {
          node.view = {
            ...node.view,
            x: newPoint.x,
            y: newPoint.y,
          };
          existingPoints.push(newPoint);
        }
      });
    });
  }
  if (newContainerChildCells.length) {
    const containerGroup: Record<string, NodeCell[]> = {};
    forEach(
      groupBy(newContainerChildCells, "containerId"),
      (groupedNodes, containerId) => {
        containerGroup[containerId] = groupedNodes;
      }
    );

    const containerCells = cells.filter(
      (c) => isContainerDecoratorCell(c) && containerGroup[c.id]
    ) as DecoratorCell[];
    containerCells.forEach((container) => {
      const containerId = container.id;
      const containerView = container.view;

      const existingPoints = cells
        .filter(
          (c) =>
            (c as NodeCell)?.containerId === containerId &&
            !isNoPoint((c as NodeCell).view)
        )
        .map((node) => ({ x: node.view!.x, y: node.view!.y })) as Point[];
      const newNodes = containerGroup[containerId];
      newNodes.forEach((node) => {
        const nodeWidth = node.view?.width || defaultNodeSize[0];
        const nodeHeight = node.view?.height || defaultNodeSize[1];
        const gap = 10; // 间距
        const padding = CONTAINERGAP; // 内边距

        const newPoint = computeNodePoints(
          containerView,
          existingPoints,
          nodeWidth,
          nodeHeight,
          gap,
          padding
        );
        if (newPoint) {
          node.view = {
            ...node.view,
            x: newPoint.x,
            y: newPoint.y,
          };
          existingPoints.push(newPoint);
        }
      });
    });
  }
}

function computeNodePoints(
  containerView: NodeView,
  existingPoints: Point[],
  nodeWidth: number,
  nodeHeight: number,
  gap = 0,
  padding = 0
) {
  const { x: left, y: top, width } = containerView;
  const stepX = nodeWidth + gap;
  const stepY = nodeHeight + gap;
  const cols = Math.max(Math.floor((width - padding * 2) / stepX), 1);
  let row = 0;

  while (true) {
    for (let col = 0; col < cols; col++) {
      const x = left + padding + col * stepX;
      const y = top + padding + row * stepY;

      const overlapping = existingPoints.some((p) =>
        isOverlapping(
          x,
          y,
          nodeWidth,
          nodeHeight,
          p.x,
          p.y,
          nodeWidth,
          nodeHeight
        )
      );

      if (!overlapping) {
        return { x, y };
      }
    }
    row++;
  }
}
/**
 * 判断两个矩形中心点是否重叠（简单矩形碰撞判断）
 */
function isOverlapping(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
) {
  const cx1 = x1 + w1 / 2;
  const cy1 = y1 + h1 / 2;
  const cx2 = x2 + w2 / 2;
  const cy2 = y2 + h2 / 2;

  const minDistX = (w1 + w2) / 2;
  const minDistY = (h1 + h2) / 2;

  return Math.abs(cx1 - cx2) < minDistX && Math.abs(cy1 - cy2) < minDistY;
}
