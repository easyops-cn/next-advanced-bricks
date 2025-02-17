import type { Reducer } from "react";
import { pick } from "lodash";
import type { DrawCanvasAction } from "./interfaces";
import type {
  Cell,
  DecoratorCell,
  DecoratorType,
  EdgeCell,
  NodeCell,
} from "../interfaces";
import { isNodeCell } from "../processors/asserts";
import { SYMBOL_FOR_SIZE_INITIALIZED } from "../constants";

type CellOrder = CellOrderOfDecorator | CellOrderOfOthers;

interface CellOrderOfDecorator {
  type: "decorator";
  decorators: DecoratorType[];
}

interface CellOrderOfOthers {
  type: "node" | "edge";
}

// NOTE: keep the cells in the following order by default, when adding new cells:
//   1. decorators other than text
//   2. edges
//   3. nodes
//   4. decorators of text
const DEFAULT_CELL_ORDERS: CellOrder[] = [
  {
    type: "decorator",
    decorators: ["line", "area", "container", "rect"],
  },
  { type: "edge" },
  { type: "node" },
  { type: "decorator", decorators: ["text"] },
];

export const cells: Reducer<Cell[], DrawCanvasAction> = (state, action) => {
  switch (action.type) {
    case "drop-node":
    case "drop-decorator":
      return insertCell(state, action.payload);
    case "add-nodes":
      return insertCells(state, action.payload);
    case "add-edge": {
      // If the new edge between the source and target already exists, override the old one.
      const existedEdgeIndex = state.findIndex(
        (cell) =>
          cell.type === "edge" &&
          cell.source === action.payload.source &&
          cell.target === action.payload.target
      );
      if (existedEdgeIndex === -1) {
        // Add the edge to just next to the previous last edge or area decorator.
        // If not found, append to the start.
        return insertCell(state, action.payload);
      }
      return [
        ...state.slice(0, existedEdgeIndex),
        action.payload,
        ...state.slice(existedEdgeIndex + 1),
      ];
    }
    case "change-edge-view": {
      const existedEdgeIndex = state.findIndex(
        (cell) =>
          cell.type === "edge" &&
          cell.source === action.payload.source &&
          cell.target === action.payload.target
      );
      return existedEdgeIndex === -1
        ? state
        : [
            ...state.slice(0, existedEdgeIndex),
            {
              ...(state[existedEdgeIndex] as EdgeCell),
              view: action.payload.view,
            },
            ...state.slice(existedEdgeIndex + 1),
          ];
    }
    case "change-decorator-view": {
      const existedDecoratorIndex = state.findIndex(
        (cell) => cell.type === "decorator" && cell.id === action.payload.id
      );
      return existedDecoratorIndex === -1
        ? state
        : [
            ...state.slice(0, existedDecoratorIndex),
            {
              ...(state[existedDecoratorIndex] as EdgeCell),
              view: action.payload.view,
            },
            ...state.slice(existedDecoratorIndex + 1),
          ];
    }
    case "move-cells": {
      let matched = false;
      const newState = state.map((cell) => {
        const newCell = action.payload.find(
          (move) => cell.type === move.type && cell.id === move.id
        );
        if (newCell) {
          matched = true;
          return {
            ...(cell as NodeCell),
            view: {
              ...(cell as NodeCell).view,
              x: newCell.x,
              y: newCell.y,
              ...pick(newCell, "source", "target", "vertices"),
            },
          };
        }
        return cell;
      });
      return matched ? newState : state;
    }
    case "resize-cell": {
      const { type, id, width, height } = action.payload;
      const index = state.findIndex(
        (cell) => cell.type === type && cell.id === id
      );
      if (index !== -1) {
        const node = state[index] as NodeCell;
        return [
          ...state.slice(0, index),
          { ...node, view: { ...node.view, width, height } },
          ...state.slice(index + 1),
        ];
      }
      return state;
    }
    case "update-cells":
      return action.payload;
    case "update-node-size":
      return state.map((cell) =>
        isNodeCell(cell) && cell.id === action.payload.id
          ? {
              ...cell,
              [SYMBOL_FOR_SIZE_INITIALIZED]: true,
              view: action.payload.size
                ? {
                    ...cell.view,
                    width: action.payload.size[0],
                    height: action.payload.size[1],
                  }
                : cell.view,
            }
          : cell
      );
  }
  return state;
};

function insertCell(cells: Cell[], newCell: Cell): Cell[] {
  return insertCells(cells, [newCell]);
}

/**
 * Insert new cells (with same types and some decorators) to the cells.
 */
function insertCells(cells: Cell[], newCells: Cell[]): Cell[] {
  if (newCells.length === 0) {
    return cells;
  }
  const index = DEFAULT_CELL_ORDERS.findIndex((order) =>
    matchCellOrder(newCells[0], order)
  );

  // istanbul ignore next
  if (index === -1) {
    // eslint-disable-next-line no-console
    console.warn(
      "Default order index unhandled for the cell: %o.\n%s",
      newCells[0],
      "This is a bug of diagram-NB, please report it."
    );
  }

  const lastIndex = cells.findLastIndex(
    (cell) =>
      DEFAULT_CELL_ORDERS.findIndex((order) => matchCellOrder(cell, order)) <=
      index
  );
  const targetIndex = lastIndex + 1;
  return [
    ...cells.slice(0, targetIndex),
    ...newCells,
    ...cells.slice(targetIndex),
  ];
}

function matchCellOrder(cell: Cell, order: CellOrder) {
  return (
    cell.type === order.type &&
    (order.type !== "decorator" ||
      order.decorators.includes((cell as DecoratorCell).decorator))
  );
}
