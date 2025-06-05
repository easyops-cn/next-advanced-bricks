import type { TransformLiteral } from "../../diagram/interfaces";
import { getCellsRect } from "../../shared/canvas/processors/getCellsRect";
import {
  getTransformToCenter,
  type TransformToCenterOptions,
} from "../../shared/canvas/processors/getTransformToCenter";
import type { Cell } from "../interfaces";

export function transformToCenter(
  cells: Cell[],
  options: TransformToCenterOptions
): TransformLiteral {
  const rect = getCellsRect(cells);
  return getTransformToCenter(rect, options);
}
