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
  isGroupDecoratorCell,
  isNoPoint,
  isNoSize,
} from "./asserts";
import { dagreLayout } from "../../shared/canvas/dagreLayout";
import { computeBoundingBox } from "./computeBoundingBox";
import {
  CONTAINERGAP,
  DEFAULT_AREA_HEIGHT,
  DEFAULT_AREA_WIDTH,
} from "../constants";
import { staggeredLayout } from "./staggeredLayout";
import { GROUPPADDING, initialGroupLayout } from "./initialGroupLayout";
export interface LayoutOptions {
  nodeLayout?: "staggered" | "dagre";
}

/**
 * 初始化容器内节点层次布局以及同步容器大小位置
 * @param cells
 */
export function initialContainerLayout(
  cells: InitialCell[],
  options: LayoutOptions = {}
) {
  const { groupMap } = initialGroupLayout(cells, options);
  const nodeCells = cells.filter(
    (c) => c.type === "node" && !isNil(c.containerId)
  ) as NodeCell[];
  const groupCells = cells.filter(
    (c) =>
      c.type === "decorator" && c.decorator === "group" && !isNil(c.containerId)
  ) as DecoratorCell[];
  if (!nodeCells.length && !groupCells.length) return;

  const { nodeLayout = "dagre" } = options;

  const edgeCells = cells.filter(isEdgeCell);
  const containerCells = cells.filter((c) =>
    isContainerDecoratorCell(c)
  ) as DecoratorCell[];

  // 预处理 decoratorCells，以便后续查找更高效
  const containerCellMap = new Map<string, DecoratorCell>();
  let containerGap = 0,
    maxContainerWidth = 0;

  containerCells.forEach((cell) => {
    containerCellMap.set(cell.id, cell);
  });

  const containerGroup: Record<string, Omit<Cell, "DecoratorCell">[]> = {};
  const groupNameMap: Record<string, Set<string>> = {};

  forEach(
    groupBy([...nodeCells, ...groupCells], "containerId"),
    (groupedNodes, containerId) => {
      containerGroup[containerId] = groupedNodes;
      groupNameMap[containerId] = new Set(groupedNodes.map((node) => node.id));
    }
  );

  // 把边加入所属容器组
  edgeCells.forEach((edge) => {
    for (const [groupId, idSet] of Object.entries(groupNameMap)) {
      if (idSet.has(edge.source) && idSet.has(edge.target)) {
        containerGroup[groupId].push(edge);
        break;
      }
    }
  });

  const uniformWidthContainers: DecoratorCell[] = [];

  // 排序容器层级，level越大越后面；没有大小都排后面
  const sortedContainerIds = orderBy(
    containerCells.filter((cell) => containerGroup[cell.id]),
    [(o) => (isNoSize(o.view) ? 1 : 0), (o) => get(o, "view.level", 1)],
    ["asc", "asc"]
  ).map((cell) => cell.id);
  const { updatedGap, updatedMaxWidth } = processSortedContainers(
    sortedContainerIds,
    containerGroup,
    containerCellMap,
    nodeLayout,
    containerGap,
    uniformWidthContainers,
    maxContainerWidth,
    {
      groupCells,
      groupMap,
    }
  );

  containerGap = updatedGap;
  maxContainerWidth = updatedMaxWidth;

  // 统一容器宽度
  uniformWidthContainers.forEach((container) => {
    container.view.width = Math.max(DEFAULT_AREA_WIDTH, maxContainerWidth);
  });
}

function processSortedContainers(
  sortedContainerIds: string[],
  containerGroup: Record<string, Omit<Cell, "DecoratorCell">[]>,
  containerCellMap: Map<string, DecoratorCell>,
  nodeLayout: string,
  containerGap: number,
  uniformWidthContainers: DecoratorCell[],
  maxContainerWidth: number,
  decoratorGroup: {
    groupCells: DecoratorCell[];
    groupMap: Record<string, Omit<Cell, "DecoratorCell">[]>;
  }
) {
  let currentContainerGap = containerGap;
  let currentMaxContainerWidth = maxContainerWidth;

  sortedContainerIds.forEach((groupId) => {
    const containerCell = containerCellMap.get(groupId)!;
    const groupedNodes = containerGroup[groupId] as Cell[];

    const isVertical = ["top", "bottom"].includes(
      get(containerCell, "view.direction", "top")
    );
    if (isVertical) currentContainerGap += CONTAINERGAP;
    const nodeCells = groupedNodes.filter(
      (cell) => cell.type === "node"
    ) as NodeCell[];
    const decoratorGroups = get(decoratorGroup, "groupCells", []).filter(
      (g) => g.containerId === groupId
    ) as DecoratorCell[];

    let nodeViews: (NodeCell | DecoratorCell)[] = [];
    if (nodeLayout === "dagre") {
      const { getNodeView } = dagreLayout({
        cells: [...groupedNodes, ...decoratorGroups],
      });
      nodeViews = [...nodeCells, ...decoratorGroups].map((cell) => {
        if (isNoPoint(cell.view) || isGroupDecoratorCell(cell)) {
          const view = getNodeView(cell.id);
          cell.view = {
            ...cell.view,
            x: view.x,
            y: view.y + currentContainerGap,
            width: view.width,
            height: view.height,
          };
        }
        return cell;
      });
    } else if (nodeLayout === "staggered") {
      nodeViews = staggeredLayout([...nodeCells, ...decoratorGroups], {
        offsetY: currentContainerGap,
      });
    }
    let containerHeight = 0,
      containerWidth = 0;
    if (isNoSize(containerCell.view)) {
      const containerRect = computeBoundingBox(nodeViews as BaseNodeCell[]);
      containerHeight = get(containerRect, "height", DEFAULT_AREA_HEIGHT);
      containerWidth = get(containerRect, "width", DEFAULT_AREA_WIDTH);
      containerCell.view = { ...containerCell.view, ...containerRect };
      uniformWidthContainers.push(containerCell);
    } else {
      containerHeight = get(containerCell, "view.height");
      containerWidth = get(containerCell, "view.width");
    }

    /**
     * 计算好容器位置在重新设置组内节点x,y
     */
    if (decoratorGroups.length > 0) {
      const groupMap = get(decoratorGroup, "groupMap", {});
      decoratorGroups.forEach((group) => {
        const groupId = group.id;
        const { x: groupX, y: groupY } = group.view;
        const nodeCells: NodeCell[] = get(groupMap, groupId, []);

        if (!nodeCells.length) return;

        // 记录第一个节点的基准坐标
        const baseX = nodeCells[0].view.x;
        const baseY = nodeCells[0].view.y;

        nodeCells.forEach((node: NodeCell) => {
          node.view = {
            ...node.view,
            x: groupX + (node.view?.x - baseX),
            y: groupY + (node.view?.y - baseY),
          };
        });

        group.view = {
          ...group.view,
          x: groupX - GROUPPADDING,
          y: groupY - GROUPPADDING,
        };
      });
    }

    currentMaxContainerWidth = Math.max(
      containerWidth,
      currentMaxContainerWidth
    );
    currentContainerGap += containerHeight + CONTAINERGAP;
  });

  return {
    updatedGap: currentContainerGap,
    updatedMaxWidth: currentMaxContainerWidth,
  };
}
