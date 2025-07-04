import { handleKeyboardNav } from "./handleKeyboardNav";
import type { GraphNode } from "../interfaces";

describe("handleKeyboardNav", () => {
  let mockNodes: GraphNode[];

  beforeEach(() => {
    mockNodes = [
      { id: "node1", type: "job", view: { x: 100, y: 100 } },
      { id: "node2", type: "job", view: { x: 200, y: 100 } },
      { id: "node3", type: "job", view: { x: 100, y: 200 } },
      { id: "node4", type: "job", view: { x: 0, y: 100 } },
      { id: "node5", type: "job", view: { x: 100, y: 0 } },
      { id: "node6", type: "start", view: { x: 50, y: 50 } },
      { id: "node7", type: "instruction", view: { x: 150, y: 150 } },
    ] as GraphNode[];
  });

  it("should return undefined if no active node exists", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: null,
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should return undefined if active node is not found", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "nonexistent",
      nodes: mockNodes,
    });
    expect(result).toBeUndefined();
  });

  it("should navigate to the right when ArrowRight is pressed", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[1]); // node2 is to the right of node1
  });

  it("should navigate to the right when keyCode 39 is used", () => {
    const event = new KeyboardEvent("keydown");
    Object.defineProperty(event, "keyCode", { value: 39 });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[1]); // node2 is to the right of node1
  });

  it("should navigate down when ArrowDown is pressed", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[2]); // node3 is below node1
  });

  it("should navigate down when keyCode 40 is used", () => {
    const event = new KeyboardEvent("keydown");
    Object.defineProperty(event, "keyCode", { value: 40 });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[2]); // node3 is below node1
  });

  it("should navigate to the left when ArrowLeft is pressed", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[3]); // node4 is to the left of node1
  });

  it("should navigate to the left when keyCode 37 is used", () => {
    const event = new KeyboardEvent("keydown");
    Object.defineProperty(event, "keyCode", { value: 37 });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[3]); // node4 is to the left of node1
  });

  it("should navigate up when ArrowUp is pressed", () => {
    const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[4]); // node5 is above node1
  });

  it("should navigate up when keyCode 38 is used", () => {
    const event = new KeyboardEvent("keydown");
    Object.defineProperty(event, "keyCode", { value: 38 });
    const result = handleKeyboardNav(event, {
      activeNodeId: "node1",
      nodes: mockNodes,
    });
    expect(result).toBe(mockNodes[4]); // node5 is above node1
  });

  it("should ignore start and instruction nodes as navigation targets", () => {
    // Arrange a scenario where only start/instruction nodes would be in direction
    const specialNodes = [
      { id: "node1", type: "job", view: { x: 100, y: 100 } },
      { id: "node2", type: "start", view: { x: 200, y: 100 } },
      { id: "node3", type: "instruction", view: { x: 100, y: 200 } },
    ] as GraphNode[];

    // Test right navigation - should return undefined as only start node is in that direction
    const rightEvent = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const rightResult = handleKeyboardNav(rightEvent, {
      activeNodeId: "node1",
      nodes: specialNodes,
    });
    expect(rightResult).toBeUndefined();

    // Test down navigation - should return undefined as only instruction node is in that direction
    const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
    const downResult = handleKeyboardNav(downEvent, {
      activeNodeId: "node1",
      nodes: specialNodes,
    });
    expect(downResult).toBeUndefined();
  });

  it("should not return a node if there are no valid candidates in the specified direction", () => {
    // Create a scenario where there's no node to the right
    const isolatedNode = [
      { id: "isolated", type: "job", view: { x: 1000, y: 1000 } },
      ...mockNodes,
    ] as GraphNode[];

    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    const result = handleKeyboardNav(event, {
      activeNodeId: "isolated",
      nodes: isolatedNode,
    });
    expect(result).toBeUndefined();
  });
});
