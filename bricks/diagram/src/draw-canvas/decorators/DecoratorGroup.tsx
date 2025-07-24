import React, { useMemo } from "react";
import type { BasicDecoratorProps } from "../interfaces";
import { LockIcon } from "../LockIcon";
import classNames from "classnames";
import { PlusOutlined } from "@ant-design/icons";
import { highlightGroupCell } from "../processors/initialGroupLayout";

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
        width={cell.view.width + 10}
        height={cell.view.height + 10}
      >
        <div
          className="group"
          style={{
            ...cell.view?.style,
            width: cell.view.width,
            height: cell.view.height,
          }}
        >
          {view.usePlus && (
            <PlusOutlined
              className="plus-icon"
              onClick={() => onDecoratorGroupPlusClick?.(cell)}
            />
          )}
        </div>
      </foreignObject>
      {locked && (
        <LockIcon x={cell.view.width! - 16} y={cell.view.height! - 16} />
      )}
    </g>
  );
}
