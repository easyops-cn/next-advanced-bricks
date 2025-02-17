import { pick } from "lodash";
import type { NodePosition, PositionTuple } from "../../../diagram/interfaces";
import type { HoverState } from "../../../draw-canvas/HoverStateContext";
import type {
  LineEditorState,
  LineEditorStateOfControl,
  EditableLine,
  EditableLineCell,
  EditableLineView,
  DecoratorLineView,
  NodeView,
} from "../../../draw-canvas/interfaces";
import { getSmartLinePoints, simplifyVertices } from "./getSmartLinePoints";
import { isEditableEdgeLine } from "../../../draw-canvas/processors/asserts";

export function getEditingLinePoints(
  activeEditableLine: EditableLineCell | null,
  lineEditorState: LineEditorState | null,
  editableLineMap: WeakMap<EditableLineCell, EditableLine>,
  connectLineTo: PositionTuple | null,
  hoverState: HoverState | null
): NodePosition[] | null {
  if (
    !activeEditableLine ||
    !lineEditorState ||
    !(
      connectLineTo ||
      (lineEditorState.type !== "control" &&
        hoverState?.activePointIndex !== undefined)
    )
  ) {
    return null;
  }

  const { type } = lineEditorState;
  const editableLine = editableLineMap.get(activeEditableLine)!;
  let sourceView: NodeView;
  let targetView: NodeView;

  const cellType = activeEditableLine.type;
  if (isEditableEdgeLine(editableLine)) {
    sourceView = editableLine.source.view;
    targetView = editableLine.target.view;
  } else {
    const view = editableLine.decorator.view as DecoratorLineView;
    sourceView = { ...view.source, width: 0, height: 0 };
    targetView = { ...view.target, width: 0, height: 0 };
  }
  const view = activeEditableLine.view as EditableLineView;
  const { exitPosition, entryPosition, vertices } = view ?? {};
  const lineSettings = pick(view, ["type", "curveType"]);

  if (type === "control") {
    const newVertices = getNewLineVertices(
      activeEditableLine,
      lineEditorState,
      editableLineMap,
      connectLineTo!
    );

    return getSmartLinePoints(
      sourceView,
      targetView,
      {
        ...lineSettings,
        exitPosition,
        entryPosition,
        vertices: newVertices,
      },
      0,
      cellType
    );
  }

  if (type === "corner") {
    const newVertices = [...vertices!];
    newVertices.splice(lineEditorState.control.index, 1, {
      x: connectLineTo![0],
      y: connectLineTo![1],
    });

    return getSmartLinePoints(
      sourceView,
      targetView,
      {
        ...lineSettings,
        exitPosition,
        entryPosition,
        vertices: newVertices,
      },
      0,
      cellType
    );
  }

  if (type === "break") {
    const newVertices = [...(vertices ?? [])];
    newVertices.splice(lineEditorState.control.index, 0, {
      x: connectLineTo![0],
      y: connectLineTo![1],
    });

    return getSmartLinePoints(
      sourceView,
      targetView,
      {
        ...lineSettings,
        exitPosition,
        entryPosition,
        vertices: newVertices,
      },
      0,
      cellType
    );
  }

  if (cellType === "edge" && hoverState?.activePointIndex !== undefined) {
    const position = hoverState.relativePoints[hoverState.activePointIndex];
    // Assert `hoverState.cell` is `target`
    return getSmartLinePoints(
      sourceView,
      targetView,
      {
        ...lineSettings,
        ...(type === "entry"
          ? {
              exitPosition,
              entryPosition: position,
            }
          : {
              exitPosition: position,
              entryPosition,
            }),
        vertices,
      },
      0,
      cellType
    );
  }

  const [x1, y1] = connectLineTo!;

  if (type === "entry") {
    return getSmartLinePoints(
      sourceView,
      { x: x1, y: y1, width: 0, height: 0 },
      { ...lineSettings, exitPosition, vertices },
      0,
      cellType
    );
  }

  return getSmartLinePoints(
    { x: x1, y: y1, width: 0, height: 0 },
    targetView,
    { ...lineSettings, entryPosition, vertices },
    0,
    cellType
  );
}

export function getNewLineVertices(
  activeEditableLine: EditableLineCell,
  lineEditorState: LineEditorStateOfControl,
  editableLineMap: WeakMap<EditableLineCell, EditableLine>,
  connectLineTo: PositionTuple
) {
  const { control } = lineEditorState;
  const { points: linePoints } = editableLineMap.get(activeEditableLine)!;
  const newVertices: NodePosition[] = [];
  const [x1, y1] = connectLineTo!;
  const exitPoint = linePoints[0];
  const entryPoint = linePoints[linePoints.length - 1];

  // If moving the first control, prepend a vertex to connect the control to the source
  if (control.index === 0) {
    newVertices.push(
      control.direction === "ns"
        ? { x: exitPoint.x, y: y1 }
        : { x: x1, y: exitPoint.y }
    );
  }

  // Adjust the related two controls, and leave other controls unchanged
  for (let i = 1; i < linePoints.length - 1; i++) {
    const vertex = linePoints[i];
    newVertices.push(
      i === control.index || i === control.index + 1
        ? control.direction === "ns"
          ? { x: vertex.x, y: y1 }
          : { x: x1, y: vertex.y }
        : vertex
    );
  }

  // If moving the last control, append a vertex to connect the control to the target
  if (control.index === linePoints.length - 2) {
    newVertices.push(
      control.direction === "ns"
        ? { x: entryPoint.x, y: y1 }
        : { x: x1, y: entryPoint.y }
    );
  }

  return simplifyVertices(exitPoint, newVertices, entryPoint);
}
