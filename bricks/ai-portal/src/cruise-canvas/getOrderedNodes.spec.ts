import { getOrderedNodes, GeneralNode } from "./getOrderedNodes";

describe("getOrderedNodes", () => {
  it("should handle empty or null nodes", () => {
    const result1 = getOrderedNodes(null);
    expect(result1.list).toEqual([]);
    expect(result1.roots).toEqual([]);
    expect(result1.leaves).toEqual([]);

    const result2 = getOrderedNodes([]);
    expect(result2.list).toEqual([]);
    expect(result2.roots).toEqual([]);
    expect(result2.leaves).toEqual([]);
  });

  it("should identify root nodes correctly", () => {
    const nodes: GeneralNode[] = [
      { id: "a" },
      { id: "b" },
      { id: "c", upstream: ["a"] },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.roots).toEqual(["a", "b"]);
    expect(result.list).toContain("a");
    expect(result.list).toContain("b");
    expect(result.list).toContain("c");
  });

  it("should establish parent-child relationships", () => {
    const nodes: GeneralNode[] = [
      { id: "parent" },
      { id: "child1", parent: "parent" },
      { id: "child2", parent: "parent" },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.roots).toEqual(["parent"]);
    expect(result.levels.get("parent")).toBe(0);
    expect(result.levels.get("child1")).toBe(1);
    expect(result.levels.get("child2")).toBe(1);
  });

  it("should handle hidden nodes", () => {
    const nodes: GeneralNode[] = [
      { id: "a" },
      { id: "b", upstream: ["a"], hidden: true },
      { id: "c", upstream: ["b"] },
      { id: "d", upstream: ["c"] },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.roots).toEqual(["a"]);
    expect(result.list).toContain("a");
    expect(result.list).toContain("c");
    expect(result.list).toContain("d");
    expect(result.list).not.toContain("b");

    const resultWithHidden = getOrderedNodes(nodes, { showHiddenNodes: true });
    expect(resultWithHidden.roots).toEqual(["a"]);
    expect(resultWithHidden.list).toContain("b");
  });

  it("should establish correct downstream relationships", () => {
    const nodes: GeneralNode[] = [
      { id: "a" },
      { id: "b", upstream: ["a"] },
      { id: "c", upstream: ["b"] },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.downstreamMap.get("a")).toEqual(["b"]);
    expect(result.downstreamMap.get("b")).toEqual(["c"]);
  });

  it("should handle complex hierarchies with hidden nodes", () => {
    const nodes: GeneralNode[] = [
      { id: "root" },
      { id: "middle", upstream: ["root"], hidden: true },
      { id: "leaf", upstream: ["middle"] },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.roots).toEqual(["root"]);
    expect(result.leaves).toEqual(["leaf"]);
    expect(result.list).toEqual(["root", "leaf"]);
    expect(result.downstreamMap.get("root")).toEqual(["leaf"]);
  });

  it("should process nested parent-child relationships", () => {
    const nodes: GeneralNode[] = [
      { id: "grandparent" },
      { id: "parent", parent: "grandparent" },
      { id: "child", parent: "parent" },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.levels.get("grandparent")).toBe(0);
    expect(result.levels.get("parent")).toBe(1);
    expect(result.levels.get("child")).toBe(2);
  });

  it("should identify leaf nodes correctly", () => {
    const nodes: GeneralNode[] = [
      { id: "a" },
      { id: "b", upstream: ["a"] },
      { id: "c", upstream: ["a"] },
    ];

    const result = getOrderedNodes(nodes);
    expect(result.leaves).toContain("b");
    expect(result.leaves).toContain("c");
    expect(result.leaves).not.toContain("a");
  });

  it("should handle both parent and upstream", () => {
    const nodes: GeneralNode[] = [
      { id: "a" },
      { id: "b", upstream: ["a"] },
      { id: "c", parent: "b" },
      { id: "d", upstream: ["b"] },
    ];

    const result = getOrderedNodes(nodes);
    expect(result).toMatchInlineSnapshot(`
      {
        "downstreamMap": Map {
          "a" => [
            "b",
          ],
          "b" => [
            "c",
          ],
          "c" => [
            "d",
          ],
        },
        "fullDownstreamMap": undefined,
        "leaves": [
          "d",
        ],
        "levels": Map {
          "a" => 0,
          "b" => 0,
          "c" => 1,
          "d" => 0,
        },
        "list": [
          "a",
          "b",
          "c",
          "d",
        ],
        "map": Map {
          "a" => {
            "id": "a",
          },
          "b" => {
            "id": "b",
            "upstream": [
              "a",
            ],
          },
          "c" => {
            "id": "c",
            "parent": "b",
          },
          "d" => {
            "id": "d",
            "upstream": [
              "b",
            ],
          },
        },
        "roots": [
          "a",
        ],
      }
    `);
  });
});
