import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { BasicDecoratorProps, NodeCell } from "../interfaces";
import { handleMouseDown } from "../processors/handleMouseDown";
import classNames from "classnames";
import { get } from "lodash";
import { selectAllText } from "./DecoratorText";
import { isNoManualLayout } from "../processors/asserts";
import { uuidV4 } from "..";
import { LockIcon } from "../LockIcon";
import { getContentEditable } from "../processors/getContentEditable";

export function DecoratorContainer({
  cell,
  transform,
  readOnly,
  layout,
  view,
  activeTarget,
  cells,
  locked,
  onCellResizing,
  onCellResized,
  onSwitchActiveTarget,
  onDecoratorTextEditing,
  onDecoratorTextChange,
}: BasicDecoratorProps): JSX.Element {
  const label = get(cell.view, "text", "");
  const direction = get(cell.view, "direction", "top");
  const textRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = React.useRef<SVGGElement>(null);
  const [editingLabel, setEditingLabel] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<string>(label);
  const [shouldEmitLabelChange, setShouldEmitLabelChange] = useState(false);
  const [recomputation, setRecomputation] = useState<string>();
  const [titleForeignRect, setTitleForeignRect] = useState({
    x: 0,
    y: 0,
    width: cell.view.width,
    height: cell.view.height,
  });
  // istanbul ignore next
  const shouldHighlight = useMemo(() => {
    let activeTargetCells = [],
      active = false;
    if (activeTarget?.type === "multi") {
      activeTargetCells = activeTarget.targets;
    } else if (activeTarget?.type === "node") {
      activeTargetCells.push(activeTarget);
    }
    const containerLeft = cell.view.x;
    const containerRight = cell.view.x + cell.view.width;
    const containerTop = cell.view.y;
    const containerBottom = cell.view.y + cell.view.height;
    active = activeTargetCells.some((item) => {
      if (item?.type === "node" || item.type === "decorator") {
        const targetCell = cells.find(
          (c) =>
            (c?.type === "node" || c.type === "decorator") && c.id === item.id
        ) as NodeCell;
        if (targetCell) {
          const left = targetCell.view.x;
          const right = targetCell.view.x + targetCell.view.width;
          const top = targetCell.view.y;
          const bottom = targetCell.view.y + targetCell.view.height;
          return (
            left >= containerLeft &&
            right <= containerRight &&
            top >= containerTop &&
            bottom <= containerBottom
          );
        }
      }
    });
    return active;
  }, [activeTarget, cell, cells]);
  const handleEnableEdit = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly || locked) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      setEditingLabel(true);
    },
    [readOnly, locked]
  );
  const handleInput = useCallback(
    (event: React.FormEvent<HTMLDivElement>) => {
      if (readOnly) {
        return;
      }
      setCurrentLabel((event.target as HTMLDivElement).textContent!);
    },
    [readOnly]
  );

  const handleBlur = useCallback(() => {
    if (readOnly) {
      return;
    }
    setEditingLabel(false);
    setShouldEmitLabelChange(true);
    setRecomputation(uuidV4());
  }, [readOnly]);

  useEffect(() => {
    setCurrentLabel(label);
  }, [label]);

  useEffect(() => {
    const element = textRef.current;
    if (element && element.textContent !== currentLabel) {
      element.textContent = currentLabel;
    }
  }, [currentLabel]);

  useEffect(() => {
    const element = textRef.current?.parentElement;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      const { clientWidth, clientHeight } = element;
      if (["left", "right"].includes(direction)) {
        setTitleForeignRect({
          width: clientWidth,
          height: view.height,
          x: direction === "left" ? -clientWidth : view.width,
          y: 0,
        });
      } else {
        setTitleForeignRect({
          width: view.width,
          height: clientHeight,
          x: 0,
          y: direction === "top" ? -clientHeight : view.height,
        });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [view, currentLabel, direction, recomputation]);

  useEffect(() => {
    if (editingLabel && textRef.current) {
      textRef.current.focus();
      selectAllText(textRef.current);
    }
    onDecoratorTextEditing?.({ id: cell.id, editing: editingLabel });
  }, [cell.id, editingLabel, onDecoratorTextEditing]);

  useEffect(() => {
    if (shouldEmitLabelChange) {
      onDecoratorTextChange?.({
        id: cell.id,
        view: { ...view, text: currentLabel },
      });
      setShouldEmitLabelChange(false);
    }
  }, [cell, view, currentLabel, onDecoratorTextChange, shouldEmitLabelChange]);

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
  ]);

  return (
    <g className="decorator-container">
      <foreignObject {...titleForeignRect}>
        <div
          className={classNames("text-container", {
            editing: editingLabel,
            [["left", "right"].includes(direction) ? "vertical" : "horizontal"]:
              true,
          })}
          onDoubleClick={handleEnableEdit}
          style={cell.view.titleStyle}
        >
          <div
            className="text"
            contentEditable={getContentEditable(editingLabel)}
            ref={textRef}
            onInput={handleInput}
            onBlur={handleBlur}
          />
        </div>
      </foreignObject>
      <foreignObject
        x={0}
        y={0}
        width={view.width}
        height={view.height}
        className="container-wrapper"
      >
        <div
          className={classNames("container", {
            ["active-container"]: shouldHighlight,
          })}
          style={{
            ...cell.view.style,
            width: view.width,
            height: view.height,
          }}
        />
      </foreignObject>
      {!readOnly && !locked && !isNoManualLayout(layout) && (
        <g
          ref={resizeHandleRef}
          className="resize-handle"
          transform={`translate(${view.width - 20} ${view.height - 20})`}
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
