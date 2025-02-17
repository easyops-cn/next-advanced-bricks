// istanbul ignore file: experimental
import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import type {
  Cell,
  ComputedLineConnecterConf,
  EditableEdgeLine,
  EditableLine,
  EditableLineCell,
  EditableLineView,
  LineEditorState,
  LineEditorStateOfControl,
} from "./interfaces";
import type {
  LineMarkerConf,
  NodePosition,
  PositionTuple,
  TransformLiteral,
} from "../diagram/interfaces";
import { curveLine } from "../diagram/lines/curveLine";
import { useHoverStateContext } from "./HoverStateContext";
import {
  getEditingLinePoints,
  getNewLineVertices,
} from "../shared/canvas/processors/getEditingLinePoints";
import { getMarkers } from "../shared/canvas/useLineMarkers";
import { isEdgeCell, isLineDecoratorCell } from "./processors/asserts";

const LOOSE_CONTROL_TYPES = [
  "control",
  "corner",
  "break",
] as LineEditorState["type"][];

export interface EditingLineComponentProps {
  cells: Cell[];
  editableLineMap: WeakMap<EditableLineCell, EditableLine>;
  transform: TransformLiteral;
  options: ComputedLineConnecterConf;
  activeEditableLine: EditableLineCell | null;
}

export function EditingLineComponent({
  cells,
  editableLineMap,
  transform,
  options,
  activeEditableLine,
}: EditingLineComponentProps): JSX.Element {
  const [connectLineTo, setConnectLineTo] = useState<PositionTuple | null>(
    null
  );
  const {
    hoverState,
    lineEditorState,
    setLineEditorState,
    onChangeEdgeView,
    onChangeDecoratorView,
  } = useHoverStateContext();
  const movedRef = useRef(false);

  useEffect(() => {
    if (!lineEditorState) {
      setTimeout(() => {
        movedRef.current = false;
      }, 0);
    }
  }, [lineEditorState]);

  useEffect(() => {
    if (!activeEditableLine || !lineEditorState) {
      return;
    }
    movedRef.current = false;
    const { type, offset, from } = lineEditorState;
    // Set connect line to based on the mouse position and the transform
    const getConnectTo = (e: MouseEvent): PositionTuple => {
      const position: NodePosition = {
        x: (e.clientX - transform.x - offset[0]) / transform.k,
        y: (e.clientY - transform.y - offset[1]) / transform.k,
      };
      const linePoints = editableLineMap.get(activeEditableLine)!.points;
      const snapDistance = 5;
      const diff: NodePosition = { x: Infinity, y: Infinity };
      // let original: NodePosition;
      let otherPoints: NodePosition[];
      let axises: ("x" | "y")[];

      const getFinalPosition = (): PositionTuple => {
        if (!movedRef.current) {
          const movementX = (e.clientX - from[0]) / transform.k;
          const movementY = (e.clientY - from[1]) / transform.k;
          movedRef.current = movementX ** 2 + movementY ** 2 >= 9;
        }

        return [position.x, position.y];
      };

      if (LOOSE_CONTROL_TYPES.includes(type) && !e.altKey) {
        // Snap to other points
        const control = (lineEditorState as LineEditorStateOfControl).control;
        // original = {
        //   x: control.x,
        //   y: control.y,
        // };
        axises =
          type === "control"
            ? [control.direction === "ns" ? "y" : "x"]
            : ["x", "y"];
        otherPoints = linePoints.filter(
          (_, i) =>
            i === 0 ||
            i === linePoints.length - 1 ||
            (type === "control"
              ? i !== control.index && i !== control.index + 1
              : type !== "corner" || i !== control.index + 1)
        );
      } else if (
        isLineDecoratorCell(activeEditableLine) &&
        (type === "exit" || type === "entry") &&
        !e.altKey
      ) {
        const endpoint =
          type === "exit" ? linePoints[0] : linePoints[linePoints.length - 1];
        // original = clone(endpoint);
        otherPoints = linePoints.filter((p) => p !== endpoint);
        axises = ["x", "y"];
      } else {
        return getFinalPosition();
      }

      // Snap to control points of other lines
      for (const cell of cells) {
        if (
          !(isEdgeCell(cell) || isLineDecoratorCell(cell)) ||
          cell === activeEditableLine
        ) {
          continue;
        }
        const editableLine = editableLineMap.get(cell);
        if (editableLine) {
          otherPoints.push(...editableLine.points.slice(1, -1));
        }
      }

      for (const point of otherPoints) {
        for (const axis of axises) {
          const newDiff = Math.abs(point[axis] - position[axis]);
          if (newDiff <= snapDistance && newDiff < diff[axis]) {
            position[axis] = point[axis];
            diff[axis] = newDiff;
          }
        }
      }

      return getFinalPosition();
    };
    const onMouseMove = (e: MouseEvent) => {
      const newConnectTo = getConnectTo(e);
      if (movedRef.current) {
        setConnectLineTo(newConnectTo);
      }
    };
    function onMouseUp(e: MouseEvent) {
      e.preventDefault();
      reset();

      if (!movedRef.current) {
        return;
      }

      const newConnectTo = getConnectTo(e);
      const isEdge = isEdgeCell(activeEditableLine!);

      if (lineEditorState?.type === "control") {
        if (isEdge) {
          const editableLine = editableLineMap.get(
            activeEditableLine!
          ) as EditableEdgeLine;
          const { source, target } = editableLine;
          onChangeEdgeView?.(source, target, {
            ...activeEditableLine!.view,
            vertices: getNewLineVertices(
              activeEditableLine!,
              lineEditorState,
              editableLineMap,
              newConnectTo
            ),
          });
        } else {
          onChangeDecoratorView?.(activeEditableLine!, {
            ...activeEditableLine!.view,
            vertices: getNewLineVertices(
              activeEditableLine!,
              lineEditorState,
              editableLineMap,
              newConnectTo
            ),
          });
        }
        return;
      }

      if (isEdge) {
        return;
      }

      switch (lineEditorState?.type) {
        case "entry":
        case "exit":
          onChangeDecoratorView?.(activeEditableLine!, {
            ...activeEditableLine!.view,
            [lineEditorState.type === "entry" ? "target" : "source"]: {
              x: newConnectTo[0],
              y: newConnectTo[1],
            },
          });
          break;
        case "corner":
          onChangeDecoratorView?.(activeEditableLine!, {
            ...activeEditableLine!.view,
            vertices: activeEditableLine!.view.vertices!.map((point, i) =>
              i === lineEditorState.control.index
                ? { x: newConnectTo[0], y: newConnectTo[1] }
                : point
            ),
          });
          break;
        case "break": {
          const newVertices = [...(activeEditableLine!.view.vertices ?? [])];
          newVertices.splice(lineEditorState.control.index, 0, {
            x: newConnectTo[0],
            y: newConnectTo[1],
          });
          onChangeDecoratorView?.(activeEditableLine!, {
            ...activeEditableLine!.view,
            vertices: newVertices,
          });
          break;
        }
      }
    }
    function reset() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      setConnectLineTo(null);
      setLineEditorState(null);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return reset;
  }, [
    activeEditableLine,
    editableLineMap,
    lineEditorState,
    transform,
    setLineEditorState,
    onChangeEdgeView,
    cells,
    onChangeDecoratorView,
  ]);

  useEffect(() => {
    if (!activeEditableLine) {
      return;
    }
    const handleBodyClick = (e: MouseEvent) => {
      if (movedRef.current) {
        e.stopPropagation();
        e.preventDefault();
      }
    };
    document.body.addEventListener("click", handleBodyClick);
    return () => {
      document.body.removeEventListener("click", handleBodyClick);
    };
  }, [activeEditableLine]);

  const line = useMemo(() => {
    const points = getEditingLinePoints(
      activeEditableLine,
      lineEditorState,
      editableLineMap,
      connectLineTo,
      hoverState
    );
    const view = activeEditableLine?.view as EditableLineView | undefined;
    return curveLine(
      points,
      view?.type === "curve" ? view.curveType : "curveLinear",
      0,
      1
    );
  }, [
    connectLineTo,
    hoverState,
    activeEditableLine,
    lineEditorState,
    editableLineMap,
  ]);
  let markerStart: string | undefined;
  let markerEnd: string | undefined;
  const lineMarkers: LineMarkerConf[] = getMarkers(options);
  for (const marker of lineMarkers) {
    if (marker.placement === "start") {
      markerStart = options.$editingStartMarkerUrl;
    } else {
      markerEnd = options.$editingEndMarkerUrl;
    }
  }

  return (
    <path
      className={classNames("editing-line", {
        editing: !!(lineEditorState && connectLineTo),
      })}
      d={line}
      fill="none"
      stroke={options.editingStrokeColor}
      markerStart={markerStart}
      markerEnd={markerEnd}
    />
  );
}
