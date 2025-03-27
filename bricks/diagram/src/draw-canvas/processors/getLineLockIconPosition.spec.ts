import { getLineLockIconPosition } from "./getLineLockIconPosition";
import type { NodePosition } from "../../diagram/interfaces";

describe("getLineLockIconPosition", () => {
  it("should handle line with less than 2 points", () => {
    const linePoints: NodePosition[] = [{ x: 100, y: 100 }];
    const result = getLineLockIconPosition(linePoints);

    expect(result).toEqual({
      x: 116, // 100 + 16
      y: 94, // 100 - 6
    });
  });

  it("should position icon when vertical movement is dominant and positive", () => {
    // dy > dx and dy > 0, should use end point
    const linePoints: NodePosition[] = [
      { x: 100, y: 100 },
      { x: 110, y: 200 },
    ];

    const result = getLineLockIconPosition(linePoints);

    // Using end point (110, 200) with point1 = first point (100, 100)
    // angle = atan2(100, 10) ≈ 1.4711 radians
    // twistedAngle ≈ 1.4711 - 3π/4 ≈ -0.885 radians
    expect(result.x).toBeCloseTo(110 + Math.cos(-0.885) * 16 - 6, 1);
    expect(result.y).toBeCloseTo(200 + Math.sin(-0.885) * 16 - 6, 1);
  });

  it("should position icon when vertical movement is dominant and negative", () => {
    // dy > dx and dy < 0, should use start point
    const linePoints: NodePosition[] = [
      { x: 100, y: 200 },
      { x: 110, y: 100 },
    ];

    const result = getLineLockIconPosition(linePoints);

    // Using start point (100, 200) with point1 = second point (110, 100)
    // angle = atan2(100, -10) ≈ 1.6705 radians
    // twistedAngle ≈ 1.6705 - 3π/4 ≈ -0.885 radians
    expect(result.x).toBeCloseTo(100 + Math.cos(-0.6857) * 16 - 6, 1);
    expect(result.y).toBeCloseTo(200 + Math.sin(-0.6857) * 16 - 6, 1);
  });

  it("should position icon when horizontal movement is dominant and positive", () => {
    // dx > dy and dx > 0, should use end point
    const linePoints: NodePosition[] = [
      { x: 100, y: 100 },
      { x: 200, y: 110 },
    ];

    const result = getLineLockIconPosition(linePoints);

    // Using end point (200, 110) with point1 = first point (100, 100)
    // angle = atan2(10, 100) ≈ 0.1 radians
    // twistedAngle ≈ 0.1 - 3π/4 ≈ -2.26 radians
    expect(result.x).toBeCloseTo(200 + Math.cos(-2.26) * 16 - 6, 1);
    expect(result.y).toBeCloseTo(110 + Math.sin(-2.26) * 16 - 6, 1);
  });

  it("should position icon when horizontal movement is dominant and negative", () => {
    // dx > dy and dx < 0, should use start point
    const linePoints: NodePosition[] = [
      { x: 200, y: 100 },
      { x: 100, y: 110 },
    ];

    const result = getLineLockIconPosition(linePoints);

    // Using start point (200, 100) with point1 = second point (100, 110)
    // angle = atan2(-10, 100) ≈ -0.0997 radians
    // twistedAngle ≈ -0.0997 - 3π/4 ≈ -2.4559 radians
    expect(result.x).toBeCloseTo(200 + Math.cos(-2.4559) * 16 - 6, 1);
    expect(result.y).toBeCloseTo(100 + Math.sin(-2.4559) * 16 - 6, 1);
  });

  it("should handle line with multiple points", () => {
    const linePoints: NodePosition[] = [
      { x: 100, y: 100 },
      { x: 150, y: 120 },
      { x: 200, y: 150 },
      { x: 250, y: 200 },
    ];

    const result = getLineLockIconPosition(linePoints);

    // Using end point (250, 200) with point1 = second-to-last point (200, 150)
    // angle = atan2(50, 50) ≈ 0.79 radians
    // twistedAngle ≈ 0.79 - 3π/4 ≈ -1.57 radians
    expect(result.x).toBeCloseTo(250 + Math.cos(-1.57) * 16 - 6, 1);
    expect(result.y).toBeCloseTo(200 + Math.sin(-1.57) * 16 - 6, 1);
  });
});
