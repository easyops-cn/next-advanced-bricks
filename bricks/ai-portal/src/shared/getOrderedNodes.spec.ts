import { getOrderedNodes, GeneralNode } from "./getOrderedNodes";

describe("getOrderedNodes", () => {
  it("should handle unmatched parent", () => {
    const nodes: GeneralNode[] = [
      { id: "a" },
      { id: "c", parent: "b" },
      { id: "d", upstream: ["a"] },
      { id: "e", parent: "f" },
    ];

    const result = getOrderedNodes(nodes);
    expect(result).toMatchInlineSnapshot(`
{
  "childMap": Map {
    "b" => "c",
    "f" => "e",
  },
  "downstreamMap": Map {
    "a" => [
      "d",
    ],
  },
  "leaves": [
    "d",
  ],
  "list": [
    "a",
    "d",
  ],
  "map": Map {
    "a" => {
      "id": "a",
    },
    "c" => {
      "id": "c",
      "parent": "b",
    },
    "d" => {
      "id": "d",
      "upstream": [
        "a",
      ],
    },
    "e" => {
      "id": "e",
      "parent": "f",
    },
  },
  "roots": [
    "a",
  ],
}
`);
  });
});
