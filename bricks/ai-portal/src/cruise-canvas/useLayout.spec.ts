import { renderHook } from "@testing-library/react";
import { useLayout, type UseLayoutOptions } from "./useLayout";
import {
  END_NODE_ID,
  ERROR_NODE_ID,
  FEEDBACK_NODE_ID,
  START_NODE_ID,
} from "./constants";
import { GraphNode, GraphEdge, SizeTuple } from "./interfaces";

describe("useLayout", () => {
  const mockNodes: GraphNode[] = [
    { id: "node1", type: "requirement", content: "hi" },
    { id: "node2", type: "instruction", job: null! },
  ];

  const mockEdges: GraphEdge[] = [{ source: "node1", target: "node2" }];

  const mockSizeMap = new Map<string, SizeTuple>([
    [START_NODE_ID, [100, 50]],
    ["node1", [150, 80]],
    ["node2", [150, 80]],
    [END_NODE_ID, [100, 50]],
    [ERROR_NODE_ID, [100, 50]],
    [FEEDBACK_NODE_ID, [100, 50]],
  ]);

  it("should return sizeReady: false when sizeMap is missing node dimensions", () => {
    const incompleteSizeMap = new Map<string, SizeTuple>([
      [START_NODE_ID, [100, 50]],
      ["node1", [150, 80]],
      // Missing node2
    ]);

    const { result } = renderHook(() =>
      useLayout({
        rawNodes: mockNodes,
        rawEdges: mockEdges,
        sizeMap: incompleteSizeMap,
      })
    );

    expect(result.current.sizeReady).toBe(false);
    expect(result.current.edges).toEqual([]);
  });

  it("should return sizeReady: true when all node dimensions are available", () => {
    const { result, rerender } = renderHook((props) => useLayout(props), {
      initialProps: {
        rawNodes: mockNodes,
        rawEdges: mockEdges,
        sizeMap: mockSizeMap,
        state: "unknown",
      } as UseLayoutOptions,
    });

    expect(result.current.sizeReady).toBe(true);
    expect(result.current.nodes.length).toBe(3); // Start node + 2 mock nodes
    expect(result.current.edges.length).toBe(2); // One edge between nodes + one from start

    rerender({
      rawNodes: [
        { id: "node1", type: "requirement", content: "hi" },
        { id: "node2", type: "instruction", job: null! },
        { id: "node3", type: "job", job: null! },
      ],
      rawEdges: mockEdges.concat({ source: "node2", target: "node3" }),
      sizeMap: new Map([...mockSizeMap, ["node3", [150, 120]]]),
      completed: true,
    });

    expect(result.current.sizeReady).toBe(true);
    expect(result.current.nodes.length).toBe(5);
    expect(result.current.edges.length).toBe(4);
  });

  it("should add an end node when state is completed and nodes have no outgoing edges", () => {
    const { result } = renderHook(() =>
      useLayout({
        rawNodes: mockNodes,
        rawEdges: [],
        sizeMap: mockSizeMap,
        completed: true,
      })
    );

    const endNode = result.current.nodes.find(
      (node) => node.id === END_NODE_ID
    );
    expect(endNode).toBeDefined();
    expect(endNode?.type).toBe("end");

    // Expect edges from each node to the end node
    const endEdges = result.current.edges.filter(
      (edge) => edge.target === END_NODE_ID
    );
    expect(endEdges.length).toBe(2); // Both node1 and node2 should connect to END_NODE
  });

  it("should add edges from start node to nodes without incoming edges", () => {
    const { result } = renderHook(() =>
      useLayout({
        rawNodes: mockNodes,
        rawEdges: mockEdges, // node1 -> node2
        sizeMap: mockSizeMap,
      })
    );

    const startEdges = result.current.edges.filter(
      (edge) => edge.source === START_NODE_ID
    );
    // Only node1 has no incoming edges
    expect(startEdges.length).toBe(1);
    expect(startEdges[0].target).toBe("node1");
  });

  it("should handle empty inputs", () => {
    const { result } = renderHook(() =>
      useLayout({
        rawNodes: undefined,
        rawEdges: undefined,
        sizeMap: new Map([[START_NODE_ID, [100, 50]]]),
      })
    );

    expect(result.current.nodes.length).toBe(1); // Just the start node
    expect(result.current.edges.length).toBe(0);
  });

  it("should handle error state by adding an error node", () => {
    const { result } = renderHook(() =>
      useLayout({
        rawNodes: mockNodes,
        rawEdges: mockEdges,
        sizeMap: mockSizeMap,
        error: "Test error",
      })
    );
    const errorNode = result.current.nodes.find(
      (node) => node.type === "error"
    );
    expect(errorNode).toBeDefined();
    expect(errorNode?.id).toBe("<ERROR>");
    expect(errorNode?.content).toBe("Test error");

    // Expect edges from nodes without outgoing edges to the error node
    const errorEdges = result.current.edges.filter(
      (edge) => edge.target === "<ERROR>"
    );
    expect(errorEdges.length).toBe(1); // Only node2 should connect to error node
    expect(errorEdges[0].source).toBe("node2");
  });

  it("should handle append feedback node when completed", () => {
    const { result } = renderHook(() =>
      useLayout({
        rawNodes: mockNodes,
        rawEdges: mockEdges,
        sizeMap: mockSizeMap,
        completed: true,
        showFeedback: true,
      })
    );
    const feedbackNode = result.current.nodes.find(
      (node) => node.type === "feedback"
    );
    expect(feedbackNode).toBeDefined();
    expect(feedbackNode?.id).toBe("<FEEDBACK>");

    // Expect edges from end node to feedback node
    const feedbackEdges = result.current.edges.filter(
      (edge) => edge.target === "<FEEDBACK>"
    );
    expect(feedbackEdges.length).toBe(1);
    expect(feedbackEdges[0].source).toBe(END_NODE_ID);
  });

  it("should handle append feedback node when failed", () => {
    const { result } = renderHook(() =>
      useLayout({
        rawNodes: mockNodes,
        rawEdges: mockEdges,
        sizeMap: mockSizeMap,
        failed: true,
        showFeedback: true,
        showFeedbackAfterFailed: true,
      })
    );
    const feedbackNode = result.current.nodes.find(
      (node) => node.type === "feedback"
    );
    expect(feedbackNode).toBeDefined();
    expect(feedbackNode?.id).toBe("<FEEDBACK>");

    // Expect edges from end node to feedback node
    const feedbackEdges = result.current.edges.filter(
      (edge) => edge.target === "<FEEDBACK>"
    );
    expect(feedbackEdges.length).toBe(1);
    expect(feedbackEdges[0].source).toBe("node2");
  });
});
