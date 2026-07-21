import { describe, expect, test } from "@jest/globals";
import type { Cell } from "../../../draw-canvas/interfaces";
import { getCellsRect } from "./getCellsRect";

describe("getCellsRect", () => {
  const cells = [
    {
      type: "decorator",
      decorator: "area",
      id: "area-1",
      view: {
        x: -1000,
        y: -100,
        width: 200,
        height: 200,
      },
    },
    {
      type: "node",
      id: "node-1",
      view: {
        x: 100,
        y: 80,
        width: 120,
        height: 60,
      },
    },
    {
      type: "node",
      id: "node-2",
      view: {
        x: 300,
        y: 180,
        width: 120,
        height: 60,
      },
    },
    {
      type: "edge",
      source: "node-1",
      target: "node-2",
    },
  ] as Cell[];

  test("uses all non-edge cells by default", () => {
    expect(getCellsRect(cells)).toEqual({
      left: -1000,
      top: -100,
      width: 1420,
      height: 340,
      empty: false,
    });
  });

  test("uses only nodes when center target is nodes", () => {
    expect(getCellsRect(cells, "nodes")).toEqual({
      left: 100,
      top: 80,
      width: 320,
      height: 160,
      empty: false,
    });
  });

  test("returns empty rect when center target is nodes and no nodes exist", () => {
    expect(getCellsRect([cells[0]], "nodes")).toEqual({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      empty: true,
    });
  });
});
