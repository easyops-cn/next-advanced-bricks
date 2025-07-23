import { describe, test, expect } from "@jest/globals";
import { computeBoundingBox } from "./computeBoundingBox";
import { BaseNodeCell } from "../interfaces";
describe("computeBoundingBox", () => {
  test("should return an empty object for an empty array", () => {
    const cells: BaseNodeCell[] = [];
    const result = computeBoundingBox(cells);
    expect(result).toEqual({});
  });
  test("should calculate the correct container rect for mixed finite and non-finite values", () => {
    const cells = [
      { view: { x: -268, y: 15, width: 60, height: 60 } },
      { view: { x: -185, y: -73, width: 60, height: 60 } },
      { view: { x: 0, y: 42, width: 60, height: 60 } },
      { view: { x: -24, y: 0, width: 60, height: 60 } },
    ] as unknown as BaseNodeCell[];

    const result = computeBoundingBox(cells);
    expect(result).toEqual({
      x: -308,
      y: -113,
      width: 408,
      height: 255,
    });
  });
});
