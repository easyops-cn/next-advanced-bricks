import { get, orderBy } from "lodash";
import {
  ActiveTarget,
  BaseNodeCell,
  Cell,
  DecoratorCell,
  InitialCell,
  NodeCell,
} from "../interfaces";
import { LayoutOptions } from "./initialContainerLayout";
import {
  isEdgeCell,
  isGroupDecoratorCell,
  isNodeCell,
  isNoPoint,
  isNoSize,
} from "./asserts";
import { dagreLayout } from "../../shared/canvas/dagreLayout";
import { staggeredLayout } from "./staggeredLayout";
import { computeBoundingBox } from "./computeBoundingBox";
import { CONTAINERGAP } from "../constants";
export const GROUPPADDING = 12;

export function initialGroupLayout(
  cells: InitialCell[],
  options: LayoutOptions = {}
) {
  const groupMap: Record<string, Omit<Cell, "DecoratorCell">[]> = {};
  const decoratorCells = cells.filter(
    (c) => isGroupDecoratorCell(c) && isNoPoint(c.view)
  ) as DecoratorCell[];

  if (!decoratorCells.length) return { groupMap };
  const { nodeLayout = "dagre" } = options;
  const nodeCells = cells.filter((c) => c.type === "node") as NodeCell[];
  const edgeCells = cells.filter(isEdgeCell);

  // 预处理 decoratorCells，以便后续查找更高效
  const containerCellMap = new Map<string, DecoratorCell>();
  decoratorCells.forEach((cell) => {
    containerCellMap.set(cell.id, cell);
  });

  const groupNameMap: Record<string, Set<string>> = {};

  // 分组节点并构建 groupNameMap
  nodeCells.forEach((node) => {
    const { groupId } = node;
    if (groupId) {
      if (!groupMap[groupId]) {
        groupMap[groupId] = [];
        groupNameMap[groupId] = new Set();
      }
      groupMap[groupId].push(node);
      groupNameMap[groupId].add(node.id);
    }
  });

  // 把边加入所属组
  edgeCells.forEach((edge) => {
    for (const [groupId, idSet] of Object.entries(groupNameMap)) {
      if (idSet.has(edge.source) && idSet.has(edge.target)) {
        groupMap[groupId].push(edge);
        break;
      }
    }
  });

  const containerGap = 0;
  // 排序组层级，level越大越后面；没有大小都排后面
  const sortedGroupIds = orderBy(
    decoratorCells.filter((cell) => groupMap[cell.id]),
    [(o) => (isNoSize(o.view) ? 1 : 0), (o) => get(o, "view.level", 1)],
    ["asc", "asc"]
  ).map((cell) => cell.id);
  processSortedGroups(
    sortedGroupIds,
    groupMap,
    containerCellMap,
    nodeLayout,
    containerGap
  );
  return { groupMap };
}

function processSortedGroups(
  sortedGroupIds: string[],
  containerGroup: Record<string, Omit<Cell, "DecoratorCell">[]>,
  containerCellMap: Map<string, DecoratorCell>,
  nodeLayout: string,
  containerGap: number
) {
  let currentContainerGap = containerGap;
  sortedGroupIds.forEach((groupId) => {
    const groupCell = containerCellMap.get(groupId)!;
    const groupedCells = containerGroup[groupId] as Cell[];
    const nodeCells = groupedCells.filter(
      (cell) => cell.type === "node"
    ) as NodeCell[];

    currentContainerGap += +(GROUPPADDING + CONTAINERGAP * 2); //加上容器的间距,分组间距后面会在initialContainerLayout调整减掉一个GROUPPADDING

    let nodeViews: (NodeCell | DecoratorCell)[] = [];
    if (nodeLayout === "dagre") {
      const { getNodeView } = dagreLayout({ cells: nodeCells });
      nodeViews = nodeCells.map((node: NodeCell) => {
        if (isNoPoint(node.view)) {
          const view = getNodeView(node.id);
          node.view = {
            ...node.view,
            x: view.x,
            y: view.y + currentContainerGap,
            width: view.width,
            height: view.height,
          };
        }
        return node;
      });
    } else if (nodeLayout === "staggered") {
      nodeViews = staggeredLayout(nodeCells, {
        offsetY: currentContainerGap,
      });
    }

    const containerRect = computeBoundingBox(nodeViews as BaseNodeCell[], {
      padding: GROUPPADDING,
    });
    groupCell.view = { ...groupCell.view, ...containerRect };
    currentContainerGap += get(containerRect, "height", 0) + CONTAINERGAP;
  });
  return {
    updatedGap: currentContainerGap,
  };
}

export function highlightGroupCell(
  cell: DecoratorCell,
  activeTarget: ActiveTarget | null | undefined,
  cells: Cell[]
) {
  let activeTargetCells = [],
    active = false;
  // istanbul ignore next
  if (activeTarget?.type === "multi") {
    activeTargetCells = activeTarget.targets;
  } else if (activeTarget?.type === "node") {
    activeTargetCells.push(activeTarget);
  } else if (activeTarget?.type === "decorator") {
    active = activeTarget.id === cell.id;
    return active;
  }
  active = activeTargetCells.some(
    (item) =>
      item?.type === "node" &&
      (cells.find((c) => isNodeCell(c) && c.id === item.id) as NodeCell)
        ?.groupId === cell.id
  );
  return active;
}
