import React, { useCallback, useMemo, useRef } from "react";
import type { BasicDecoratorProps } from "../interfaces";
import { getMarkers } from "../../shared/canvas/useLineMarkers";
import type { LineMarkerConf } from "../../diagram/interfaces";
import { curveLine } from "../../diagram/lines/curveLine";

export function DecoratorLine({
  cell,
  active,
  lineConfMap,
  editableLineMap,
}: BasicDecoratorProps): JSX.Element | null {
  // const view = cell.view as DecoratorLineView;
  // const line = view.source && view.target ? `M${view.source.x},${view.source.y}L${view.target.x},${view.target.y}` : "";
  const lineConf = lineConfMap.get(cell)!;
  const { points: linePoints } = editableLineMap.get(cell) ?? {};

  const line = useMemo(() => {
    return curveLine(
      linePoints,
      lineConf.type === "curve" ? lineConf.curveType : "curveLinear",
      0,
      1
    );
  }, [lineConf, linePoints]);

  const pathRef = useRef<SVGPathElement | null>(null);
  const pathRefCallback = useCallback(
    (element: SVGPathElement | null) => {
      pathRef.current = element;
      // Jest does not support `SVGPathElement::getBBox`
      if (element && process.env.NODE_ENV !== "test") {
        const rect = element.getBBox();
        cell.view = {
          ...cell.view,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        };
      }
    },
    [cell]
  );

  if (!lineConf) {
    return null;
  }

  let markerStart: string | undefined;
  let markerEnd: string | undefined;
  let strokeColor: string | undefined;
  let strokeWidth: number | undefined;
  const lineMarkers: LineMarkerConf[] = getMarkers(lineConf);
  if (active) {
    const overrides = lineConf.overrides?.active;
    strokeColor = overrides?.strokeColor ?? lineConf.strokeColor;
    strokeWidth = overrides?.strokeWidth ?? lineConf.strokeWidth;
    // motion = overrides?.motion;
    for (const marker of lineMarkers) {
      if (marker.placement === "start") {
        markerStart =
          lineConf.$activeMarkerStartUrl ?? lineConf.$markerStartUrl;
      } else {
        markerEnd = lineConf.$activeMarkerEndUrl ?? lineConf.$markerEndUrl;
      }
    }
  } else {
    strokeColor = lineConf.strokeColor;
    strokeWidth = lineConf.strokeWidth;
    for (const marker of lineMarkers) {
      if (marker.placement === "start") {
        markerStart = lineConf.$markerStartUrl;
      } else {
        markerEnd = lineConf.$markerEndUrl;
      }
    }
  }

  return (
    <g className="decorator-line">
      <path
        // This `path` is made for expanding interaction area of graph lines.
        d={line}
        fill="none"
        stroke="transparent"
        strokeWidth={lineConf.interactStrokeWidth}
      />
      <path
        // className="decorator-line-path"
        ref={pathRefCallback}
        d={line}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        markerStart={markerStart}
        markerEnd={markerEnd}
      />
    </g>
  );
}
