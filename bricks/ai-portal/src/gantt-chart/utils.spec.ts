import { describe, test, expect } from "@jest/globals";
import { processTimeline, countNodes } from "./utils.js";
import type { GanttNode } from "./interfaces.js";

describe("processTimeline", () => {
  test("should handle undefined nodes", () => {
    const result = processTimeline(undefined);
    expect(result.duration).toBe(0);
    expect(result.timeline.size).toBe(0);
  });

  test("should handle empty nodes array", () => {
    const result = processTimeline([]);
    expect(result.duration).toBe(0);
    expect(result.timeline.size).toBe(0);
  });

  test("should process single leaf node without timing", () => {
    const nodes: GanttNode[] = [{ name: "Task 1" }];
    const result = processTimeline(nodes);

    expect(result.duration).toBe(1);
    expect(result.timeline.size).toBe(1);
    expect(result.timeline.get(nodes[0])).toEqual({ start: 0, end: 1 });
  });

  test("should process multiple leaf nodes without timing", () => {
    const nodes: GanttNode[] = [{ name: "Task 1" }, { name: "Task 2" }];
    const result = processTimeline(nodes);

    expect(result.duration).toBe(2);
    expect(result.timeline.size).toBe(2);
    expect(result.timeline.get(nodes[0])).toEqual({ start: 0, end: 1 });
    expect(result.timeline.get(nodes[1])).toEqual({ start: 1, end: 2 });
  });

  test("should process nodes with timing information", () => {
    const nodes: GanttNode[] = [
      { name: "Task 1", startTime: 10, endTime: 15 },
      { name: "Task 2", startTime: 20, endTime: 30 },
    ];
    const result = processTimeline(nodes);

    expect(result.duration).toBe(20);
    expect(result.timeline.size).toBe(2);
    expect(result.timeline.get(nodes[0])).toEqual({ start: 0, end: 5 });
    expect(result.timeline.get(nodes[1])).toEqual({ start: 10, end: 20 });
  });

  test("should handle mixed nodes with and without timing", () => {
    const nodes: GanttNode[] = [
      { name: "Task 1", startTime: 10, endTime: 20 },
      { name: "Task 2" },
    ];
    const result = processTimeline(nodes);

    expect(result.duration).toBe(20);
    expect(result.timeline.size).toBe(2);
    expect(result.timeline.get(nodes[0])).toEqual({ start: 0, end: 10 });
    expect(result.timeline.get(nodes[1])).toEqual({ start: 10, end: 20 });
  });

  test("should process nested nodes", () => {
    const leaf1: GanttNode = { name: "Subtask 1" };
    const leaf2: GanttNode = { name: "Subtask 2" };
    const parent: GanttNode = { name: "Task 1", children: [leaf1, leaf2] };
    const nodes: GanttNode[] = [parent];

    const result = processTimeline(nodes);

    expect(result.duration).toBe(2);
    expect(result.timeline.size).toBe(3);
    expect(result.timeline.get(leaf1)).toEqual({ start: 0, end: 1 });
    expect(result.timeline.get(leaf2)).toEqual({ start: 1, end: 2 });
    expect(result.timeline.get(parent)).toEqual({ start: 0, end: 2 });
  });

  test("should process deeply nested nodes with timing", () => {
    const leaf: GanttNode = { name: "Deep task", startTime: 5, endTime: 15 };
    const child: GanttNode = { name: "Child task", children: [leaf] };
    const parent: GanttNode = { name: "Parent task", children: [child] };
    const nodes: GanttNode[] = [parent];

    const result = processTimeline(nodes);

    expect(result.duration).toBe(10);
    expect(result.timeline.size).toBe(3);
    expect(result.timeline.get(leaf)).toEqual({ start: 0, end: 10 });
    expect(result.timeline.get(child)).toEqual({ start: 0, end: 10 });
    expect(result.timeline.get(parent)).toEqual({ start: 0, end: 10 });
  });
});

describe("countNodes", () => {
  test("should count single node", () => {
    const node: GanttNode = { name: "Task 1" };
    expect(countNodes(node, null)).toBe(1);
  });

  test("should count nodes with children", () => {
    const leaf1: GanttNode = { name: "Subtask 1" };
    const leaf2: GanttNode = { name: "Subtask 2" };
    const parent: GanttNode = { name: "Task 1", children: [leaf1, leaf2] };

    expect(countNodes(parent, null)).toBe(3);
  });

  test("should handle collapsed nodes", () => {
    const leaf1: GanttNode = { name: "Subtask 1" };
    const leaf2: GanttNode = { name: "Subtask 2" };
    const parent: GanttNode = { name: "Task 1", children: [leaf1, leaf2] };
    const collapsedNodes = new Set([parent]);

    expect(countNodes(parent, collapsedNodes)).toBe(1);
  });
});
