import { handleKeyboardNav } from "./handleKeyboardNav";
import type { GraphNode } from "../interfaces";

describe("handleKeyboardNav", () => {
  let mockNodes: GraphNode[];

  beforeEach(() => {
    mockNodes = [
      {
        id: "node1",
        type: "job",
        view: { x: 100, y: 100, width: 160, height: 80 },
      },
      {
        id: "node2",
        type: "job",
        view: { x: 200, y: 100, width: 160, height: 80 },
      },
      {
        id: "node3",
        type: "job",
        view: { x: 100, y: 200, width: 160, height: 80 },
      },
      {
        id: "node4",
        type: "job",
        view: { x: 0, y: 100, width: 160, height: 80 },
      },
      {
        id: "node5",
        type: "job",
        view: { x: 100, y: 0, width: 160, height: 80 },
      },
      {
        id: "node6",
        type: "start",
        view: { x: 50, y: 50, width: 160, height: 80 },
      },
      {
        id: "node7",
        type: "instruction",
        view: { x: 150, y: 150, width: 160, height: 80 },
      },
    ] as GraphNode[];
  });

  it("should return undefined if no active node exists", () => {
    const event = new KeyboardEvent("keydown", { key: "A" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined if active node id does not match any node", () => {
    const event = new KeyboardEvent("keydown", { key: "A" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "nonexistent",
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should navigate right to the nearest node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "switch-active-node",
      node: mockNodes[1], // node2 is to the right of node1
    });
  });

  it("should navigate left to the nearest node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "switch-active-node",
      node: mockNodes[3], // node4 is to the left of node1
    });
  });

  it("should navigate down to the nearest node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "switch-active-node",
      node: mockNodes[2], // node3 is below node1
    });
  });

  it("should navigate up to the nearest node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "switch-active-node",
      node: mockNodes[4], // node5 is above node1
    });
  });

  it("should perform enter action", () => {
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "enter",
      node: mockNodes[0], // node1 is the active node
    });
  });

  it("should ignore start and instruction nodes when finding candidates", () => {
    // Node6 (start) and Node7 (instruction) should be ignored
    // Add a node that would be the closest in normal circumstances but is of type "start"
    mockNodes.push({
      id: "node8",
      type: "start",
      view: { x: 120, y: 100, width: 160, height: 80 },
    } as GraphNode);

    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });

    // Should still find node2, not node8 despite node8 being closer
    expect(result).toEqual({
      action: "switch-active-node",
      node: mockNodes[1], // node2 is to the right of node1
    });
  });

  it("should return undefined for unsupported keys", () => {
    const event = new KeyboardEvent("keydown", { key: "Tab" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should handle space key scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: " " });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "up",
      range: "page",
      node: undefined,
    });
  });

  it("should handle shift+space key scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: " ", shiftKey: true });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "down",
      range: "page",
      node: undefined,
    });
  });

  it("should handle Home key scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: "Home" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "up",
      range: "document",
      node: undefined,
    });
  });

  it("should handle End key scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: "End" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "down",
      range: "document",
      node: undefined,
    });
  });

  it("should handle ArrowUp line scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "up",
      range: "line",
      node: undefined,
    });
  });

  it("should handle ArrowDown line scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "down",
      range: "line",
      node: undefined,
    });
  });

  it("should ignore metaKey on non-mac", () => {
    const event = new KeyboardEvent("keydown", {
      key: "ArrowUp",
      metaKey: true,
    });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should handle ArrowLeft line scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "left",
      range: "line",
      node: undefined,
    });
  });

  it("should handle ArrowRight line scrolling when no active node", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toEqual({
      action: "scroll",
      direction: "right",
      range: "line",
      node: undefined,
    });
  });

  it("should return undefined for ctrl+key combinations when no active node", () => {
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      ctrlKey: true,
    });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for alt+key combinations when no active node", () => {
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      altKey: true,
    });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined for shift+key combinations when no active node", () => {
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      shiftKey: true,
    });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });
});
