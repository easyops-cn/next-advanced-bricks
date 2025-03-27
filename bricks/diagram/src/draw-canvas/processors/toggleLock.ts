import type { ActiveTarget, Cell } from "../interfaces";
import { isNodeCell } from "./asserts";
import { targetIsActive } from "./targetIsActive";

export function toggleLock(
  target: ActiveTarget,
  type: "toggle" | "lock" | "unlock",
  cells: Cell[],
  lockedContainerIds: string[]
): { newCells: Cell[] | null; updates: Cell[] } {
  const previousLocked: Cell[] = [];
  const previousUnlocked: Cell[] = [];
  for (const cell of cells) {
    if (targetIsActive(cell, target)) {
      // 如果容器已锁定，禁止其子节点的锁定状态改变
      if (
        isNodeCell(cell) &&
        cell.containerId &&
        lockedContainerIds.includes(cell.containerId)
      ) {
        continue;
      }
      (cell.view?.locked ? previousLocked : previousUnlocked).push(cell);
    }
  }

  let newCells: Cell[] | null = null;
  const updates: Cell[] = [];

  if (type !== "unlock" && previousUnlocked.length > 0) {
    // Lock all unlocked targets
    newCells = cells.map((cell) => {
      if (previousUnlocked.includes(cell)) {
        const update = {
          ...cell,
          view: { ...cell.view, locked: true },
        } as Cell;
        updates.push(update);
        return update;
      }
      return cell;
    });
  } else if (type !== "lock" && previousLocked.length > 0) {
    // Unlock all locked targets
    newCells = cells.map((cell) => {
      if (previousLocked.includes(cell)) {
        const update = {
          ...cell,
          view: { ...cell.view, locked: false },
        } as Cell;
        updates.push(update);
        return update;
      }
      return cell;
    });
  }

  return { newCells, updates };
}
