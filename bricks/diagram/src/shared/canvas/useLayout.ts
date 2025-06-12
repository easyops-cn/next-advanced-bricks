import { useCallback, useEffect, useRef, useState } from "react";
import type { ZoomBehavior } from "d3-zoom";
import type {
  Cell,
  LayoutOptions,
  LayoutOptionsForce,
  LayoutOptionsDagre,
  LayoutType,
  NodeId,
  NodeView,
  AutoSize,
} from "../../draw-canvas/interfaces";
import type { FullRectTuple, RangeTuple } from "../../diagram/interfaces";
import { useAutoCenter } from "./useAutoCenter";
import {
  isNodeCell,
  isNodeOrAreaDecoratorCell,
  isNodeOrEdgeCell,
} from "../../draw-canvas/processors/asserts";
import {
  SYMBOL_FOR_LAYOUT_INITIALIZED,
  SYMBOL_FOR_SIZE_INITIALIZED,
} from "../../draw-canvas/constants";
import type { DrawCanvasAction } from "../../draw-canvas/reducers/interfaces";
import { forceLayout } from "./forceLayout";
import { dagreLayout } from "./dagreLayout";
import { normalizeAlignOrigin } from "../../draw-canvas/processors/normalizeAlignOrigin";

export interface UseLayoutOptions {
  layout: LayoutType;
  layoutOptions?: LayoutOptions;
  autoSize?: AutoSize;
  rootRef: React.RefObject<SVGSVGElement>;
  cells: Cell[];
  zoomable?: boolean;
  zoomer: ZoomBehavior<SVGSVGElement, unknown>;
  scaleRange: RangeTuple;
  layoutKey: number;
  allowEdgeToArea?: boolean;
  autoCenterWhenCellsChange?: boolean;
  dispatch: (value: DrawCanvasAction) => void;
}

export function useLayout({
  layout,
  layoutOptions,
  autoSize,
  rootRef,
  cells,
  zoomable,
  zoomer,
  scaleRange,
  layoutKey,
  allowEdgeToArea,
  autoCenterWhenCellsChange,
  dispatch,
}: UseLayoutOptions) {
  const [layoutInitialized, setLayoutInitialized] = useState(
    layout !== "force" && layout !== "dagre"
  );

  const layoutKeyRef = useRef(layoutKey);

  const getNextLayoutKey = useCallback(() => {
    return ++layoutKeyRef.current;
  }, []);

  const [centered, setCentered] = useAutoCenter({
    rootRef,
    layoutInitialized,
    cells,
    zoomable,
    zoomer,
    scaleRange,
    autoCenterWhenCellsChange,
    autoSize,
    padding: layoutOptions?.padding,
  });

  const previousLayoutRef = useRef<Cell[] | null>(null);

  useEffect(() => {
    // Wait for all nodes to be size-initialized before layout.
    if (
      cells.some(
        (cell) => isNodeCell(cell) && !cell[SYMBOL_FOR_SIZE_INITIALIZED]
      ) ||
      // Skip layout if no cells.
      cells.length === 0
    ) {
      return;
    }

    if (layout !== "force" && layout !== "dagre") {
      setLayoutInitialized(true);
      return;
    }

    // DO NOT re-layout if layout key mismatched.
    // DO NOT re-layout if nodes and edges not changed.
    if (
      layoutKeyRef.current !== layoutKey ||
      isSameArray(previousLayoutRef.current, cells.filter(isNodeOrEdgeCell))
    ) {
      // Layout key mismatch happens when this effect is performed after
      // update-node-size dispatched but not yet applied.
      // If didn't ignore mismatched layout, it will cause the update-cells
      // action overwrites those update-node-size actions.
      return;
    }

    let getNodeView: (id: NodeId) => NodeView;
    let nodePaddings: FullRectTuple;

    if (layout === "force") {
      ({ getNodeView, nodePaddings } = forceLayout({
        cells,
        layoutOptions: layoutOptions as LayoutOptionsForce,
        allowEdgeToArea,
      }));
    } else {
      ({ getNodeView, nodePaddings } = dagreLayout({
        cells,
        layoutOptions: layoutOptions as LayoutOptionsDagre,
        allowEdgeToArea,
      }));
    }

    const alignOrigin = normalizeAlignOrigin(
      (layoutOptions as LayoutOptionsForce | LayoutOptionsDagre)?.alignOrigin
    );

    const newCells: Cell[] = cells.map((cell) => {
      if (
        (allowEdgeToArea && isNodeOrAreaDecoratorCell(cell)) ||
        isNodeCell(cell)
      ) {
        const nodeView = getNodeView(cell.id);
        return {
          ...cell,
          view: {
            ...cell.view,
            x: nodeView.x! - nodeView.width * alignOrigin[0] + nodePaddings[3],
            y: nodeView.y! - nodeView.height * alignOrigin[1] + nodePaddings[0],
          },
          [SYMBOL_FOR_LAYOUT_INITIALIZED]: true,
        };
      }
      return cell;
    });
    previousLayoutRef.current = newCells.filter(isNodeOrEdgeCell);

    dispatch({ type: "update-cells", payload: newCells });
    // setCentered(false);
    setLayoutInitialized(true);
  }, [
    cells,
    dispatch,
    layout,
    layoutKey,
    layoutOptions,
    allowEdgeToArea /* , setCentered */,
  ]);

  return { centered, setCentered, getNextLayoutKey };
}

function isSameArray<T = unknown>(a: T[] | null, b: T[]): boolean {
  return a?.length === b.length && a.every((v, i) => v === b[i]);
}
