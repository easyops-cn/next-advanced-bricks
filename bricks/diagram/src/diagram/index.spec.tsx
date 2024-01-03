import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { EoDiagram } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("eo-diagram", () => {
  test("empty nodes", async () => {
    const element = document.createElement("eo-diagram") as EoDiagram;
    element.layout = "dagre";
    element.nodes = [];
    element.edges = [];

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <div
          class="diagram"
          tabindex="-1"
        >
          <svg
            class="lines"
            height="100%"
            width="100%"
          >
            <defs />
            <g
              transform="translate(0 0) scale(1)"
            />
          </svg>
          <div
            class="dragger"
          />
          <div
            class="nodes"
            style="left: 0px; top: 0px;"
          />
        </div>,
      ]
    `);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("basic usage", async () => {
    const element = document.createElement("eo-diagram") as EoDiagram;
    element.layout = "dagre";
    element.nodes = [{ id: "a" }, { id: "b" }, { id: "c" }];
    element.edges = [
      { source: "a", target: "b", type: "menu" },
      { source: "a", target: "c", type: "link" },
    ];
    element.lines = [
      { edgeType: "menu", strokeColor: "gray" },
      { edgeType: "link", arrow: true, strokeColor: "blue" },
    ];

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.querySelectorAll(".node").length).toBe(3);
    expect(element.shadowRoot?.childNodes[1]).toMatchInlineSnapshot(`
      <div
        class="diagram"
        tabindex="-1"
      >
        <svg
          class="lines"
          height="100%"
          width="100%"
        >
          <defs />
          <g
            transform="translate(0 0) scale(1)"
          />
        </svg>
        <div
          class="dragger"
        />
        <div
          class="nodes"
          style="left: 0px; top: 0px;"
        >
          <div
            class="node"
          />
          <div
            class="node"
          />
          <div
            class="node"
          />
        </div>
      </div>
    `);

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(element.shadowRoot?.childNodes[1]).toMatchInlineSnapshot(`
<div
  class="diagram ready"
  tabindex="-1"
>
  <svg
    class="lines"
    height="100%"
    width="100%"
  >
    <defs>
      <marker
        id="diagram-line-arrow-2-0"
        markerHeight="6"
        markerWidth="6"
        orient="auto"
        refX="3"
        refY="3"
        viewBox="0 0 6 6"
      >
        <path
          d="M 0.5 0.5 L 5.5 3 L 0.5 5.5 z"
          fill="blue"
          stroke="blue"
          stroke-width="1"
        />
      </marker>
    </defs>
    <g
      transform="translate(-35 -35) scale(1)"
    >
      <path
        d="M30,10L25.833,14.167C21.667,18.333,13.333,26.667,9.167,35C5,43.333,5,51.667,5,55.833L5,60"
        fill="none"
        stroke="gray"
        stroke-width="1"
      />
      <path
        d="M40,10L44.167,14.167C48.333,18.333,56.667,26.667,60.833,34.167C65,41.667,65,48.333,65,51.667L65,55"
        fill="none"
        marker-end="url(#diagram-line-arrow-2-0)"
        stroke="blue"
        stroke-width="1"
      />
    </g>
  </svg>
  <div
    class="dragger"
  />
  <div
    class="nodes"
    style="left: -35px; top: -35px;"
  >
    <div
      class="node"
    />
    <div
      class="node"
    />
    <div
      class="node"
    />
  </div>
</div>
`);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("not dagre layout", async () => {
    const element = document.createElement("eo-diagram") as EoDiagram;
    element.layout = "force" as any;

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes[1]).toMatchInlineSnapshot(`
      <div>
        Diagram layout not supported: "force"
      </div>
    `);

    act(() => {
      document.body.removeChild(element);
    });
  });
});