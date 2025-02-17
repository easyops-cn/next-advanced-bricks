// istanbul ignore file: nothing logical to test
import React from "react";
import type {
  DecoratorCell,
  DecoratorLineView,
  DecoratorView,
  EdgeView,
  EditableLineCell,
  LineEditorState,
  NodeCell,
  SmartConnectLineState,
} from "./interfaces";
import type { NodePosition } from "../diagram/interfaces";

export interface HoverState {
  // Currently only support node cell
  cell: NodeCell | DecoratorCell;
  relativePoints: ReadonlyArray<NodePosition>;
  points: ReadonlyArray<NodePosition>;
  activePointIndex?: number;
}

export const HoverStateContext = React.createContext<{
  rootRef: React.RefObject<SVGSVGElement>;
  smartConnectLineState: SmartConnectLineState | null;
  unsetHoverStateTimeoutRef: React.MutableRefObject<number | null>;
  hoverState: HoverState | null;
  activeEditableLines: EditableLineCell[];
  lineEditorState: LineEditorState | null;
  movingCells?: boolean;
  setLineEditorState: React.Dispatch<
    React.SetStateAction<LineEditorState | null>
  >;
  setHoverState: React.Dispatch<React.SetStateAction<HoverState | null>>;
  setSmartConnectLineState: React.Dispatch<
    React.SetStateAction<SmartConnectLineState | null>
  >;
  onConnect?: (
    source: NodeCell | DecoratorCell,
    target: NodeCell | DecoratorCell,
    exitPosition: NodePosition,
    entryPosition: NodePosition | undefined
  ) => void;
  onChangeEdgeView?: (
    source: NodeCell | DecoratorCell,
    target: NodeCell | DecoratorCell,
    view: EdgeView
  ) => void;
  onChangeDecoratorView?: (
    cell: DecoratorCell,
    view: DecoratorView | DecoratorLineView
  ) => void;
}>({
  rootRef: { current: null },
  smartConnectLineState: null,
  unsetHoverStateTimeoutRef: { current: null },
  hoverState: null,
  activeEditableLines: [],
  lineEditorState: null,
  setLineEditorState: () => {},
  setHoverState: () => {},
  setSmartConnectLineState: () => {},
});

export function useHoverStateContext() {
  return React.useContext(HoverStateContext);
}
