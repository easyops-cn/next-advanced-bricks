import type { GanttNode, Timing } from "./interfaces";

export function countNodes(
  node: GanttNode,
  collapsedNodes: Set<GanttNode> | null
): number {
  let count = 1;
  if (!collapsedNodes?.has(node) && node.children) {
    for (const child of node.children) {
      count += countNodes(child, collapsedNodes);
    }
  }
  return count;
}

export function processTimeline(nodes: GanttNode[] | undefined) {
  const leaves = getLeafNodes(nodes);

  // Handle empty cases early
  if (leaves.length === 0) {
    return { duration: 0, timeline: new Map<GanttNode, Timing>() };
  }

  const durations = leaves.map((node) => {
    if (
      typeof node.startTime === "number" &&
      typeof node.endTime === "number"
    ) {
      return node.endTime - node.startTime;
    }
    return null;
  });
  const meaningfulDurations = durations.filter(
    (duration): duration is number => duration !== null
  );

  const timeline = new Map<GanttNode, Timing>();

  let globalStartTime = 0;
  let minimalDuration = 1;
  let duration = leaves.length;
  const hasMeaningfulDurations = durations[0] !== null;

  if (hasMeaningfulDurations) {
    const startTimes = leaves
      .map((node) => node.startTime)
      .filter((time): time is number => typeof time === "number");
    const endTimes = leaves
      .map((node) => node.endTime)
      .filter((time): time is number => typeof time === "number");

    minimalDuration = Math.min(...meaningfulDurations);
    globalStartTime = Math.min(...startTimes);
    const globalEndTime = Math.max(...endTimes);

    // For those nodes without duration, assign them the minimal duration
    duration =
      globalEndTime -
      globalStartTime +
      minimalDuration * (leaves.length - meaningfulDurations.length);
  }

  let time = 0;
  for (const node of leaves) {
    const nodeStart =
      hasMeaningfulDurations && typeof node.startTime === "number"
        ? node.startTime - globalStartTime
        : time;
    const nodeEnd =
      hasMeaningfulDurations && typeof node.endTime === "number"
        ? node.endTime - globalStartTime
        : nodeStart + minimalDuration;
    time = nodeEnd;
    timeline.set(node, { start: nodeStart, end: nodeEnd });
  }

  if (nodes) {
    setupSubNodesTiming(nodes, timeline);
  }

  return { duration, timeline };
}

function getLeafNodes(nodes: GanttNode[] | undefined): GanttNode[] {
  if (!nodes) return [];
  return nodes.flatMap((node) => {
    return node.children?.length ? getLeafNodes(node.children) : [node];
  });
}

function setupSubNodesTiming(
  nodes: GanttNode[],
  timeline: Map<GanttNode, Timing>
): Timing {
  let start = Infinity;
  let end = -Infinity;
  for (const node of nodes) {
    let timing = timeline.get(node);
    if (!timing) {
      timing = setupSubNodesTiming(node.children!, timeline);
      timeline.set(node, timing);
    }
    start = Math.min(start, timing.start);
    end = Math.max(end, timing.end);
  }
  return { start, end };
}
