import { mergeRects, type Rect } from "@next-shared/diagram";
import type { Cell, CellsRect } from "../../../draw-canvas/interfaces";
import {
  isEdgeCell,
  isNodeCell,
} from "../../../draw-canvas/processors/asserts";

export type CenterTarget = "all" | "nodes";

export function getCellsRect(
  cells: Cell[],
  centerTarget: CenterTarget = "all"
): CellsRect {
  const rects: Rect[] = [];
  let empty = true;
  for (const cell of cells) {
    if (!isEdgeCell(cell) && (centerTarget === "all" || isNodeCell(cell))) {
      empty = false;
      rects.push(cell.view);
    }
  }
  if (empty) {
    return { left: 0, top: 0, width: 0, height: 0, empty };
  }
  const { x: left, y: top, width, height } = mergeRects(rects);
  return { left, top, width, height, empty };
}
