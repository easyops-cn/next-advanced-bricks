import type { NodePosition } from "../../diagram/interfaces";

export function getLineLockIconPosition(
  linePoints: NodePosition[]
): NodePosition {
  const lastPoint = linePoints[linePoints.length - 1];
  if (linePoints.length < 2) {
    return {
      x: lastPoint.x + 16,
      y: lastPoint.y - 6,
    };
  }

  const firstPoint = linePoints[0];
  const dy = lastPoint.y - firstPoint.y;
  const dx = lastPoint.x - firstPoint.x;

  let useEndPoint: boolean;
  if (Math.abs(dy) > Math.abs(dx)) {
    useEndPoint = dy > 0;
  } else {
    useEndPoint = dx > 0;
  }

  const point1 = useEndPoint
    ? linePoints[linePoints.length - 2]
    : linePoints[1];
  const point2 = useEndPoint ? lastPoint : firstPoint;

  const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
  const twistedAngle = angle - (Math.PI * 3) / 4;
  const distance = 16;
  return {
    x: point2.x + Math.cos(twistedAngle) * distance - 6,
    y: point2.y + Math.sin(twistedAngle) * distance - 6,
  };
}
