import { get } from "lodash";
import { CONTAINERGAP, DEFAULT_NODE_SIZE, MAXPERROW } from "../constants";
import { DecoratorCell, NodeCell } from "../interfaces";
import { isGroupDecoratorCell, isNoPoint } from "./asserts";

/**
 * 交错排列的网格布局
 *  [●][●][●][●]
 *   [●][●][●]
 *  [●][●][●][●]
 * @param nodes
 * @param options
 * @returns
 */
export function staggeredLayout(
  nodes: (NodeCell | DecoratorCell)[],
  options: {
    gapX?: number;
    gapY?: number;
    offsetY?: number;
    maxPerRow?: number;
  } = {}
): (NodeCell | DecoratorCell)[] {
  const {
    gapX = 50,
    gapY = 50,
    offsetY = CONTAINERGAP,
    maxPerRow = MAXPERROW,
  } = options;
  /**
   * 满行数量（例如4个）
   * 短行数量（例如3个）
   */
  const fullRowCount = maxPerRow;
  const shortRowCount = maxPerRow - 1;
  const layoutedNodes = [];
  let index = 0,
    row = 0,
    preRowOffsetY = offsetY;

  while (index < nodes.length) {
    const isOddRow = row % 2 === 1;
    const nodesInRow = isOddRow ? shortRowCount : fullRowCount;
    let nodeX = isOddRow ? CONTAINERGAP : 0,
      maxNodeHeight = 0;
    for (let i = 0; i < nodesInRow && index < nodes.length; i++, index++) {
      const node = nodes[index];
      const nodeWidth = get(node, "view.width", DEFAULT_NODE_SIZE);
      const nodeHeight = get(node, "view.height", DEFAULT_NODE_SIZE);
      const x = nodeX;
      const y = preRowOffsetY;
      if (isNoPoint(nodes[index].view) || isGroupDecoratorCell(nodes[index])) {
        nodes[index].view = {
          ...nodes[index].view,
          x,
          y,
          width: nodeWidth,
          height: nodeHeight,
        };
      }
      nodeX = x + (nodeWidth + gapX);
      maxNodeHeight = Math.max(maxNodeHeight, nodeHeight);
      layoutedNodes.push(nodes[index]);
    }
    preRowOffsetY = preRowOffsetY + maxNodeHeight + gapY;
    row++;
  }
  return layoutedNodes;
}
