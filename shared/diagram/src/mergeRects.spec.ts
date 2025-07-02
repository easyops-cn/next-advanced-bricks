import { Rect, mergeRects } from "./mergeRects";

describe("mergeRects", () => {
  it("should merge multiple rectangles into a single bounding rectangle", () => {
    const rects: Rect[] = [
      { x: 10, y: 10, width: 10, height: 10 },
      { x: 15, y: 15, width: 10, height: 10 },
    ];

    const result = mergeRects(rects);

    expect(result).toEqual({ x: 10, y: 10, width: 15, height: 15 });
  });

  it("should handle a single rectangle", () => {
    const rects: Rect[] = [{ x: 10, y: 10, width: 10, height: 10 }];

    const result = mergeRects(rects);

    expect(result).toEqual({ x: 10, y: 10, width: 10, height: 10 });
  });

  it("should handle rectangles with negative coordinates", () => {
    const rects: Rect[] = [
      { x: -10, y: -10, width: 5, height: 5 },
      { x: 5, y: 5, width: 5, height: 5 },
    ];

    const result = mergeRects(rects);

    expect(result).toEqual({ x: -10, y: -10, width: 20, height: 20 });
  });

  it("should handle non-overlapping rectangles", () => {
    const rects: Rect[] = [
      { x: 0, y: 0, width: 5, height: 5 },
      { x: 10, y: 10, width: 5, height: 5 },
    ];

    const result = mergeRects(rects);

    expect(result).toEqual({ x: 0, y: 0, width: 15, height: 15 });
  });

  it("should handle partially overlapping rectangles", () => {
    const rects: Rect[] = [
      { x: 5, y: 5, width: 10, height: 10 },
      { x: 0, y: 0, width: 10, height: 10 },
    ];

    const result = mergeRects(rects);

    expect(result).toEqual({ x: 0, y: 0, width: 15, height: 15 });
  });

  it("should handle empty array", () => {
    const rects: Rect[] = [];

    const result = mergeRects(rects);

    expect(result).toEqual({
      x: Infinity,
      y: Infinity,
      width: -Infinity,
      height: -Infinity,
    });
  });
});
