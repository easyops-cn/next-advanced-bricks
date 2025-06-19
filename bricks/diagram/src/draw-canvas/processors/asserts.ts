import { isNil } from "lodash";
import type {
  Cell,
  DecoratorCell,
  EdgeCell,
  EditableEdgeLine,
  EditableLine,
  InitialCell,
  InitialNodeCell,
  InitialNodeView,
  LayoutType,
  LineDecoratorCell,
  LineType,
  NodeCell,
} from "../interfaces";
import { MoveCellPayload } from "../reducers/interfaces";

export function isNodeCell(cell: Cell | MoveCellPayload): cell is NodeCell {
  return cell.type === "node";
}

export function isDecoratorCell(cell: Cell): cell is DecoratorCell {
  return cell.type === "decorator";
}

export function isInitialNodeCell(cell: InitialCell): cell is InitialNodeCell {
  return cell.type === "node";
}

export function isEdgeCell(cell: InitialCell): cell is EdgeCell {
  return cell.type === "edge";
}

export function isNodeOrEdgeCell(cell: Cell): cell is NodeCell | EdgeCell {
  return cell.type === "node" || cell.type === "edge";
}

export function isNodeOrAreaDecoratorCell(
  cell: Cell
): cell is NodeCell | DecoratorCell {
  return (
    cell.type === "node" ||
    (cell.type === "decorator" && cell.decorator === "area")
  );
}

export function isEdgeSide(
  cell: Cell,
  allowEdgeToArea: boolean | undefined
): cell is NodeCell | DecoratorCell {
  return (
    cell.type === "node" ||
    (!!allowEdgeToArea &&
      cell.type === "decorator" &&
      cell.decorator === "area")
  );
}

export function isNodeOrTextDecoratorCell(
  cell: Cell | MoveCellPayload
): cell is NodeCell | DecoratorCell {
  return (
    cell.type === "node" ||
    (cell.type === "decorator" && cell.decorator === "text")
  );
}

export function isTextDecoratorCell(cell: Cell): cell is DecoratorCell {
  return cell.type === "decorator" && cell.decorator === "text";
}
export function isContainerDecoratorCell(
  cell: InitialCell | MoveCellPayload
): cell is DecoratorCell {
  return cell.type === "decorator" && cell.decorator === "container";
}

// export function isRectDecoratorCell(
//   cell: Cell | MoveCellPayload
// ): cell is DecoratorCell {
//   return cell.type === "decorator" && cell.decorator === "rect";
// }

export function isLineDecoratorCell(
  cell: Cell | LineDecoratorCell | MoveCellPayload
): cell is LineDecoratorCell {
  return cell.type === "decorator" && cell.decorator === "line";
}

export function isNoManualLayout(layout: LayoutType) {
  return !["manual", undefined].includes(layout!);
}

export function isNoSize(view: InitialNodeView) {
  return !(view.width && view.height);
}

export function isNoPoint(view: InitialNodeView) {
  return isNil(view.x) || isNil(view.y);
}

export function isStraightType(type: LineType | undefined) {
  return !(type === "polyline" || type === "curve");
}

export function isEditableEdgeLine(
  line: EditableLine
): line is EditableEdgeLine {
  return !!(line as EditableEdgeLine).edge;
}
