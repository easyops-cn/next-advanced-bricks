import React, { useEffect } from "react";
import type { BasicDecoratorProps } from "../interfaces";
import { handleMouseDown } from "../processors/handleMouseDown";
import { LockIcon } from "../LockIcon";

export function DecoratorArea({
  cell,
  transform,
  readOnly,
  layoutOptions,
  activeTarget,
  cells,
  locked,
  onCellResizing,
  onCellResized,
  onSwitchActiveTarget,
}: BasicDecoratorProps): JSX.Element {
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
        layoutOptions,
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
    layoutOptions,
    onCellResized,
    onCellResizing,
    onSwitchActiveTarget,
    readOnly,
    transform.k,
  ]);

  return (
    <g className="decorator-area-container">
      <foreignObject className="decorator-area" width="9999" height="9999">
        <div
          className="area"
          style={{
            ...cell.view.style,
            width: cell.view.width,
            height: cell.view.height,
          }}
        />
      </foreignObject>
      {!readOnly && !locked && (
        <g
          ref={resizeHandleRef}
          className="resize-handle"
          transform={`translate(${cell.view.width - 20} ${cell.view.height - 20})`}
        >
          <rect width={20} height={20} />
          <path d="M10 18L18 10 M15 18L18 15" />
        </g>
      )}
      {locked && (
        <LockIcon x={cell.view.width - 16} y={cell.view.height - 16} />
      )}
    </g>
  );
}
