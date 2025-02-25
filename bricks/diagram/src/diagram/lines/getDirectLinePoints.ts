import type { EdgeView } from "../../draw-canvas/interfaces";
import type { NodePosition, NodeRect, PositionTuple } from "../interfaces";
import { doTwoNodesOverlap } from "../processors/doTwoNodesOverlap";
import { intersect } from "./intersect";

type LineTuple = [start: PositionTuple, end: PositionTuple];

export function getDirectLinePoints(
  source: NodeRect,
  target: NodeRect,
  parallelGap?: number,
  edgeView?: EdgeView
): NodePosition[] | null {
  const hasExitPosition = !!edgeView?.exitPosition;
  const hasEntryPosition = !!edgeView?.entryPosition;

  // Ignore if two nodes are the same.
  // Ignore if two nodes overlap and no entry nor exit position.
  if (
    source === target ||
    (doTwoNodesOverlap(source, target, 0, 0) &&
      !(hasExitPosition || hasEntryPosition))
  ) {
    return null;
  }

  let p0: PositionTuple;
  let p1: PositionTuple;

  let xDiff = 0;
  let yDiff = 0;

  if (parallelGap) {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const angle = Math.atan2(dy, dx);
    xDiff = (parallelGap / 2) * Math.cos(angle + Math.PI / 2);
    yDiff = (parallelGap / 2) * Math.sin(angle + Math.PI / 2);
  }

  const line: LineTuple = [
    hasExitPosition
      ? [
          source.x + (edgeView!.exitPosition!.x - 0.5) * source.width,
          source.y + (edgeView!.exitPosition!.y - 0.5) * source.height,
        ]
      : [source.x + xDiff, source.y + yDiff],
    hasEntryPosition
      ? [
          target.x + (edgeView!.entryPosition!.x - 0.5) * target.width,
          target.y + (edgeView!.entryPosition!.y - 0.5) * target.height,
        ]
      : [target.x + xDiff, target.y + yDiff],
  ];

  if (hasExitPosition) {
    p0 = line[0];
  } else {
    const sourceIntersections = getIntersections(source, line);
    // Todo: handle when more than one intersection
    if (sourceIntersections.length > 0) {
      p0 = sourceIntersections[0];
    } else {
      p0 = [source.x, source.y];
    }
  }

  if (hasEntryPosition) {
    p1 = line[1];
  } else {
    const targetIntersections = getIntersections(target, line);
    // Todo: handle when more than one intersection
    if (targetIntersections.length > 0) {
      p1 = targetIntersections[0];
    } else {
      p1 = [target.x, target.y];
    }
  }

  return [
    { x: p0[0], y: p0[1] },
    { x: p1[0], y: p1[1] },
  ];
}

function getIntersections(rect: NodeRect, line: LineTuple) {
  const vertices: PositionTuple[] = [
    [rect.x - rect.width / 2, rect.y - rect.height / 2],
    [rect.x + rect.width / 2, rect.y - rect.height / 2],
    [rect.x + rect.width / 2, rect.y + rect.height / 2],
    [rect.x - rect.width / 2, rect.y + rect.height / 2],
  ];
  const possibleLines: [start: PositionTuple, end: PositionTuple][] = [];
  for (let i = 0; i < 4; i++) {
    possibleLines.push([vertices[i], vertices[(i + 1) % 4]]);
  }
  const intersections: PositionTuple[] = [];
  for (const item of possibleLines) {
    const intersection = intersect(line[0], line[1], item[0], item[1]);
    if (intersection) {
      intersections.push(intersection);
    }
  }
  return intersections;
}
