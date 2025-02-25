import {
  curveLinear,
  line,
  curveBasis,
  curveBumpX,
  curveBumpY,
  type CurveFactory,
  curveMonotoneX,
  curveNatural,
  curveMonotoneY,
} from "d3-shape";
import type { CurveType, NodePosition } from "../interfaces";
import type { LineSegmentJumps } from "../../draw-canvas/interfaces";

/**
 * Generate Line from points
 */
export function curveLine(
  points: Array<NodePosition> | null | undefined,
  curveType: CurveType | undefined,
  startOffset: number,
  endOffset: number,
  jumpsMap?: Map<number, LineSegmentJumps> | null
): string {
  if (!Array.isArray(points)) {
    return "";
  }
  let curveFactory: CurveFactory;
  switch (curveType) {
    case "curveLinear":
      curveFactory = curveLinear;
      break;
    case "curveBumpX":
      curveFactory = curveBumpX;
      break;
    case "curveBumpY":
      curveFactory = curveBumpY;
      break;
    case "curveMonotoneX":
      curveFactory = curveMonotoneX;
      break;
    case "curveMonotoneY":
      curveFactory = curveMonotoneY;
      break;
    case "curveNatural":
      curveFactory = curveNatural;
      break;
    default:
      curveFactory = curveBasis;
  }
  const startOffsets = getOffsets(points[1], points[0], startOffset);
  const endOffsets = getOffsets(
    points[points.length - 2],
    points[points.length - 1],
    endOffset
  );
  const lineFunction = line<NodePosition>()
    .x(
      (d, index) =>
        d.x -
        (index === 0
          ? startOffsets.x
          : index === points.length - 1
            ? endOffsets.x
            : 0)
    )
    .y(
      (d, index) =>
        d.y -
        (index === 0
          ? startOffsets.y
          : index === points.length - 1
            ? endOffsets.y
            : 0)
    )
    .curve(curveFactory);

  if (jumpsMap && curveType == "curveLinear") {
    const d: string[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      if (i === 0) {
        d.push(`M${start.x},${start.y}`);
      }
      // 处理交叉跨线点
      const jump = jumpsMap.get(i);
      if (jump) {
        // 跨线点近似为一段半圆，参考 draw.io 使用三次贝赛尔曲线实现。
        // 一条 jump 记录中所有的 jumpPoints 都在同一线段上，因此角度一致、尺寸一致。
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        const direction = Math.abs(angle) <= Math.PI / 2 ? -1 : 1;
        const verticalAngle = angle + (Math.PI / 2) * direction;
        const offsetX = jump.radius * 1.3 * Math.cos(verticalAngle);
        const offsetY = jump.radius * 1.3 * Math.sin(verticalAngle);
        const xDiff = jump.radius * Math.cos(angle);
        const yDiff = jump.radius * Math.sin(angle);
        for (const p of jump.jumpPoints) {
          const x0 = p.x - xDiff;
          const y0 = p.y - yDiff;
          const x1 = p.x + xDiff;
          const y1 = p.y + yDiff;
          d.push(`L${x0},${y0}`);
          d.push(
            `C${x0 + offsetX},${y0 + offsetY} ${x1 + offsetX},${y1 + offsetY} ${x1},${y1}`
          );
        }
      }
      d.push(`L${end.x},${end.y}`);
    }
    return d.join("");
  }

  return lineFunction(points)!;
}

function getOffsets(
  start: NodePosition,
  end: NodePosition,
  offset: number
): NodePosition {
  if (!offset) {
    return { x: 0, y: 0 };
  }
  const { x: x0, y: y0 } = start;
  const { x: x1, y: y1 } = end;
  const distance = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
  const ratio = offset / distance;
  return {
    x: (x1 - x0) * ratio,
    y: (y1 - y0) * ratio,
  };
}
