import { map } from "lodash";
import type { PositionTuple } from "../../diagram/interfaces";
import type {
  ActiveTarget,
  Cell,
  LayoutOptions,
  DecoratorCell,
  LayoutType,
  NodeCell,
  SnapToObjectPosition,
  ActiveTargetOfSingular,
  EditableLineCell,
} from "../interfaces";
import type {
  MoveCellPayload,
  ResizeCellPayload,
} from "../reducers/interfaces";
import {
  isContainerDecoratorCell,
  isDecoratorCell,
  isEdgeCell,
  isGroupDecoratorCell,
  isLineDecoratorCell,
  isNodeCell,
} from "./asserts";
import { cellToTarget } from "./cellToTarget";
import { getSnapPositions, type SnapPositions } from "./getSnapPositions";
import { getLockedContainerIds, isLocked } from "./isLocked";
import { normalizeSnapOptions } from "./normalizeSnapOptions";
import { sameTarget } from "./sameTarget";
import { targetIsActive } from "./targetIsActive";

const HORIZONTAL_POSITIONS = ["left", "center", "right"];
const VERTICAL_POSITIONS = ["top", "center", "bottom"];

export function handleMouseDown(
  event: MouseEvent,
  {
    action,
    cell,
    scale,
    layout,
    layoutOptions,
    activeTarget,
    cells,
    onCellsMoving,
    onCellsMoved,
    onCellResizing,
    onCellResized,
    onSwitchActiveTarget,
    updateCurActiveEditableLine,
  }: {
    action: "move" | "resize";
    cell: Cell;
    scale: number;
    layout?: LayoutType;
    layoutOptions?: LayoutOptions;
    activeTarget: ActiveTarget | null | undefined;
    cells: Cell[];
    onCellsMoving?(info: MoveCellPayload[]): void;
    onCellsMoved?(info: MoveCellPayload[]): void;
    onCellResizing?(info: ResizeCellPayload): void;
    onCellResized?(info: ResizeCellPayload): void;
    onSwitchActiveTarget?(activeTarget: ActiveTarget | null): void;
    updateCurActiveEditableLine?: (
      activeEditableLine: EditableLineCell | null
    ) => void;
  }
) {
  event.stopPropagation();

  // Ignore contextmenu click
  if (event.button === 2 || (event.button === 0 && event.ctrlKey)) {
    return;
  }

  // Drag node
  const preActive = targetIsActive(cell, activeTarget);
  const lockedContainerIds = getLockedContainerIds(cells);
  let canUpdateActiveEditableLine = false;
  if (event.shiftKey) {
    const activeTargets = activeTarget
      ? activeTarget?.type === "multi"
        ? activeTarget.targets
        : [activeTarget]
      : [];
    let targets: ActiveTargetOfSingular[] = [];
    if (preActive) {
      targets = activeTargets.filter((target) => !sameTarget(target, cell));
    } else {
      targets = [...activeTargets, cell];
      canUpdateActiveEditableLine = true;
    }
    onSwitchActiveTarget?.(
      targets.length > 0 ? { type: "multi", targets } : null
    );
  } else {
    if (action === "resize" || !preActive) {
      onSwitchActiveTarget?.(cellToTarget(cell));
      canUpdateActiveEditableLine = true;
    }
  }

  if (isLocked(cell, lockedContainerIds)) {
    return;
  }

  if (
    canUpdateActiveEditableLine &&
    (isEdgeCell(cell) || isLineDecoratorCell(cell))
  ) {
    updateCurActiveEditableLine?.(cell);
  }

  if (isEdgeCell(cell)) {
    return;
  }

  const activeCells: Cell[] = [];
  const actives =
    activeTarget?.type === "multi" && action === "move"
      ? cells.filter((c) => targetIsActive(c, activeTarget))
      : [cell];
  actives.forEach((a) => {
    activeCells.push(a);
    if (action === "move") {
      if (isContainerDecoratorCell(a)) {
        const groupIds = map(
          cells.filter(
            (c) => isGroupDecoratorCell(c) && c.containerId === a.id
          ),
          "id"
        );
        const nodeCells = cells.filter(
          (c) =>
            ((isNodeCell(c) || isGroupDecoratorCell(c)) &&
              c.containerId === a.id &&
              !actives.includes(c)) ||
            (isNodeCell(c) && groupIds.includes(c?.groupId))
        );
        activeCells.push(...nodeCells);
      }
      if (isGroupDecoratorCell(a)) {
        activeCells.push(
          ...cells.filter(
            (c) => isNodeCell(c) && c.groupId === a.id && !actives.includes(c)
          )
        );
      }
    }
  });
  const isAutoLayout = layout === "force" || layout === "dagre";
  const movableActiveCells = activeCells.filter(
    (c) =>
      !isLocked(c, lockedContainerIds) &&
      ((isNodeCell(c) && !isAutoLayout) || isDecoratorCell(c))
  ) as (NodeCell | DecoratorCell)[];

  if (movableActiveCells.length === 0) {
    return;
  }

  const snap = normalizeSnapOptions(layoutOptions?.snap);
  const snapToObjectPositions = snap.object?.positions;

  const from: PositionTuple = [event.clientX, event.clientY];
  const originals = movableActiveCells.map<{
    cell: NodeCell | DecoratorCell;
    position: PositionTuple;
    snapPositions: SnapPositions | null;
  }>((c) => ({
    cell: c,
    position:
      action === "move" ? [c.view.x, c.view.y] : [c.view.width, c.view.height],
    snapPositions:
      action === "move" && !isEdgeCell(c)
        ? getSnapPositions(c.view, snapToObjectPositions)
        : null,
  }));
  const firstOriginalPosition = originals[0].position;
  // let previousPositions = originals.map(({ position }) => position);

  // Get the positions of the objects (cells that are not active) to snap to
  let snapToObjectTargets: {
    cell: NodeCell | DecoratorCell;
    snapPositions: SnapPositions;
  }[] = [];
  if (action === "move" && snap.object) {
    const objectCells = cells.filter(
      // Edge and line cells are not snap targets
      (c) =>
        !isEdgeCell(c) && !isLineDecoratorCell(c) && !activeCells.includes(c)
    ) as (NodeCell | DecoratorCell)[];
    snapToObjectTargets = objectCells.map((c) => ({
      cell: c,
      snapPositions: getSnapPositions(c.view, snapToObjectPositions),
    }));
  }

  function getMovement(e: MouseEvent): PositionTuple {
    return [(e.clientX - from[0]) / scale, (e.clientY - from[1]) / scale];
  }
  let moved = false;

  const handleMove = (e: MouseEvent, finished?: boolean) => {
    // Respect the scale
    const movement = getMovement(e);
    const snapMovement: PositionTuple = [...movement];
    let newPositions: PositionTuple[];
    let xAlign: [PositionTuple, PositionTuple] | undefined;
    let yAlign: [PositionTuple, PositionTuple] | undefined;
    let xAlignCell: Cell | undefined;
    let yAlignCell: Cell | undefined;

    if (!moved) {
      moved = movement[0] ** 2 + movement[1] ** 2 >= 9;
    }

    // Use alt key (or option key ⌥ on Mac) to disable snap
    if ((!snap.grid && !snap.object) || e.altKey) {
      // No snap
      newPositions = originals.map(({ position }) => [
        position[0] + movement[0],
        position[1] + movement[1],
      ]);
    } else {
      // Snap
      let diffX = Infinity;
      let diffY = Infinity;

      if (snap.object) {
        const snapToObjectDistance = snap.object.distance;
        let xAlignFrom: PositionTuple | undefined;
        let yAlignFrom: PositionTuple | undefined;
        let xAlignTarget: NodeCell | DecoratorCell | undefined;
        let yAlignTarget: NodeCell | DecoratorCell | undefined;
        let xAlignToY = 0;
        let yAlignToX = 0;
        for (const {
          cell: target,
          snapPositions: targetPositions,
          // center: [x, y],
        } of snapToObjectTargets) {
          for (const {
            cell: c,
            snapPositions: originalPositions,
          } of originals) {
            for (const [position, originalPoint] of Object.entries(
              originalPositions!
            )) {
              const horizontal = HORIZONTAL_POSITIONS.includes(position);
              const vertical = VERTICAL_POSITIONS.includes(position);
              const [x, y] = targetPositions[position as SnapToObjectPosition]!;
              const [cx, cy] = originalPoint!;
              if (horizontal) {
                const dX = Math.abs(cx + movement[0] - x);
                const xSnapped = dX < snapToObjectDistance && dX < diffX;
                if (xSnapped) {
                  diffX = dX;
                  snapMovement[0] = x - cx;
                  xAlignCell = c;
                  xAlignTarget = target;
                  xAlignFrom = [x, y];
                  xAlignToY = cy;
                }
              }
              if (vertical) {
                const dY = Math.abs(cy + movement[1] - y);
                const ySnapped = dY < snapToObjectDistance && dY < diffY;
                if (ySnapped) {
                  diffY = dY;
                  snapMovement[1] = y - cy;
                  yAlignCell = c;
                  yAlignTarget = target;
                  yAlignFrom = [x, y];
                  yAlignToX = cx;
                }
              }
            }
          }
        }

        if (xAlignTarget && xAlignTarget === yAlignTarget) {
          // Handle special case when both x and y are snapped to the same target.
          const halfHeight = xAlignTarget.view.height / 2;
          const halfWidth = xAlignTarget.view.width / 2;
          xAlign = [
            [xAlignFrom![0], xAlignFrom![1] - halfHeight],
            [xAlignFrom![0], xAlignFrom![1] + halfHeight],
          ];
          yAlign = [
            [yAlignFrom![0] - halfWidth, yAlignFrom![1]],
            [yAlignFrom![0] + halfWidth, yAlignFrom![1]],
          ];
        } else {
          if (xAlignFrom) {
            xAlign = [xAlignFrom, [xAlignFrom[0], xAlignToY + snapMovement[1]]];
          }
          if (yAlignFrom) {
            yAlign = [yAlignFrom, [yAlignToX + snapMovement[0], yAlignFrom[1]]];
          }
        }
      }

      if (snap.grid) {
        const snapToGridSize = snap.grid.size;
        // Use the first cell to decide the snap to grid position
        const firstNewPosition: PositionTuple = [
          Math.round(
            (firstOriginalPosition[0] + movement[0]) / snapToGridSize
          ) * snapToGridSize,
          Math.round(
            (firstOriginalPosition[1] + movement[1]) / snapToGridSize
          ) * snapToGridSize,
        ];
        const snapToGridMovement: PositionTuple = [
          firstNewPosition[0] - firstOriginalPosition[0],
          firstNewPosition[1] - firstOriginalPosition[1],
        ];
        const snapToGridDiffX = Math.abs(snapToGridMovement[0] - movement[0]);
        const snapToGridDiffY = Math.abs(snapToGridMovement[1] - movement[1]);
        if (snapToGridDiffX < diffX) {
          diffX = snapToGridDiffX;
          snapMovement[0] = snapToGridMovement[0];
          xAlign = undefined;
          xAlignCell = undefined;
        }
        if (snapToGridDiffY < diffY) {
          diffY = snapToGridDiffY;
          snapMovement[1] = snapToGridMovement[1];
          yAlign = undefined;
          yAlignCell = undefined;
        }
      }

      newPositions = originals.map(({ position }) => [
        position[0] + snapMovement[0],
        position[1] + snapMovement[1],
      ]);
    }

    if (moved) {
      if (action === "move") {
        const payloads = originals.map(({ cell: c }, index) => ({
          type: c.type,
          id: c.id,
          x: newPositions[index][0],
          y: newPositions[index][1],
          groupId: c.groupId,
          containerId: c.containerId,
          width: c.view.width,
          height: c.view.height,
          decorator: isDecoratorCell(c) ? c.decorator : undefined,
          guideLines: finished
            ? undefined
            : [
                ...(xAlignCell === c ? [xAlign!] : []),
                ...(yAlignCell === c ? [yAlign!] : []),
              ],
          ...(isLineDecoratorCell(c)
            ? {
                source: {
                  x: c.view.source.x + snapMovement[0],
                  y: c.view.source.y + snapMovement[1],
                },
                target: {
                  x: c.view.target.x + snapMovement[0],
                  y: c.view.target.y + snapMovement[1],
                },
                vertices: c.view.vertices?.map((v) => ({
                  x: v.x + snapMovement[0],
                  y: v.y + snapMovement[1],
                })),
              }
            : null),
        }));
        (finished ? onCellsMoved : onCellsMoving)?.(payloads);
      } else {
        (finished ? onCellResized : onCellResizing)?.({
          type: cell.type,
          id: cell.id,
          width: newPositions[0][0],
          height: newPositions[0][1],
        });
      }
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    handleMove(e);
  };
  const onMouseUp = (e: MouseEvent) => {
    handleMove(e, true);
    moved = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}
