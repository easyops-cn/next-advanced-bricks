import { get } from "lodash";
import { CONTAINERGAP, DEFAULT_NODE_SIZE, MAXPERROW } from "../constants";
import { NodeCell } from "../interfaces";

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
  nodes: NodeCell[],
  options: {
    gapX?: number;
    gapY?: number;
    offsetY?: number;
    maxPerRow?: number;
  } = {}
): NodeCell[] {
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
  let index = 0;
  let row = 0;

  while (index < nodes.length) {
    const node = nodes[index];
    const nodeWidth = get(node, "view.width", DEFAULT_NODE_SIZE);

    const nodeHeight = get(node, "view.height", DEFAULT_NODE_SIZE);
    const isOddRow = row % 2 === 1;
    const nodesInRow = isOddRow ? shortRowCount : fullRowCount;
    const offsetX = isOddRow ? (nodeWidth + gapX) / 2 : 0;

    for (let i = 0; i < nodesInRow && index < nodes.length; i++, index++) {
      const x = offsetX + i * (nodeWidth + gapX);
      const y = row * (nodeHeight + gapY) + offsetY;

      nodes[index].view = {
        ...nodes[index].view,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
      };
      layoutedNodes.push(nodes[index]);
    }
    row++;
  }
  return layoutedNodes;
}
