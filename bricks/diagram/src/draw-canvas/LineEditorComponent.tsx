// istanbul ignore file: experimental
import React, { useEffect, useMemo, useRef } from "react";
import type { NodePosition } from "../diagram/interfaces";
import { useHoverStateContext } from "./HoverStateContext";
import type {
  ControlPoint,
  EditableLine,
  EditableLineCell,
  EditableLineView,
} from "./interfaces";
import { isLineDecoratorCell, isStraightType } from "./processors/asserts";

const POINT_HELPER_IMAGE =
  "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjIycHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSIjMjliNmYyIi8+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iMyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJ0cmFuc3BhcmVudCIvPjwvc3ZnPg==";
const END_POINT_HELPER_IMAGE =
  "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiIHZlcnNpb249IjEuMSIgc3R5bGU9ImNvbG9yLXNjaGVtZTogbGlnaHQgZGFyazsiPjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSI2IiBzdHJva2U9IiNmZmYiIGZpbGw9IiMyOWI2ZjIiLz48L3N2Zz4=";
const ANCHORED_POINT_HELPER_IMAGE =
  "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMnB4IiBoZWlnaHQ9IjIycHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iNyIgc3Ryb2tlPSIjZmZmIiBmaWxsPSIjMDFiZDIyIi8+PHBhdGggZD0ibSA4IDggTCAxNCAxNE0gOCAxNCBMIDE0IDgiIHN0cm9rZT0iI2ZmZiIvPjwvc3ZnPg==";
const VERTEX_HELPER_IMAGE =
  "data:image/svg+xml;base64,PCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiIHZlcnNpb249IjEuMSI+PGNpcmNsZSBjeD0iOSIgY3k9IjkiIHI9IjUiIHN0cm9rZT0iI2ZmZiIgZmlsbD0iIzI5YjZmMiIvPjwvc3ZnPg==";
const POINT_HELPER_BG_SIZE = 22;

export interface LineEditorComponentProps {
  scale: number;
  editableLineMap: WeakMap<EditableLineCell, EditableLine>;
  activeEditableLine: EditableLineCell;
  updateCurActiveEditableLine?: (
    activeEditableLine: EditableLineCell | null
  ) => void;
}

export function LineEditorComponent({
  scale,
  editableLineMap,
  activeEditableLine,
  updateCurActiveEditableLine,
}: LineEditorComponentProps): JSX.Element | null {
  const { rootRef, movingCells, lineEditorState, setLineEditorState } =
    useHoverStateContext();
  const exitRef = useRef<SVGImageElement>(null);
  const entryRef = useRef<SVGImageElement>(null);
  const controlPointsRef = useRef<(SVGImageElement | null)[]>([]);
  const isLineDecorator = isLineDecoratorCell(activeEditableLine);

  useEffect(() => {
    const exit = exitRef.current;
    const entry = entryRef.current;
    if (!exit || !entry || !activeEditableLine) {
      return;
    }
    const handleMouseDownFactory = (type: "exit" | "entry") => {
      return (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const rect = rootRef.current!.getBoundingClientRect();
        setLineEditorState({
          offset: [rect.left, rect.top],
          from: [e.clientX, e.clientY],
          type,
        });
        updateCurActiveEditableLine?.(activeEditableLine);
      };
    };
    const handleStartMouseDown = handleMouseDownFactory("exit");
    const handleEndMouseDown = handleMouseDownFactory("entry");
    exit.addEventListener("mousedown", handleStartMouseDown);
    entry.addEventListener("mousedown", handleEndMouseDown);
    return () => {
      exit.removeEventListener("mousedown", handleStartMouseDown);
      entry.removeEventListener("mousedown", handleEndMouseDown);
    };
  }, [
    activeEditableLine,
    rootRef,
    setLineEditorState,
    updateCurActiveEditableLine,
  ]);

  const controlPoints = useMemo(() => {
    if (!activeEditableLine) {
      return [];
    }

    const points = editableLineMap.get(activeEditableLine)!.points!;

    if (isStraightType((activeEditableLine.view as EditableLineView)?.type)) {
      return isLineDecorator ? getStraightControlPoints(points) : [];
    }

    return getControlPoints(points);
  }, [activeEditableLine, editableLineMap, isLineDecorator]);

  useEffect(() => {
    if (!activeEditableLine) {
      return;
    }
    const controlElements = controlPointsRef.current;
    const handleMouseDownFactory = (control: ControlPoint) => {
      return (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        updateCurActiveEditableLine?.(activeEditableLine);
        const rect = rootRef.current!.getBoundingClientRect();
        setLineEditorState({
          offset: [rect.left, rect.top],
          from: [e.clientX, e.clientY],
          type: control.type,
          control,
        });
      };
    };
    const handlers = controlPoints.map((control) =>
      handleMouseDownFactory(control)
    );
    controlElements.forEach((el, i) => {
      el?.addEventListener("mousedown", handlers[i]);
    });
    return () => {
      controlElements.forEach((el, i) => {
        el?.removeEventListener("mousedown", handlers[i]);
      });
    };
  }, [
    activeEditableLine,
    controlPoints,
    rootRef,
    setLineEditorState,
    updateCurActiveEditableLine,
  ]);

  const gRef = useRef<SVGGElement>(null);
  useEffect(() => {
    const g = gRef.current;
    const onClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };
    g?.addEventListener("click", onClick);
    return () => {
      g?.removeEventListener("click", onClick);
    };
  }, []);

  if (movingCells) {
    return null;
  }

  const view = activeEditableLine.view as EditableLineView;
  const linePoints = editableLineMap.get(activeEditableLine)!.points!;
  const { exitPosition, entryPosition } = view ?? {};

  const commonProps: React.SVGAttributes<SVGImageElement> = {
    width: POINT_HELPER_BG_SIZE / scale,
    height: POINT_HELPER_BG_SIZE / scale,
    preserveAspectRatio: "none",
    cursor: "pointer",
    pointerEvents: "fill",
  };
  const exitPoint = linePoints[0];
  const entryPoint = linePoints[linePoints.length - 1];
  const offset = POINT_HELPER_BG_SIZE / scale / 2;

  return (
    <g ref={gRef}>
      <image
        ref={exitRef}
        {...commonProps}
        x={exitPoint.x - offset}
        y={exitPoint.y - offset}
        xlinkHref={
          isLineDecorator
            ? VERTEX_HELPER_IMAGE
            : exitPosition
              ? ANCHORED_POINT_HELPER_IMAGE
              : POINT_HELPER_IMAGE
        }
      />
      {controlPoints.map((point, i) => (
        <image
          key={i}
          ref={(el) => {
            controlPointsRef.current[i] = el;
          }}
          {...commonProps}
          x={point.x - offset}
          y={point.y - offset}
          opacity={
            point.type === "break" &&
            !(
              lineEditorState?.type === "break" &&
              lineEditorState.control === point
            )
              ? 0.4
              : 1
          }
          xlinkHref={VERTEX_HELPER_IMAGE}
          cursor={
            isLineDecorator
              ? "crosshair"
              : point.direction === "ns"
                ? "row-resize"
                : "col-resize"
          }
        />
      ))}
      <image
        ref={entryRef}
        {...commonProps}
        x={entryPoint.x - offset}
        y={entryPoint.y - offset}
        xlinkHref={
          isLineDecorator
            ? END_POINT_HELPER_IMAGE
            : entryPosition
              ? ANCHORED_POINT_HELPER_IMAGE
              : POINT_HELPER_IMAGE
        }
      />
    </g>
  );
}

function getControlPoints(linePoints: NodePosition[]): ControlPoint[] {
  const controlPoints: ControlPoint[] = [];
  let prev = linePoints[0];
  let cursor = 1;
  while (cursor < linePoints.length) {
    const next = linePoints[cursor];
    const ns = prev.y === next.y;
    const ew = prev.x === next.x;
    if (!(ns && ew)) {
      const direction = ns ? "ns" : "ew";
      controlPoints.push({
        type: "control",
        direction,
        index: cursor - 1,
        x: (prev.x + next.x) / 2,
        y: (prev.y + next.y) / 2,
      });
    }
    prev = next;
    cursor++;
  }

  return controlPoints;
}

function getStraightControlPoints(linePoints: NodePosition[]): ControlPoint[] {
  const controlPoints: ControlPoint[] = [];
  let prev = linePoints[0];
  let cursor = 1;
  while (cursor < linePoints.length) {
    const next = linePoints[cursor];
    controlPoints.push({
      type: "break",
      index: cursor - 1,
      x: (prev.x + next.x) / 2,
      y: (prev.y + next.y) / 2,
    });
    if (cursor < linePoints.length - 1) {
      controlPoints.push({
        ...next,
        type: "corner",
        index: cursor - 1,
      });
    }
    prev = next;
    cursor++;
  }

  return controlPoints;
}
