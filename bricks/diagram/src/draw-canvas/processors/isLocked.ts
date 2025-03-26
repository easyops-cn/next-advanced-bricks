import type { Cell, DecoratorCell } from "../interfaces";
import { isContainerDecoratorCell, isNodeCell } from "./asserts";

export function getLockedContainerIds(cells: Cell[]): string[] {
  const lockedContainers = cells.filter(
    (cell) => cell.view?.locked && isContainerDecoratorCell(cell)
  ) as DecoratorCell[];
  return lockedContainers.map((cell) => cell.id);
}

export function isLocked(
  cell: Cell,
  lockedContainerIds: string[] | undefined
): boolean {
  return (
    cell.view?.locked ||
    !!(
      isNodeCell(cell) &&
      cell.containerId &&
      lockedContainerIds?.includes(cell.containerId)
    )
  );
}
