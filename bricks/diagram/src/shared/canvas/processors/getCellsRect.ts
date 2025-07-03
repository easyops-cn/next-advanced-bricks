import { mergeRects, type Rect } from "@next-shared/diagram";
import type { Cell, CellsRect } from "../../../draw-canvas/interfaces";
import { isEdgeCell } from "../../../draw-canvas/processors/asserts";

export function getCellsRect(cells: Cell[]): CellsRect {
  const rects: Rect[] = [];
  let empty = true;
  for (const cell of cells) {
    if (!isEdgeCell(cell)) {
      empty = false;
      rects.push(cell.view);
    }
  }
  const { x: left, y: top, width, height } = mergeRects(rects);
  return { left, top, width, height, empty };
}
