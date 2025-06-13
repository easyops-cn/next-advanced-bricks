// istanbul ignore file: hard to test with d3-zoom
import React, { useEffect, useMemo, useRef, useState } from "react";
import { select } from "d3-selection";
import { zoom, type ZoomBehavior } from "d3-zoom";
import type {
  RangeTuple,
  TransformLiteral /* , ActiveTarget */,
} from "./interfaces";
import { DEFAULT_SCALE_RANGE_MIN, DEFAULT_SCALE_RANGE_MAX } from "./constants";
// import type { ActiveTarget } from "./interfaces";
import jobStyles from "./NodeJob/NodeJob.module.css";

export interface UseZoomOptions {
  rootRef: React.RefObject<HTMLDivElement>;
  zoomable?: boolean;
  scrollable?: boolean;
  pannable?: boolean;
  pannableWithCtrl?: boolean;
  scaleRange?: RangeTuple;
  onSwitchActiveTarget?(target: unknown | null): void;
}

export interface UseZoomResult {
  grabbing: boolean;
  transform: TransformLiteral;
  transformRef: React.MutableRefObject<TransformLiteral>;
  scaleRange: RangeTuple;
  zoomer: ZoomBehavior<HTMLDivElement, unknown>;
}

// istanbul ignore next
const isMac = /mac/i.test(
  (
    navigator as Navigator & {
      userAgentData?: {
        platform: string;
      };
    }
  ).userAgentData?.platform ??
    navigator.platform ??
    navigator.userAgent
);

// istanbul ignore next
function wheelData(event: WheelEvent) {
  // On Windows with normal mouse, deltaY is too big when scroll with ctrlKey pressed,
  // which cause the zooming too fast.
  // While on mac OS, we need to keep default behavior of d3-zoom.
  return (
    -event.deltaY *
    (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 0.002) *
    (event.ctrlKey && isMac ? 10 : 1)
  );
}

export function useZoom({
  rootRef,
  zoomable,
  scrollable,
  pannable,
  pannableWithCtrl,
  scaleRange: _scaleRange,
  onSwitchActiveTarget,
}: UseZoomOptions): UseZoomResult {
  const [grabbing, setGrabbing] = useState(false);
  const [transform, setTransform] = useState<TransformLiteral>({
    k: 1,
    x: 0,
    y: 0,
  });
  const transformRef = useRef(transform);

  const scaleRange = useMemo(
    () =>
      _scaleRange ??
      ([DEFAULT_SCALE_RANGE_MIN, DEFAULT_SCALE_RANGE_MAX] as RangeTuple),
    [_scaleRange]
  );

  const zoomer = useMemo(
    () => zoom<HTMLDivElement, unknown>().wheelDelta(wheelData),
    []
  );

  // istanbul ignore next: d3-zoom currently hard to test
  useEffect(() => {
    let moved = false;
    zoomer
      .scaleExtent(zoomable ? scaleRange : [1, 1])
      .on("start", () => {
        moved = false;
        setGrabbing(true);
      })
      .on("zoom", (e: { transform: TransformLiteral }) => {
        moved = true;
        setTransform(e.transform);
        transformRef.current = e.transform;
      })
      .on("end", () => {
        setGrabbing(false);
        if (!moved) {
          onSwitchActiveTarget?.(null);
        }
      })
      .filter(
        (event) =>
          // For wheel event, ignore d3 default behavior, because we control it manually.
          // Except for the trackpad pinch event on Mac OS (with ctrlKey).
          (event.type === "wheel"
            ? event.ctrlKey
            : pannableWithCtrl
              ? pannable || event.ctrlKey
              : !event.ctrlKey) && !event.button
      );
  }, [
    onSwitchActiveTarget,
    scaleRange,
    zoomable,
    zoomer,
    pannableWithCtrl,
    pannable,
  ]);

  useEffect(() => {
    if (pannableWithCtrl) {
      const onContextMenu = (e: MouseEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      };
      document.addEventListener("contextmenu", onContextMenu, true);
      return () => {
        document.removeEventListener("contextmenu", onContextMenu, true);
      };
    }
  }, [pannableWithCtrl]);

  // istanbul ignore next: d3-zoom currently hard to test
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const rootSelection = select(root);

    const unsetZoom = () => {
      rootSelection
        .on(".zoom", null)
        .on(".zoom.custom", null)
        .on("wheel", null);
    };

    if (!(zoomable || scrollable || pannable)) {
      unsetZoom();
      return;
    }

    if (zoomable || scrollable) {
      // Do not override default d3 zoom handler.
      // Only handles *panning*
      rootSelection.on(
        "wheel.zoom.custom",
        (e: WheelEvent & { wheelDeltaX: number; wheelDeltaY: number }) => {
          // Mac OS trackpad pinch event is emitted as a wheel.zoom and d3.event.ctrlKey set to true
          if (!e.ctrlKey && scrollable) {
            const pre = (e.target as HTMLElement)!.closest(
              'pre[class*="language-"]'
            );
            if (pre) {
              if (checkScrollableX(pre, e.deltaX)) {
                return;
              }
            }

            const node = (e.target as HTMLElement)!.closest(
              `.${jobStyles.body}`
            );
            if (node) {
              if (checkScrollableY(node, e.deltaY)) {
                return;
              }
            }

            if (e.cancelable) {
              e.preventDefault();
              zoomer.translateBy(
                rootSelection,
                e.wheelDeltaX / 5,
                e.wheelDeltaY / 5
              );
            }
          }
          // zoomer.scaleBy(rootSelection, Math.pow(2, defaultWheelDelta(e)))
        }
      );
    }

    rootSelection
      .call(zoomer)
      .on("wheel", (e: WheelEvent) => {
        if (scrollable || (zoomable && e.ctrlKey)) {
          e.preventDefault();
        }
      })
      .on("dblclick.zoom", null);

    if (!pannable && !pannableWithCtrl) {
      rootSelection.on("mousedown.zoom", null);
    }

    if (!pannable) {
      rootSelection
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);
    }

    return unsetZoom;
  }, [pannableWithCtrl, pannable, rootRef, scrollable, zoomable, zoomer]);

  return { grabbing, transform, transformRef, zoomer, scaleRange };
}

// 检查元素是否还能滚动
function checkScrollableY(element: Element, delta: number) {
  if (!delta) {
    return false;
  }
  const isScrollingDown = delta > 0;
  // 还能向下滚动 或 还能向上滚动
  if (isScrollingDown) {
    const maxScroll = element.scrollHeight - element.clientHeight;
    return element.scrollTop <= maxScroll - 1;
  }
  return element.scrollTop >= 1;
}

// 检查元素是否还能滚动
function checkScrollableX(element: Element, delta: number) {
  if (!delta) {
    return false;
  }
  const isScrollingRight = delta > 0; // Updated variable name for clarity
  // 还能向右滚动 或 还能向左滚动
  if (isScrollingRight) {
    const maxScroll = element.scrollWidth - element.clientWidth; // Changed to scrollWidth and clientWidth
    return element.scrollLeft <= maxScroll - 1; // Changed to scrollLeft
  }
  return element.scrollLeft >= 1;
}
