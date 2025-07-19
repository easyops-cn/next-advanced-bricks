import { useEffect, useRef, useState, type RefObject } from "react";
import type { ZoomBehavior } from "d3-zoom";
import { mergeRects } from "@next-shared/diagram";
import type { GraphNode, ZoomAction } from "./interfaces";
import { CANVAS_PADDING_BOTTOM } from "./constants";

export interface UseAutoCenterOptions {
  nodes: GraphNode[];
  sizeReady: boolean;
  zoomer: ZoomBehavior<HTMLDivElement, unknown>;
  rootRef: RefObject<HTMLDivElement>;
  pushZoomTransition: (action: ZoomAction) => void;
}

export function useAutoCenter({
  nodes,
  sizeReady,
  zoomer,
  rootRef,
  pushZoomTransition,
}: UseAutoCenterOptions) {
  const [centered, setCentered] = useState(false);
  const reCenterRef = useRef(false);

  // Transform to horizontal center once.
  useEffect(() => {
    const root = rootRef.current;
    if (sizeReady && root && !centered && nodes.length > 0) {
      const {
        x: left,
        y: top,
        width,
        height,
      } = mergeRects(nodes.map((node) => node.view!));
      const right = left + width;
      const bottom = top + height;

      const x = (root.clientWidth - (right + left)) / 2;
      let y = 30;
      if (reCenterRef.current) {
        const height = bottom - top + CANVAS_PADDING_BOTTOM;
        const diffY = height - root.clientHeight;
        if (diffY > 0) {
          y = -diffY - top;
        } else {
          y = (root.clientHeight - (bottom + top)) / 2;
        }
      }
      pushZoomTransition({
        transform: { k: 1, x, y },
        duration: reCenterRef.current ? undefined : 0,
      });
      setCentered(true);
    }

    reCenterRef.current = false;
  }, [centered, nodes, rootRef, sizeReady, zoomer, pushZoomTransition]);

  return { centered, setCentered, reCenterRef };
}
