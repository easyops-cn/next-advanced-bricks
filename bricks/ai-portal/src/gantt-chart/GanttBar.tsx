import React, { useEffect, useMemo, useRef, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";
import {
  BAR_HEIGHT,
  CONTAINER_BAR_OFFSET,
  CONTAINER_BAR_HEIGHT,
} from "./constants";

export function GanttBar() {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const container = ref.current?.parentElement;
    // istanbul ignore next: defensive
    if (!container) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          // istanbul ignore next: compatibility
          const currentInlineSize = entry.contentBoxSize
            ? entry.contentBoxSize[0]
              ? entry.contentBoxSize[0].inlineSize
              : (entry.contentBoxSize as unknown as ResizeObserverSize)
                  .inlineSize
            : entry.contentRect.width;
          setWidth(currentInlineSize);
        }
      }
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  const pathD = useMemo(() => {
    if (width <= 0) {
      return null;
    }
    const radius = CONTAINER_BAR_OFFSET;
    const w = Math.max(width, CONTAINER_BAR_OFFSET * 2);
    return `M0,${radius}
      A${radius},${radius} 0 0 1 ${radius},0
      L${w - radius},0
      A${radius},${radius} 0 0 1 ${w},${radius}
      L${w},${CONTAINER_BAR_HEIGHT}
      A${radius},${radius} 0 0 0 ${w - radius},${BAR_HEIGHT}
      L${radius},${BAR_HEIGHT}
      A${radius},${radius} 0 0 0 0,${CONTAINER_BAR_HEIGHT}
      Z`;
  }, [width]);

  return (
    <svg ref={ref} width={width} height={CONTAINER_BAR_HEIGHT}>
      {pathD && <path d={pathD} />}
    </svg>
  );
}
