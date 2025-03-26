import React, { useCallback, useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import type {
  ActiveTarget,
  Cell,
  CellContextMenuDetail,
  ComputedEdgeLineConf,
  DecoratorTextChangeDetail,
  DecoratorView,
  LayoutOptions,
  LayoutType,
  NodeBrickConf,
  NodeCell,
  EditableLine,
  EditableLineCell,
  EditableEdgeLine,
} from "./interfaces";
import {
  isContainerDecoratorCell,
  isDecoratorCell,
  isEdgeCell,
  isEdgeSide,
  isLineDecoratorCell,
  isNoManualLayout,
  isNodeCell,
} from "./processors/asserts";
import { EdgeComponent } from "./EdgeComponent";
import { NodeComponent } from "./NodeComponent";
import { handleMouseDown } from "./processors/handleMouseDown";
import type { MoveCellPayload, ResizeCellPayload } from "./reducers/interfaces";
import { DecoratorComponent } from "./decorators";
import { cellToTarget } from "./processors/cellToTarget";
import type { SizeTuple, TransformLiteral } from "../diagram/interfaces";
import { sameTarget } from "./processors/sameTarget";
import { targetIsActive } from "./processors/targetIsActive";
import { computeContainerRect } from "./processors/computeContainerRect";
import { get } from "lodash";
import { useHoverStateContext } from "./HoverStateContext";
export interface CellComponentProps {
  layout: LayoutType;
  layoutOptions?: LayoutOptions;
  cell: Cell;
  cells: Cell[];
  degraded: boolean;
  degradedNodeLabel?: string;
  defaultNodeBricks?: NodeBrickConf[];
  transform: TransformLiteral;
  lineConfMap: WeakMap<EditableLineCell, ComputedEdgeLineConf>;
  editableLineMap: WeakMap<EditableLineCell, EditableLine>;
  activeTarget: ActiveTarget | null | undefined;
  readOnly?: boolean;
  hoverCell?: Cell | null | undefined;
  unrelatedCells: Cell[];
  dragoverContainer?: boolean;
  allowEdgeToArea?: boolean;
  curActiveEditableLine?: EditableLineCell | null;
  locked?: boolean;
  containerLocked?: boolean;
  updateCurActiveEditableLine?: (
    activeEditableLine: EditableLineCell | null
  ) => void;
  onCellsMoving?(info: MoveCellPayload[]): void;
  onCellsMoved?(info: MoveCellPayload[]): void;
  onCellResizing?(info: ResizeCellPayload): void;
  onCellResized?(info: ResizeCellPayload): void;
  onSwitchActiveTarget(target: ActiveTarget | null): void;
  onCellContextMenu(detail: CellContextMenuDetail): void;
  onCellClick?(detail: CellContextMenuDetail): void;
  onDecoratorTextEditing?(detail: { id: string; editing: boolean }): void;
  onDecoratorTextChange?(detail: DecoratorTextChangeDetail): void;
  onNodeBrickResize(id: string, size: SizeTuple | null): void;
  onCellMouseEnter?(cell: Cell): void;
  onCellMouseLeave?(cell: Cell): void;
}

export function CellComponent({
  layout,
  layoutOptions,
  cell,
  cells,
  degraded,
  degradedNodeLabel,
  defaultNodeBricks,
  lineConfMap,
  editableLineMap,
  activeTarget,
  dragoverContainer,
  readOnly,
  transform,
  hoverCell,
  unrelatedCells,
  allowEdgeToArea,
  curActiveEditableLine,
  locked,
  containerLocked,
  updateCurActiveEditableLine,
  onCellsMoving,
  onCellsMoved,
  onCellResizing,
  onCellResized,
  onSwitchActiveTarget,
  onCellContextMenu,
  onCellClick,
  onDecoratorTextEditing,
  onDecoratorTextChange,
  onNodeBrickResize,
  onCellMouseEnter,
  onCellMouseLeave,
}: CellComponentProps): JSX.Element | null {
  const {
    lineEditorState,
    smartConnectLineState,
    setSmartConnectLineState,
    onConnect,
    setLineEditorState,
    onChangeEdgeView,
  } = useHoverStateContext();
  const gRef = useRef<SVGGElement>(null);
  const unrelated = useMemo(
    () => unrelatedCells.some((item) => sameTarget(item, cell)),
    [cell, unrelatedCells]
  );

  const containerRect = useMemo((): DecoratorView | undefined => {
    if (isContainerDecoratorCell(cell) && isNoManualLayout(layout)) {
      const containCells = cells.filter(
        (c): c is NodeCell => isNodeCell(c) && c.containerId === cell.id
      );
      const view = {
        ...cell.view,
        ...computeContainerRect(containCells),
      };
      cell.view = view; //Update the rect container to make sure Lasso gets the correct size
      return view;
    }
    return isEdgeCell(cell) || isLineDecoratorCell(cell)
      ? undefined
      : get(cell, "view", { x: 0, y: 0, width: 0, height: 0 });
  }, [layout, cell, cells]);

  useEffect(() => {
    const g = gRef.current;
    if (!g) {
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      if (
        readOnly ||
        (isContainerDecoratorCell(cell) && isNoManualLayout(layout))
      ) {
        event.stopPropagation();
      } else {
        handleMouseDown(event, {
          layout,
          layoutOptions,
          action: "move",
          cell,
          scale: transform.k,
          activeTarget,
          cells,
          onCellsMoving,
          onCellsMoved,
          onSwitchActiveTarget,
          updateCurActiveEditableLine,
        });
      }
    };
    g.addEventListener("mousedown", onMouseDown);
    return () => {
      g.removeEventListener("mousedown", onMouseDown);
    };
  }, [
    layout,
    layoutOptions,
    cell,
    activeTarget,
    cells,
    onCellsMoved,
    onCellsMoving,
    onSwitchActiveTarget,
    updateCurActiveEditableLine,
    readOnly,
    transform.k,
  ]);

  // istanbul ignore next: experimental
  useEffect(() => {
    const g = gRef.current;
    if (
      !g ||
      !isEdgeSide(cell, allowEdgeToArea) ||
      !(
        smartConnectLineState ||
        (lineEditorState && lineEditorState.type !== "control")
      )
    ) {
      return;
    }
    const onMouseUp = (e: MouseEvent) => {
      if (
        curActiveEditableLine &&
        lineEditorState &&
        curActiveEditableLine.type === "decorator"
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (smartConnectLineState) {
        if (smartConnectLineState.source !== cell) {
          onConnect?.(
            smartConnectLineState.source,
            cell,
            smartConnectLineState.exitPosition,
            undefined
          );
        }
        setSmartConnectLineState(null);
      } else if (curActiveEditableLine && lineEditorState) {
        const { type } = lineEditorState;
        const { source, target } = editableLineMap.get(
          curActiveEditableLine
        ) as EditableEdgeLine;
        const { view } = curActiveEditableLine;

        const isEntry = type === "entry";
        if ((isEntry ? target : source) === cell) {
          if (isEntry) {
            onChangeEdgeView?.(source!, target!, {
              ...view,
              entryPosition: null,
              // ...(!view?.exitPosition ? { vertices: null } : {}),
            });
          } else {
            onChangeEdgeView?.(source!, target!, {
              ...view,
              exitPosition: null,
              // ...(!view?.entryPosition ? { vertices: null } : {}),
            });
          }
        }
        setLineEditorState(null);
      }
    };
    g.addEventListener("mouseup", onMouseUp);
    return () => {
      g.removeEventListener("mouseup", onMouseUp);
    };
  }, [
    curActiveEditableLine,
    editableLineMap,
    allowEdgeToArea,
    cell,
    lineEditorState,
    onChangeEdgeView,
    onConnect,
    setLineEditorState,
    setSmartConnectLineState,
    smartConnectLineState,
    updateCurActiveEditableLine,
  ]);

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      if (readOnly && cell.type === "decorator") {
        return;
      }
      event.preventDefault();
      onSwitchActiveTarget(cellToTarget(cell));
      onCellContextMenu({
        cell,
        clientX: event.clientX,
        clientY: event.clientY,
        locked,
      });
    },
    [cell, onCellContextMenu, onSwitchActiveTarget, readOnly, locked]
  );

  const handleCellClick = useCallback(
    (event: React.MouseEvent<SVGGElement>) => {
      if (!onCellClick || cell.type === "decorator") {
        return;
      }
      onCellClick({
        cell,
        clientX: event.clientX,
        clientY: event.clientY,
        locked,
      });
    },
    [cell, onCellClick, locked]
  );

  const handleMouseEnter = useCallback(() => {
    onCellMouseEnter?.(cell);
  }, [cell, onCellMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    onCellMouseLeave?.(cell);
  }, [cell, onCellMouseLeave]);

  const active = targetIsActive(cell, activeTarget);
  return (
    <g
      className={classNames("cell", {
        active,
        faded: unrelated,
        "read-only": readOnly,
        "container-dragover": dragoverContainer,
      })}
      ref={gRef}
      transform={
        (isNodeCell(cell) && !degraded) ||
        isEdgeCell(cell) ||
        isLineDecoratorCell(cell) ||
        cell.view.x == null ||
        cell.view.y == null
          ? undefined
          : `translate(${containerRect!.x},${containerRect!.y})`
      }
      onContextMenu={handleContextMenu}
      onClick={handleCellClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isNodeCell(cell) ? (
        <NodeComponent
          node={cell}
          x={containerRect?.x}
          y={containerRect?.y}
          degraded={degraded}
          degradedNodeLabel={degradedNodeLabel}
          defaultNodeBricks={defaultNodeBricks}
          locked={locked}
          containerLocked={containerLocked}
          onResize={onNodeBrickResize}
        />
      ) : isEdgeCell(cell) ? (
        <EdgeComponent
          edge={cell}
          active={readOnly ? hoverCell === cell : active}
          activeRelated={!!(readOnly ? hoverCell : activeTarget) && !unrelated}
          lineConfMap={lineConfMap}
          editableLineMap={editableLineMap}
          readOnly={readOnly}
          onSwitchActiveTarget={onSwitchActiveTarget}
        />
      ) : isDecoratorCell(cell) ? (
        <DecoratorComponent
          cell={cell}
          view={containerRect!}
          transform={transform}
          readOnly={readOnly}
          layout={layout}
          layoutOptions={layoutOptions}
          active={active}
          activeTarget={activeTarget}
          cells={cells}
          lineConfMap={lineConfMap}
          editableLineMap={editableLineMap}
          locked={locked}
          onCellResizing={onCellResizing}
          onCellResized={onCellResized}
          onSwitchActiveTarget={onSwitchActiveTarget}
          onDecoratorTextEditing={onDecoratorTextEditing}
          onDecoratorTextChange={onDecoratorTextChange}
        />
      ) : null}
    </g>
  );
}
