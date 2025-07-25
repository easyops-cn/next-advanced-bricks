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
  CellClickDetail,
  DecoratorCell,
  BaseNodeCell,
} from "./interfaces";
import {
  isContainerDecoratorCell,
  isDecoratorCell,
  isEdgeCell,
  isEdgeSide,
  isGroupDecoratorCell,
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
import { computeBoundingBox } from "./processors/computeBoundingBox";
import { get } from "lodash";
import { useHoverStateContext } from "./HoverStateContext";
import {
  GROUPPADDING,
  highlightGroupCell,
} from "./processors/initialGroupLayout";
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
  groupLocked?: boolean;
  updateCurActiveEditableLine?: (
    activeEditableLine: EditableLineCell | null
  ) => void;
  onCellsMoving?(info: MoveCellPayload[]): void;
  onCellsMoved?(info: MoveCellPayload[]): void;
  onCellResizing?(info: ResizeCellPayload): void;
  onCellResized?(info: ResizeCellPayload): void;
  onSwitchActiveTarget(target: ActiveTarget | null): void;
  onCellContextMenu(detail: CellContextMenuDetail): void;
  onCellClick?(detail: CellClickDetail): void;
  onDecoratorTextEditing?(detail: { id: string; editing: boolean }): void;
  onDecoratorTextChange?(detail: DecoratorTextChangeDetail): void;
  onDecoratorGroupPlusClick?(detail: DecoratorCell): void;
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
  groupLocked,
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
  onDecoratorGroupPlusClick,
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
        ...computeBoundingBox(containCells),
      };
      cell.view = view; //Update the rect container to make sure Lasso gets the correct size
      return view;
    }
    if (
      isGroupDecoratorCell(cell) &&
      highlightGroupCell(cell, activeTarget, cells)
    ) {
      const nodeViews = cells.filter(
        (c) => c.type === "node" && c.groupId === cell.id
      );
      const view = {
        ...cell.view,
        ...computeBoundingBox(nodeViews as BaseNodeCell[], {
          padding: GROUPPADDING,
        }),
      };
      cell.view = view;
      return view;
    }
    return isEdgeCell(cell) || isLineDecoratorCell(cell)
      ? undefined
      : get(cell, "view", { x: 0, y: 0, width: 0, height: 0 });
  }, [layout, cell, cells, activeTarget]);

  useEffect(() => {
    const g = gRef.current;
    if (!g) {
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      if (
        readOnly ||
        ([isContainerDecoratorCell(cell), isGroupDecoratorCell(cell)].some(
          Boolean
        ) &&
          isNoManualLayout(layout))
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
      event.stopPropagation();
      let target = activeTarget;
      // When right-click a cell,
      // - if it's already active, use previous active target (including multiple targets)
      // - if it's inactive, use the cell as the new only target (excluding previous active target)
      if (!targetIsActive(cell, activeTarget)) {
        target = cellToTarget(cell);
        onSwitchActiveTarget(target);
      }
      onCellContextMenu({
        cell,
        clientX: event.clientX,
        clientY: event.clientY,
        locked,
        target: target!,
      });
    },
    [
      readOnly,
      cell,
      activeTarget,
      onCellContextMenu,
      locked,
      onSwitchActiveTarget,
    ]
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
        cell.view?.x == null ||
        cell.view?.y == null
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
          groupLocked={groupLocked}
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
          onDecoratorGroupPlusClick={onDecoratorGroupPlusClick}
        />
      ) : null}
    </g>
  );
}
