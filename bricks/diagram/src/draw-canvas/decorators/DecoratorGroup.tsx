import React, { useMemo } from "react";
import type { BasicDecoratorProps } from "../interfaces";
import { LockIcon } from "../LockIcon";
import classNames from "classnames";
import { highlightGroupCell } from "../processors/initaliGroupLayout";

export type DecoratorRectProps = Omit<
  BasicDecoratorProps,
  "lineConfMap" | "editableLineMap"
>;

export function DecoratorGroup({
  cell,
  view,
  activeTarget,
  cells,
  locked,
  onDecoratorGroupPlusClick,
}: DecoratorRectProps): JSX.Element {
  const active = useMemo(
    () => highlightGroupCell(cell, activeTarget, cells),
    [activeTarget, cell, cells]
  );
  return (
    <g
      className={classNames("decorator-group", {
        ["active-group"]: active,
      })}
    >
      <foreignObject
        className="group-wrapper"
        width={cell.view.width}
        height={cell.view.height}
      >
        <div
          className="group"
          style={{
            ...cell.view?.style,
            width: cell.view.width,
            height: cell.view.height,
          }}
        />
      </foreignObject>

      {view.usePlus && cell.view.width && cell.view.height && (
        <g
          transform={`translate(${cell.view.width / 2 - 8}, ${cell.view.height - 8}) scale(0.0234375)`}
          className="plus-wrapper"
          onClick={() => onDecoratorGroupPlusClick?.(cell)}
        >
          <svg
            className="plus-icon"
            viewBox="64 64 896 896"
            fill="currentColor"
          >
            <rect x="0" y="0" width="101%" height="101%" fill="#f5f5f5" />
            <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z" />
            <path d="M192 474h672q8 0 8 8v60q0 8-8 8H160q-8 0-8-8v-60q0-8 8-8z" />
          </svg>
        </g>
      )}
      {locked && (
        <LockIcon x={cell.view.width! - 16} y={cell.view.height! - 16} />
      )}
    </g>
  );
}
