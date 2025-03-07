import { getLinePath } from "./getLinePath";

describe("getLinePath", () => {
  it("should calculate path correctly with provided min and max", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 15 },
    ];
    const xField = "x";
    const yField = "y";
    const min = 0;
    const max = 20;
    const width = 100;
    const height = 100;

    const result = getLinePath(data, xField, yField, min, max, width, height);

    expect(result).toEqual([
      [0, 50],
      [50, 0],
      [100, 25],
    ]);
  });

  it("should calculate min and max from data when not provided", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 15 },
    ];
    const xField = "x";
    const yField = "y";
    const width = 100;
    const height = 100;

    const result = getLinePath(
      data,
      xField,
      yField,
      undefined,
      undefined,
      width,
      height
    );

    expect(result).toEqual([
      [0, 100],
      [50, 0],
      [100, 50],
    ]);
  });

  it("should handle min and max being equal", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 10 },
      { x: 2, y: 10 },
    ];
    const xField = "x";
    const yField = "y";
    const min = 10;
    const max = 10;
    const width = 100;
    const height = 100;

    const result = getLinePath(data, xField, yField, min, max, width, height);

    expect(result).toEqual([
      [0, 50],
      [100, 50],
    ]);
  });

  it("should handle partial min/max information", () => {
    const data = [
      { x: 0, y: 10 },
      { x: 1, y: 20 },
      { x: 2, y: 15 },
    ];

    // Only min provided
    const result1 = getLinePath(data, "x", "y", 5, undefined, 100, 100);
    expect(result1[0][1]).toBeLessThan(100); // y should be less than height

    // Only max provided
    const result2 = getLinePath(data, "x", "y", undefined, 25, 100, 100);
    expect(result2[1][1]).toBeGreaterThan(0); // y should be greater than 0
  });
});
