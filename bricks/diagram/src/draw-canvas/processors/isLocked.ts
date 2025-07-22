import type { Cell, DecoratorCell } from "../interfaces";
import {
  isContainerDecoratorCell,
  isGroupDecoratorCell,
  isNodeCell,
} from "./asserts";

export function getLockedContainerIds(cells: Cell[]): string[] {
  const lockeds = cells.filter(
    (cell) =>
      (cell.view?.locked && isContainerDecoratorCell(cell)) ||
      (cell.view?.locked && isGroupDecoratorCell(cell))
  ) as DecoratorCell[];
  return lockeds.map((cell) => cell.id);
}

export function isLocked(cell: Cell, lockeds: string[] | undefined): boolean {
  return (
    cell.view?.locked ||
    !!(
      (isNodeCell(cell) || isGroupDecoratorCell(cell)) &&
      cell.containerId &&
      lockeds?.includes(cell.containerId)
    ) ||
    !!(isNodeCell(cell) && cell.groupId && lockeds?.includes(cell.groupId))
  );
}
