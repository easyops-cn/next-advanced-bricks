import { Cell, DecoratorCell, NodeCell } from "../interfaces";
import { MoveCellPayload } from "../reducers/interfaces";
import {
  isContainerDecoratorCell,
  isGroupDecoratorCell,
  isNodeCell,
} from "./asserts";

export function handleNodeContainedChange(
  payloads: MoveCellPayload[],
  cells: Cell[],
  onContainerContainerChange?: (detail: MoveCellPayload[]) => void
) {
  const nodeAndGroupCells = cells.filter(
    (c): c is NodeCell => isNodeCell(c) || isGroupDecoratorCell(c)
  );
  const containerIds = payloads
    .filter((p) => isContainerDecoratorCell(p))
    .map((v) => v.id);
  const cellPayloads = payloads.filter((p) => {
    const cell = nodeAndGroupCells.find((v) => v.id === p.id)!;
    const includeNodeFlag =
      cell?.containerId && containerIds.includes(cell.containerId);
    return (
      ((isNodeCell(p) && !p.groupId) || isGroupDecoratorCell(p)) &&
      !includeNodeFlag
    );
  });
  const containerDecoratorCells = cells.filter(
    (cell): cell is DecoratorCell =>
      isContainerDecoratorCell(cell) && !cell.view?.locked
  );
  cellPayloads.forEach((payload) => {
    const left = payload.x;
    const right = payload.x + payload.width!;
    const top = payload.y;
    const bottom = payload.y + payload!.height!;

    for (const containerCell of containerDecoratorCells) {
      const containerLeft = containerCell.view.x;
      const containerRight = containerCell.view.x + containerCell.view.width;
      const containerTop = containerCell.view.y;
      const containerBottom = containerCell.view.y + containerCell.view.height;
      if (
        left >= containerLeft &&
        right <= containerRight &&
        top >= containerTop &&
        bottom <= containerBottom
      ) {
        payload.containerId = containerCell.id;
        break; //A node can be associated with only one container
      }
    }
  });
  let containedChanges = [];
  containedChanges = cellPayloads.filter((payload) => {
    const cell = nodeAndGroupCells.find((c) => c.id === payload.id);
    const containerId = cell?.containerId;
    const containerCellId = payload.containerId;
    //过滤掉一直没有关系或者关系没有改变的
    return containerId !== containerCellId;
  });
  if (containedChanges.length > 0) {
    onContainerContainerChange?.(containedChanges);
  }
  return containedChanges;
}
