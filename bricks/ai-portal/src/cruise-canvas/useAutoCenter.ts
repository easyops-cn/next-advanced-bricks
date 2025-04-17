import { useEffect, useState, type RefObject } from "react";
import { ZoomTransform, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import type { GraphNode } from "./interfaces";

export interface UseAutoCenterOptions {
  nodes: GraphNode[];
  sizeReady: boolean;
  zoomer: ZoomBehavior<HTMLElement, unknown>;
  rootRef: RefObject<HTMLElement>;
}

export function useAutoCenter({
  nodes,
  sizeReady,
  zoomer,
  rootRef,
}: UseAutoCenterOptions) {
  const [centered, setCentered] = useState(false);

  // Transform to horizontal center once.
  useEffect(() => {
    const root = rootRef.current;
    if (sizeReady && root && !centered && nodes.length > 0) {
      let left = Infinity;
      let right = -Infinity;

      for (const node of nodes) {
        const view = node.view!;
        const r = view.x + view.width;
        if (view.x < left) {
          left = view.x;
        }
        if (r > right) {
          right = r;
        }
      }

      const width = right - left;

      zoomer.transform(
        select(root as HTMLElement),
        new ZoomTransform(1, (root.clientWidth - width) / 2, 30)
      );
      setCentered(true);
    }
  }, [centered, nodes, rootRef, sizeReady, zoomer]);

  return centered;
}
