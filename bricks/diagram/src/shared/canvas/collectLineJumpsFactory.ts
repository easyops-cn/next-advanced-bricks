import { sortBy } from "lodash";
import type {
  ComputedEdgeLineConf,
  LineSegmentJumps,
} from "../../draw-canvas/interfaces";
import type { NodePosition } from "../../diagram/interfaces";
import { intersect } from "../../diagram/lines/intersect";

interface LineSegment {
  start: NodePosition;
  end: NodePosition;
}

const LINE_JUMP_BASE_SIZE = 6;

export function collectLineJumpsFactory() {
  const allJumps: LineSegmentJumps[] = [];
  const allLineSegments: LineSegment[] = [];

  return function collectLineJumps(
    points: NodePosition[],
    lineConf: ComputedEdgeLineConf
  ): Map<number, LineSegmentJumps> | null {
    const lineJumps: LineSegmentJumps[] = [];
    const lineSegments: LineSegment[] = [];

    // Line jumps for curved lines are not supported.
    if (lineConf.type !== "curve" || lineConf.curveType === "curveLinear") {
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        const jumpPoints: NodePosition[] = [];
        const radius = LINE_JUMP_BASE_SIZE / 2 + lineConf.strokeWidth - 1;
        if (lineConf.jumps) {
          jumpLoop: for (const item of allLineSegments) {
            const point = lineJumpIntersect(
              start,
              end,
              item.start,
              item.end,
              radius
            );
            if (point) {
              for (const jump of allJumps) {
                for (const p of jump.jumpPoints) {
                  const distance = Math.sqrt(
                    Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2)
                  );
                  if (distance < radius + jump.radius) {
                    // Ignore this jump point if it's too close to an existing one
                    continue jumpLoop;
                  }
                }
              }

              jumpPoints.push(point);
            }
          }
        }

        if (jumpPoints.length > 0) {
          // 将交叉点按其在连线上的顺序排列
          const sortedJumpPoints = sortBy(
            jumpPoints,
            (p) => (p.x - points[0].x) ** 2 + (p.y - points[0].y) ** 2
          );

          const segJumps: LineSegmentJumps = {
            jumpPoints: sortedJumpPoints,
            index: i,
            radius,
          };
          allJumps.push(segJumps);
          lineJumps.push(segJumps);
        }

        lineSegments.push({ start, end });
      }

      // 同一连线上的不同线段交叉时，不产生跨线
      allLineSegments.push(...lineSegments);
    }

    return lineJumps.length > 0
      ? new Map(lineJumps.map((j) => [j.index, j]))
      : null;
  };
}

function lineJumpIntersect(
  p1: NodePosition,
  p2: NodePosition,
  p3: NodePosition,
  p4: NodePosition,
  radius: number
): NodePosition | null {
  const point = intersect(
    [p1.x, p1.y],
    [p2.x, p2.y],
    [p3.x, p3.y],
    [p4.x, p4.y]
  );
  if (point) {
    // Check if the intersection point is too close to the line ends
    const r2 = radius * radius;
    for (const p of [p1, p2, p3, p4]) {
      const dx = point[0] - p.x;
      const dy = point[1] - p.y;
      if (dx * dx + dy * dy < r2) {
        return null;
      }
    }
    return { x: point[0], y: point[1] };
  }
  return null;
}
