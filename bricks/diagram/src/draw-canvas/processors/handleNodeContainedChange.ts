import { Cell, DecoratorCell, NodeCell } from "../interfaces";
import { MoveCellPayload } from "../reducers/interfaces";
import { isContainerDecoratorCell, isNodeCell } from "./asserts";

export function handleNodeContainedChange(
  payloads: MoveCellPayload[],
  cells: Cell[],
  onContainerContainerChange?: (detail: MoveCellPayload[]) => void
) {
  const nodeCells = cells.filter((c): c is NodeCell => isNodeCell(c));
  const containerIds = payloads
    .filter((p) => isContainerDecoratorCell(p))
    .map((v) => v.id);
  const nodePayloads = payloads.filter((p) => {
    const nodeCell = nodeCells.find((v) => v.id === p.id)!;
    const includeNodeFlag =
      nodeCell?.containerId && containerIds.includes(nodeCell.containerId);
    return isNodeCell(p) && !includeNodeFlag;
  });
  nodePayloads.forEach((payload) => {
    const left = payload.x;
    const right = payload.x + payload.width!;
    const top = payload.y;
    const bottom = payload.y + payload!.height!;
    const containerDecoratorCells = cells.filter(
      (cell): cell is DecoratorCell =>
        isContainerDecoratorCell(cell) && !cell.view?.locked
    );
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
        payload.containerCell = containerCell;
        break; //A node can be associated with only one container
      }
    }
  });
  let containedChanges = [];
  containedChanges = nodePayloads.filter((payload) => {
    const nodeCell = nodeCells.find((c) => c.id === payload.id);
    const containerId = nodeCell?.containerId;
    const containerCellId = payload.containerCell?.id;
    //过滤掉一直没有combo关系或者combo关系没有改变的
    return containerId !== containerCellId;
  });
  if (containedChanges.length > 0) {
    onContainerContainerChange?.(containedChanges);
  }
  return containedChanges;
}
