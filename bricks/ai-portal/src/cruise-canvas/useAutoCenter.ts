import { useEffect, useRef, useState, type RefObject } from "react";
import { ZoomTransform, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import type { GraphNode } from "./interfaces";
import { CANVAS_PADDING_BOTTOM } from "./constants";

export interface UseAutoCenterOptions {
  nodes: GraphNode[];
  sizeReady: boolean;
  zoomer: ZoomBehavior<HTMLDivElement, unknown>;
  rootRef: RefObject<HTMLDivElement>;
}

export function useAutoCenter({
  nodes,
  sizeReady,
  zoomer,
  rootRef,
}: UseAutoCenterOptions) {
  const [centered, setCentered] = useState(false);
  const reCenterRef = useRef(false);

  // Transform to horizontal center once.
  useEffect(() => {
    const root = rootRef.current;
    if (sizeReady && root && !centered && nodes.length > 0) {
      let left = Infinity;
      let right = -Infinity;
      let top = Infinity;
      let bottom = -Infinity;

      for (const node of nodes) {
        const view = node.view!;
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

      zoomer.transform(select(root), new ZoomTransform(1, x, y));
      setCentered(true);
    }

    reCenterRef.current = false;
  }, [centered, nodes, rootRef, sizeReady, zoomer]);

  return { centered, setCentered, reCenterRef };
}
