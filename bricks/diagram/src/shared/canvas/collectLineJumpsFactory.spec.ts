import { collectLineJumpsFactory } from "./collectLineJumpsFactory";
import type { NodePosition } from "../../diagram/interfaces";
import type { ComputedEdgeLineConf } from "../../draw-canvas/interfaces";

describe("collectLineJumpsFactory", () => {
  const collectLineJumps = collectLineJumpsFactory();

  it("should return null for curved lines", () => {
    const points: NodePosition[] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    const lineConf = {
      type: "curve",
      curveType: "curveBasis",
      strokeWidth: 2,
      jumps: true,
    } as unknown as ComputedEdgeLineConf;

    const result = collectLineJumps(points, lineConf);
    expect(result).toBeNull();
  });

  it("should return null for lines without jumps", () => {
    const points: NodePosition[] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    const lineConf = {
      type: "straight",
      strokeWidth: 2,
      jumps: false,
    } as unknown as ComputedEdgeLineConf;

    const result = collectLineJumps(points, lineConf);
    expect(result).toBeNull();
  });

  it("should return a map of line jumps for intersecting lines", () => {
    const points1: NodePosition[] = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];
    const points2: NodePosition[] = [
      { x: 0, y: 10 },
      { x: 10, y: 0 },
    ];
    const points3: NodePosition[] = [
      { x: 4, y: 0 },
      { x: 4, y: 20 },
    ];
    const points4: NodePosition[] = [
      { x: 0, y: 15 },
      { x: 10, y: 15 },
    ];
    const lineConf = {
      type: "straight",
      strokeWidth: 2,
      jumps: true,
    } as unknown as ComputedEdgeLineConf;

    collectLineJumps(points1, lineConf);
    const result = collectLineJumps(points2, lineConf);

    expect(result).toMatchInlineSnapshot(`
      Map {
        0 => {
          "index": 0,
          "jumpPoints": [
            {
              "x": 5,
              "y": 5,
            },
            {
              "x": 5,
              "y": 5,
            },
          ],
          "radius": 4,
        },
      }
    `);

    // Ignore this jump point if it's too close to an existing one
    const result3 = collectLineJumps(points3, lineConf);
    expect(result3).toBeNull();

    const result4 = collectLineJumps(points4, lineConf);
    expect(result4).toMatchInlineSnapshot(`
      Map {
        0 => {
          "index": 0,
          "jumpPoints": [
            {
              "x": 4,
              "y": 15,
            },
          ],
          "radius": 4,
        },
      }
    `);
  });

  it("should not create jumps for non-intersecting lines", () => {
    const points1: NodePosition[] = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
    ];
    const points2: NodePosition[] = [
      { x: 0, y: 10 },
      { x: 10, y: 10 },
    ];
    const lineConf = {
      type: "straight",
      strokeWidth: 2,
      jumps: true,
    } as unknown as ComputedEdgeLineConf;

    collectLineJumps(points1, lineConf);
    const result = collectLineJumps(points2, lineConf);

    expect(result).toBeNull();
  });
});
