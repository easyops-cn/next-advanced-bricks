import React, { useEffect, useState } from "react";
import { select } from "d3-selection";
import { ZoomTransform, type ZoomBehavior } from "d3-zoom";
import type { PartialRectTuple, RangeTuple } from "../../diagram/interfaces";
import {
  DEFAULT_CANVAS_PADDING,
  SYMBOL_FOR_SIZE_INITIALIZED,
} from "../../draw-canvas/constants";
import type { AutoSize, Cell } from "../../draw-canvas/interfaces";
import {
  isDecoratorCell,
  isNodeCell,
} from "../../draw-canvas/processors/asserts";
import { getCellsRect } from "./processors/getCellsRect";
import { extractPartialRectTuple } from "../../diagram/processors/extractPartialRectTuple";
import { getTransformToCenter } from "./processors/getTransformToCenter";

export interface UseAutoCenterOptions {
  rootRef: React.RefObject<SVGSVGElement>;
  cells: Cell[];
  layoutInitialized: boolean;
  zoomable?: boolean;
  zoomer: ZoomBehavior<SVGSVGElement, unknown>;
  scaleRange: RangeTuple;
  autoCenterWhenCellsChange?: boolean;
  autoSize?: AutoSize;
  padding?: PartialRectTuple;
}

export type UseAutoCenterResult = [
  centered: boolean,
  setCentered: React.Dispatch<React.SetStateAction<boolean>>,
];

export function useAutoCenter({
  rootRef,
  cells,
  layoutInitialized,
  zoomable,
  zoomer,
  scaleRange,
  autoCenterWhenCellsChange,
  autoSize,
  padding,
}: UseAutoCenterOptions): UseAutoCenterResult {
  const [centered, setCentered] = useState(false);

  useEffect(() => {
    // Reset auto centering when nodes and decorators are all removed,
    // or when cells change and autoCenterWhenCellsChange is enabled.
    if (
      !cells.some((cell) => isNodeCell(cell) || isDecoratorCell(cell)) ||
      autoCenterWhenCellsChange
    ) {
      setCentered(false);
    }
  }, [cells, autoCenterWhenCellsChange]);

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      !layoutInitialized ||
      centered ||
      !cells.some((cell) => isNodeCell(cell) || isDecoratorCell(cell)) ||
      cells.some(
        (cell) => isNodeCell(cell) && !cell[SYMBOL_FOR_SIZE_INITIALIZED]
      )
    ) {
      return;
    }

    const rect = getCellsRect(cells);
    let width = root.clientWidth;
    let height = root.clientHeight;
    const fitWidth = !!autoSize?.width;
    const fitHeight = !!autoSize?.height;
    const fullPadding = extractPartialRectTuple(
      padding ?? DEFAULT_CANVAS_PADDING
    );

    // Todo: handle ratio
    if (fitWidth) {
      width = Math.min(
        Math.max(
          rect.width + fullPadding![1] + fullPadding![3],
          autoSize.minWidth ?? 0
        ),
        autoSize.maxWidth ?? Infinity
      );
      root.style.minWidth = `${width}px`;
    }
    if (fitHeight) {
      height = Math.min(
        Math.max(
          rect.height + fullPadding![0] + fullPadding![2],
          autoSize.minHeight ?? 0
        ),
        autoSize.maxHeight ?? Infinity
      );
      root.style.minHeight = `${height}px`;
    }

    const { k, x, y } = getTransformToCenter(rect, {
      canvasWidth: width,
      canvasHeight: height,
      canvasPadding: fullPadding,
      scaleRange: zoomable ? scaleRange : undefined,
    });
    // istanbul ignore next
    if (process.env.NODE_ENV !== "test") {
      // jsdom doesn't support svg baseVal yet.
      // https://github.com/jsdom/jsdom/issues/2531
      zoomer.transform(select(root), new ZoomTransform(k, x, y));
    }
    setCentered(true);
  }, [
    cells,
    centered,
    layoutInitialized,
    rootRef,
    scaleRange,
    zoomable,
    zoomer,
    autoSize,
    padding,
  ]);

  return [centered, setCentered];
}
