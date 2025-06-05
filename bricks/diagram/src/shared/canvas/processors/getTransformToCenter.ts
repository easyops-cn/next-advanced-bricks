import type {
  FullRectTuple,
  TransformLiteral,
} from "../../../diagram/interfaces";
import type { CellsRect } from "../../../draw-canvas/interfaces";

export interface TransformToCenterOptions {
  canvasWidth: number;
  canvasHeight: number;
  canvasPadding?: FullRectTuple | null;
  scaleRange?: [min: number, max: number];
}

export function getTransformToCenter(
  rect: CellsRect,
  {
    canvasWidth,
    canvasHeight,
    canvasPadding,
    scaleRange,
  }: TransformToCenterOptions
): TransformLiteral {
  const { left, top, width, height, empty } = rect;

  // Apply padding to available canvas dimensions
  const [paddingTop, paddingRight, paddingBottom, paddingLeft] =
    canvasPadding ?? [0, 0, 0, 0];
  const availableWidth = canvasWidth - paddingLeft - paddingRight;
  const availableHeight = canvasHeight - paddingTop - paddingBottom;

  const scale =
    scaleRange && !empty && (width > availableWidth || height > availableHeight)
      ? Math.max(
          Math.min(
            availableWidth / width,
            availableHeight / height,
            scaleRange[1]
          ),
          scaleRange[0]
        )
      : 1;

  // Adjust center calculation to account for padding
  const x = empty
    ? 0
    : (availableWidth - width * scale) / 2 + paddingLeft - left * scale;
  const y = empty
    ? 0
    : (availableHeight - height * scale) / 2 + paddingTop - top * scale;

  return { x, y, k: scale };
}
