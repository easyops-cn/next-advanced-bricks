import React, { useEffect } from "react";
import type { BasicDecoratorProps } from "../interfaces";
import { handleMouseDown } from "../processors/handleMouseDown";
import { isNoManualLayout } from "../processors/asserts";

export type DecoratorRectProps = Omit<
  BasicDecoratorProps,
  "lineConfMap" | "editableLineMap"
>;

export function DecoratorRect({
  cell,
  transform,
  readOnly,
  layout,
  view,
  activeTarget,
  cells,
  onCellResizing,
  onCellResized,
  onSwitchActiveTarget,
}: DecoratorRectProps): JSX.Element {
  const resizeHandleRef = React.useRef<SVGGElement>(null);

  useEffect(() => {
    const resizeHandle = resizeHandleRef.current;
    if (!resizeHandle || readOnly) {
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      handleMouseDown(event, {
        action: "resize",
        cell,
        scale: transform.k,
        layout,
        activeTarget,
        cells,
        onCellResizing,
        onCellResized,
        onSwitchActiveTarget,
      });
    };
    resizeHandle.addEventListener("mousedown", onMouseDown);
    return () => {
      resizeHandle.removeEventListener("mousedown", onMouseDown);
    };
  }, [
    activeTarget,
    cell,
    cells,
    onCellResized,
    onCellResizing,
    onSwitchActiveTarget,
    readOnly,
    transform.k,
    layout,
  ]);

  return (
    <g className="decorator-rect-container">
      <rect
        width={view.width}
        height={view.height}
        className="rect-container"
      />
      {!readOnly && !isNoManualLayout(layout) && (
        <g
          ref={resizeHandleRef}
          className="resize-handle"
          transform={`translate(${view.width - 20} ${view.height - 20})`}
        >
          <rect width={20} height={20} />
          <path d="M10 18L18 10 M15 18L18 15" />
        </g>
      )}
    </g>
  );
}
