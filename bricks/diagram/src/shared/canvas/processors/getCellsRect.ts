import type { Cell, CellsRect } from "../../../draw-canvas/interfaces";
import { isEdgeCell } from "../../../draw-canvas/processors/asserts";

export function getCellsRect(cells: Cell[]): CellsRect {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let empty = true;
  for (const cell of cells) {
    if (!isEdgeCell(cell)) {
      empty = false;
      const { view } = cell;
      const r = view.x + view.width;
      const b = view.y + view.height;
      if (view.x < left) {
        left = view.x;
      }
      if (r > right) {
        right = r;
      }
      if (view.y < top) {
        top = view.y;
      }
      if (b > bottom) {
        bottom = b;
      }
    }
  }

  const width = right - left;
  const height = bottom - top;

  return { left, top, width, height, empty };
}
