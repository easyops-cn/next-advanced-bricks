import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import ResizeObserver from "resize-observer-polyfill";
import "./";
import type { EoDrawCanvas } from "./index.js";
import type { Cell, NodeBrickCell } from "./interfaces";
import * as _handleMouseDown from "./processors/handleMouseDown";

jest.mock("@next-core/theme", () => ({}));
jest.mock("d3-drag");
jest.mock("resize-observer-polyfill");
global.ResizeObserver = ResizeObserver as any;
const handleMouseDown = jest.spyOn(_handleMouseDown, "handleMouseDown");

document.elementsFromPoint = jest.fn(() => []);

const lockBodyScroll = jest.fn();
customElements.define(
  "basic.lock-body-scroll",
  class extends HTMLElement {
    resolve = lockBodyScroll;
  }
);

let observerCallback: ResizeObserverCallback | undefined;

(ResizeObserver as jest.Mock).mockImplementation(function (
  callback: ResizeObserverCallback
) {
  observerCallback = callback;
  return {
    observe: jest.fn(),
    disconnect: jest.fn(),
  };
} as any);

describe("eo-draw-canvas", () => {
  test("drop node", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      } as any,
    ];

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    element.getBoundingClientRect = jest.fn(() => ({
      left: 180,
      top: 120,
    })) as any;

    await act(async () => {
      const dropResult1 = await element.dropNode({
        id: "test",
        position: [800, 600],
        size: [100, 200],
        data: {},
        useBrick: { brick: "div" },
      });
      expect(dropResult1).toBe(null);
    });

    const originalElementsFromPoint = document.elementsFromPoint;
    document.elementsFromPoint = jest.fn(() => [element]);
    await act(async () => {
      const dropResult2 = await element.dropNode({
        id: "test",
        position: [800, 600],
        data: {},
        useBrick: { brick: "div" },
      });
      expect(dropResult2).toEqual({
        type: "node",
        id: "test",
        data: {},
        useBrick: {
          brick: "div",
        },
        view: {
          x: 620,
          y: 480,
          width: 20,
          height: 20,
        },
      });
    });
    document.elementsFromPoint = originalElementsFromPoint;

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("drop node with force layout", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      } as any,
    ];
    element.layout = "force";

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    element.getBoundingClientRect = jest.fn(() => ({
      left: 180,
      top: 120,
    })) as any;

    await act(async () => {
      const dropResult1 = await element.dropNode({
        id: "test",
        position: [800, 600],
        size: [100, 200],
        data: {},
        useBrick: { brick: "div" },
      });
      expect(dropResult1).toBe(null);
    });

    const originalElementsFromPoint = document.elementsFromPoint;
    document.elementsFromPoint = jest.fn(() => [element]);
    await act(async () => {
      const dropResult2 = await element.dropNode({
        id: "test",
        position: [800, 600],
        data: {},
        useBrick: { brick: "div" },
      });
      expect(dropResult2).toEqual({
        type: "node",
        id: "test",
        data: {},
        useBrick: {
          brick: "div",
        },
        view: {
          width: 20,
          height: 20,
        },
      });
    });
    document.elementsFromPoint = originalElementsFromPoint;

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    act(() => {
      observerCallback?.([], null!);
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("add nodes", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      } as any,
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      const result = await element.addNodes([]);
      expect(result).toEqual([]);
    });

    await act(async () => {
      const result = await element.addNodes([
        {
          id: "add-1",
          size: [100, 200],
          data: {},
        },
        {
          id: "add-2",
          data: {},
        },
      ]);
      expect(result).toEqual([
        {
          data: {},
          id: "add-1",
          type: "node",
          view: {
            height: 200,
            width: 100,
            x: 50,
            y: 100,
          },
        },
        {
          data: {},
          id: "add-2",
          type: "node",
          view: {
            height: 20,
            width: 20,
            x: 160,
            y: 100,
          },
        },
      ]);
    });

    // Test when the first node has no size
    await act(async () => {
      const result = await element.addNodes([
        {
          id: "add-3",
          data: {},
          useBrick: { brick: "div" },
        },
        {
          id: "add-4",
          size: [100, 200],
          data: {},
          useBrick: { brick: "div" },
        },
      ]);
      expect(result).toEqual([
        {
          data: {},
          id: "add-3",
          type: "node",
          useBrick: {
            brick: "div",
          },
          view: {
            height: 20,
            width: 20,
            x: expect.closeTo(73.7, 1),
            y: expect.closeTo(-60.2, 1),
          },
        },
        {
          data: {},
          id: "add-4",
          type: "node",
          useBrick: {
            brick: "div",
          },
          view: {
            height: 200,
            width: 100,
            x: expect.closeTo(-73.1, 1),
            y: expect.closeTo(-128.5, 1),
          },
        },
      ]);
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("add edge", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeSize = [180, 120];
    element.defaultEdgeLines = `<%
      [
        {
          if: DATA.edge.data?.virtual,
          dashed: true,
          text: {
            content: DATA.edge.data?.description,
          },
          callLabelOnDoubleClick: "enableEditing",
        }
      ]
    %>` as any;
    element.cells = [
      {
        // This edge will be ignored since source node is not found
        type: "edge",
        source: "oops",
        target: "x",
      },
      {
        type: "node",
        id: "x",
        view: {
          x: 20,
          y: 20,
        },
        useBrick: { brick: "div" },
      },
      {
        type: "node",
        id: "y",
        view: {
          x: 20,
          y: 320,
        },
        useBrick: { brick: "div" },
      },
      {
        type: "node",
        id: "z",
        view: {
          x: 320,
          y: 320,
        },
        useBrick: { brick: "div" },
      },
      {
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      },
    ] as NodeBrickCell[];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".line").length).toBe(0);

    await act(async () => {
      const result = await element.addEdge({
        source: "x",
        target: "y",
        data: {
          description: "test ege",
        },
      });
      expect(result).toEqual({
        type: "edge",
        source: "x",
        target: "y",
        data: {
          description: "test ege",
        },
      });
    });

    const getCellTagNames = () =>
      [...element.shadowRoot!.querySelectorAll(".cell > *")].map((node) =>
        (node as Element).tagName.toLowerCase()
      );

    expect(
      element.shadowRoot
        ?.querySelectorAll(".line")[0]
        .classList.contains("dashed")
    ).toBe(false);

    // Edges are adding to just next to the previous last edge,
    // If no previous edge, add to the start.
    expect(getCellTagNames()).toEqual([
      "g",
      "foreignobject",
      "foreignobject",
      "foreignobject",
      "foreignobject",
    ]);

    await act(async () => {
      const result = await element.addEdge({
        source: "x",
        target: "z",
        data: {
          virtual: true,
        },
      });
      expect(result).toEqual({
        type: "edge",
        source: "x",
        target: "z",
        data: {
          virtual: true,
        },
      });
    });

    expect(
      element.shadowRoot
        ?.querySelectorAll(".line")[1]
        .classList.contains("dashed")
    ).toBe(true);

    expect(getCellTagNames()).toEqual([
      "g",
      "defs",
      "g",
      "foreignobject",
      "foreignobject",
      "foreignobject",
      "foreignobject",
      "foreignobject",
    ]);

    const labels = element.shadowRoot!.querySelectorAll(".line-label");
    expect(labels.length).toBe(1);
    act(() => {
      fireEvent.click(labels[0]);
    });
    const mockEnableEditing = jest.fn();
    Object.defineProperty(labels[0], "firstElementChild", {
      value: {
        enableEditing: mockEnableEditing,
      },
    });
    act(() => {
      fireEvent.dblClick(
        element.shadowRoot!.querySelectorAll(".line-group")[0]
      );
    });
    expect(mockEnableEditing).not.toHaveBeenCalled();

    act(() => {
      fireEvent.dblClick(
        element.shadowRoot!.querySelectorAll(".line-group")[1]
      );
    });
    expect(mockEnableEditing).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("active target", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.fadeUnrelatedCells = true;
    element.doNotResetActiveTargetForSelector = "#omit-target";
    element.lineConnector = true;
    element.cells = [
      {
        type: "decorator",
        decorator: "area",
        id: "area-1",
        view: {
          x: 10,
          y: 10,
        },
      },
      {
        type: "decorator",
        decorator: "line",
        id: "line-1",
        view: {
          source: {
            x: 100,
            y: 200,
          },
          target: {
            x: 300,
            y: 150,
          },
        },
      },
      {
        type: "decorator",
        decorator: "line",
        id: "line-invalid",
        view: {},
      },
      {
        type: "edge",
        source: "b",
        target: "c",
      },
      {
        type: "edge",
        source: "b",
        target: "d",
      },
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
      {
        type: "node",
        id: "b",
        view: {
          x: 20,
          y: 320,
        },
      },
      {
        type: "node",
        id: "c",
        view: {
          x: 220,
          y: 320,
        },
      },
      {
        type: "node",
        id: "d",
        view: {
          x: 220,
          y: 20,
        },
      },
      {
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      },
    ] as NodeBrickCell[];
    element.defaultEdgeLines = [
      {
        type: "curve",
        markers: [{ placement: "start" }, { placement: "end" }],
        overrides: {
          activeRelated: {
            motion: {
              shape:
                '<% DATA.edge.target === "d" ? "dot" : "triangle" %>' as any,
              speed: 40,
            },
          },
        },
        label: {
          useBrick: {
            brick: "p",
          },
        },
      },
    ];

    const onActiveTargetChange = jest.fn();
    element.addEventListener("activeTarget.change", (e) =>
      onActiveTargetChange((e as CustomEvent).detail)
    );
    const onCellDelete = jest.fn();
    element.addEventListener("cell.delete", (e) =>
      onCellDelete((e as CustomEvent).detail)
    );

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.mouseDown(
        element.shadowRoot!.querySelector(".cells .node div:not(.label)")!
      );
    });
    expect(handleMouseDown).toHaveBeenCalledTimes(1);

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledWith({
      type: "node",
      id: "a",
    });
    expect(
      [...element.shadowRoot!.querySelectorAll(".cells .cell")].map((cell) =>
        cell.classList.contains("faded")
      )
    ).toEqual([true, true, true, true, true, false, true, true, true, true]);
    expect(
      [...element.shadowRoot!.querySelectorAll(".motion")].map((cell) =>
        cell.classList.contains("visible")
      )
    ).toEqual([false, false]);

    // Set active target to the same node
    element.activeTarget = { type: "node", id: "a" };
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(element.shadowRoot!.querySelector("svg")!, {
      key: "Backspace",
    });
    expect(onCellDelete).toHaveBeenCalledWith({
      type: "node",
      id: "a",
      view: { x: 20, y: 20, width: 20, height: 20 },
    });

    // Click on an edge
    act(() => {
      fireEvent.mouseDown(
        element.shadowRoot!.querySelector(".cells .line-group")!
      );
    });
    expect(handleMouseDown).toHaveBeenCalledTimes(2);
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledWith({
      type: "edge",
      source: "b",
      target: "c",
    });
    expect(onActiveTargetChange).toHaveBeenCalledTimes(2);
    expect(onActiveTargetChange).toHaveBeenNthCalledWith(2, {
      type: "edge",
      source: "b",
      target: "c",
    });
    // Line connector images
    expect(element.shadowRoot!.querySelectorAll("g > image")?.length).toBe(2);

    // Click on a decorator line
    act(() => {
      fireEvent.mouseDown(
        element.shadowRoot!.querySelectorAll(".cells .decorator-line")[0]
      );
    });
    expect(handleMouseDown).toHaveBeenCalledTimes(3);
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledWith({
      type: "decorator",
      id: "line-1",
    });
    expect(onActiveTargetChange).toHaveBeenCalledTimes(3);
    expect(onActiveTargetChange).toHaveBeenNthCalledWith(3, {
      type: "decorator",
      id: "line-1",
    });
    // Line connector images
    expect(element.shadowRoot!.querySelectorAll("g > image")?.length).toBe(3);

    // Click on node b
    act(() => {
      fireEvent.mouseDown(
        element.shadowRoot!.querySelectorAll(".cells .node div:not(.label)")[1]
      );
    });
    expect(handleMouseDown).toHaveBeenCalledTimes(4);

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledTimes(4);
    expect(onActiveTargetChange).toHaveBeenNthCalledWith(4, {
      type: "node",
      id: "b",
    });
    expect(
      [...element.shadowRoot!.querySelectorAll(".cells .cell")].map((cell) =>
        cell.classList.contains("faded")
      )
    ).toEqual([
      true,
      true,
      true,
      false,
      false,
      true,
      false,
      false,
      false,
      true,
    ]);
    expect(
      [...element.shadowRoot!.querySelectorAll(".motion")].map((cell) =>
        cell.classList.contains("visible")
      )
    ).toEqual([true, true]);

    const omitTarget = document.createElement("div");
    omitTarget.id = "omit-target";
    document.body.appendChild(omitTarget);
    act(() => {
      fireEvent.click(omitTarget);
    });
    expect(onActiveTargetChange).toHaveBeenCalledTimes(4);

    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector("svg")!);
    });
    expect(onActiveTargetChange).toHaveBeenCalledTimes(5);
    expect(onActiveTargetChange).toHaveBeenNthCalledWith(5, null);

    act(() => {
      document.body.removeChild(element);
      document.body.removeChild(omitTarget);
    });
  });

  test("drop decorator", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;

    act(() => {
      document.body.appendChild(element);
    });

    element.getBoundingClientRect = jest.fn(() => ({
      left: 180,
      top: 120,
    })) as any;

    await act(async () => {
      const dropResult1 = await element.dropDecorator({
        decorator: "area",
        position: [800, 600],
      });
      expect(dropResult1).toBe(null);
    });

    const originalElementsFromPoint = document.elementsFromPoint;
    document.elementsFromPoint = jest.fn(() => [element]);
    await act(async () => {
      const dropResult2 = await element.dropDecorator({
        decorator: "text",
        position: [800, 600],
        text: "Hello",
      });
      expect(dropResult2).toEqual({
        type: "decorator",
        decorator: "text",
        id: expect.any(String),
        view: {
          x: 620,
          y: 480,
          width: 180,
          height: 120,
          text: "Hello",
          direction: undefined,
        },
      });
    });
    await act(async () => {
      const dropResult3 = await element.dropDecorator({
        decorator: "container",
        position: [800, 600],
        text: "上层服务",
      });
      expect(dropResult3).toEqual({
        type: "decorator",
        decorator: "container",
        id: expect.any(String),
        view: {
          x: 620,
          y: 480,
          width: 180,
          height: 120,
          text: "上层服务",
          direction: undefined,
        },
      });
    });
    await act(async () => {
      const dropResult3 = await element.dropDecorator({
        decorator: "line",
        position: [800, 600],
      });
      expect(dropResult3).toEqual({
        type: "decorator",
        decorator: "line",
        id: expect.any(String),
        view: {
          source: {
            x: 590,
            y: 510,
          },
          target: {
            x: 650,
            y: 450,
          },
        },
      });
    });
    document.elementsFromPoint = originalElementsFromPoint;

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("context menu", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
      {
        type: "node",
        id: "b",
        view: {
          x: 20,
          y: 320,
        },
      },
    ] as NodeBrickCell[];

    const onActiveTargetChange = jest.fn();
    element.addEventListener("activeTarget.change", (e) =>
      onActiveTargetChange((e as CustomEvent).detail)
    );
    const onCellContextMenu = jest.fn();
    element.addEventListener("cell.contextmenu", (e) =>
      onCellContextMenu((e as CustomEvent).detail)
    );

    const onCanvasContextMenu = jest.fn();
    element.addEventListener("canvas.contextmenu", (e) =>
      onCanvasContextMenu((e as CustomEvent).detail)
    );

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.contextMenu(element.shadowRoot!.querySelector(".cell")!, {
        clientX: 100,
        clientY: 200,
      });
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledWith({
      type: "node",
      id: "a",
    });

    expect(onCellContextMenu).toHaveBeenCalledWith({
      cell: {
        type: "node",
        id: "a",
        view: { x: 20, y: 20, width: 20, height: 20 },
      },
      clientX: 100,
      clientY: 200,
      locked: false,
      target: {
        type: "node",
        id: "a",
      },
    });

    // Context-menu event propagation is stopped.
    expect(onCanvasContextMenu).not.toHaveBeenCalled();

    act(() => {
      fireEvent.contextMenu(element.shadowRoot!.querySelector("svg")!, {
        clientX: 100,
        clientY: 200,
      });
    });

    expect(onCanvasContextMenu).toHaveBeenCalledWith({
      clientX: 100,
      clientY: 200,
      view: {
        x: 100,
        y: 200,
      },
    });

    // Active target is reset to null when right-click the canvas space area.
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    expect(onActiveTargetChange).toHaveBeenCalledWith(null);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("manually connect nodes", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.defaultNodeSize = [20, 20];
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
      {
        type: "node",
        id: "b",
        view: {
          x: 20,
          y: 320,
        },
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    // Case 1: Connect from an unknown node
    expect(() => element.manuallyConnectNodes("x")).rejects.toBe(null);

    // Case 2: Click on outside of any nodes
    let promiseWillFail: Promise<unknown> | undefined;
    act(() => {
      promiseWillFail = element.manuallyConnectNodes("a");
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.click(document, { clientX: 15, clientY: 325 });
    });

    expect(promiseWillFail).rejects.toBe(null);

    // Case 3: successful connection
    let promise: Promise<unknown> | undefined;
    act(() => {
      promise = element.manuallyConnectNodes("a");
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.click(document, { clientX: 25, clientY: 325 });
    });

    const result = await promise;

    expect(result).toMatchObject({
      source: expect.objectContaining({
        id: "a",
      }),
      target: expect.objectContaining({
        id: "b",
      }),
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("update cells", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [
      {
        useBrick: {
          brick: "div",
          properties: { textContent: "<% DATA.node.id %>" },
        },
      },
    ];
    element.defaultNodeSize = [20, 20];
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(element.shadowRoot?.querySelectorAll(".cells"))
      .toMatchInlineSnapshot(`
        NodeList [
          <g
            class="cells"
          >
            <g
              class="cell"
            >
              <foreignobject
                class="node"
                height="9999"
                width="9999"
              >
                <div
                  style="left: 20px; top: 20px;"
                >
                  a
                </div>
              </foreignobject>
            </g>
          </g>,
        ]
      `);

    await act(async () => {
      await element.updateCells([
        {
          type: "node",
          id: "a",
          view: {
            x: 20,
            y: 20,
          },
        },
        {
          type: "node",
          id: "b",
          view: {
            x: 20,
            y: 320,
          },
        },
      ]);
    });

    if (element.shadowRoot?.querySelectorAll("svg div").length === 1) {
      expect(element.shadowRoot?.querySelectorAll(".cells"))
        .toMatchInlineSnapshot(`
        NodeList [
          <g
            class="cells"
          >
            <g
              class="cell"
              transform="translate(20 20)"
            >
              <foreignobject
                class="node"
                height="9999"
                width="9999"
              >
                <div>
                  a
                </div>
              </foreignobject>
            </g>
            <g
              class="cell"
              transform="translate(20 320)"
            >
              <foreignobject
                class="node"
                height="9999"
                width="9999"
              />
            </g>
          </g>,
        ]
      `);

      await act(() => new Promise((resolve) => setTimeout(resolve, 1)));
    }

    expect(element.shadowRoot?.querySelectorAll(".cells"))
      .toMatchInlineSnapshot(`
        NodeList [
          <g
            class="cells"
          >
            <g
              class="cell"
            >
              <foreignobject
                class="node"
                height="9999"
                width="9999"
              >
                <div
                  style="left: 20px; top: 20px;"
                >
                  a
                </div>
              </foreignobject>
            </g>
            <g
              class="cell"
            >
              <foreignobject
                class="node"
                height="9999"
                width="9999"
              >
                <div
                  style="left: 20px; top: 320px;"
                >
                  b
                </div>
              </foreignobject>
            </g>
          </g>,
        ]
      `);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("update cells", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "node",
        id: "x",
        view: {
          x: 20,
          y: 30,
        },
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    await act(async () => {
      const result = await element.updateCells(
        [
          {
            type: "edge",
            source: "x",
            target: "y",
          },
          {
            type: "node",
            id: "x",
            view: {
              x: 20,
              y: 30,
            },
          },
          {
            type: "node",
            id: "y",
          },
        ],
        { reason: "add-related-nodes", parent: "x" }
      );
      expect(result).toEqual({
        updated: [
          {
            type: "node",
            id: "y",
            view: {
              height: 20,
              width: 20,
              x: 20,
              y: 100,
            },
          },
        ],
      });
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("edit decorator text", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "text",
        id: "x",
        view: {
          x: 20,
          y: 30,
        },
      } as Cell,
    ];

    const onDecoratorTextChange = jest.fn();
    element.addEventListener("decorator.text.change", (e) =>
      onDecoratorTextChange((e as CustomEvent).detail)
    );

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.doubleClick(
        element.shadowRoot!.querySelector(".decorator-text .text-container")!
      );
    });

    element.shadowRoot!.querySelector(".decorator-text .text")!.textContent =
      "Updated";
    act(() => {
      fireEvent.input(
        element.shadowRoot!.querySelector(".decorator-text .text")!
      );
    });
    act(() => {
      fireEvent.blur(
        element.shadowRoot!.querySelector(".decorator-text .text")!
      );
    });
    expect(onDecoratorTextChange).toHaveBeenCalledWith({
      id: "x",
      view: { x: 20, y: 30, height: 0, width: 0, text: "Updated" },
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("edit decorator container", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "container",
        id: "container-1",
        view: {
          text: "上层服务",
        },
      } as Cell,
      {
        type: "node",
        id: "A",
        containerId: "container-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "B",
        containerId: "container-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "C",
        containerId: "container-2",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "edge",
        source: "A",
        target: "B",
      },
      {
        type: "decorator",
        decorator: "container",
        id: "container-2",
        view: {
          x: 50,
          y: 400,
          width: 80,
          height: 60,
          direction: "right",
          text: "上游系统",
        },
      } as Cell,
      {
        type: "decorator",
        decorator: "container",
        id: "container-3",
        view: {
          x: 50,
          y: 400,
          width: 80,
          height: 60,
          direction: "bottom",
          text: "中台层",
        },
      } as Cell,
      {
        type: "decorator",
        decorator: "container",
        id: "container-4",
        view: {
          x: 500,
          y: 200,
          width: 380,
          height: 120,
          direction: "left",
          text: "接入层",
        },
      } as Cell,
    ];
    element.layoutOptions = { initialLayout: "layered-architecture" };
    const onDecoratorTextChange = jest.fn();
    element.addEventListener("decorator.text.change", (e) =>
      onDecoratorTextChange((e as CustomEvent).detail)
    );

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.doubleClick(
        element.shadowRoot!.querySelector(
          ".decorator-container .text-container"
        )!
      );
    });

    element.shadowRoot!.querySelector(
      ".decorator-container .text"
    )!.textContent = "Updated";
    act(() => {
      fireEvent.input(
        element.shadowRoot!.querySelector(".decorator-container .text")!
      );
    });
    act(() => {
      fireEvent.blur(
        element.shadowRoot!.querySelector(".decorator-container .text")!
      );
    });
    expect(onDecoratorTextChange).toHaveBeenCalledWith({
      id: "container-1",
      view: {
        x: -10,
        y: 130,
        width: 180,
        height: 250,
        text: "Updated",
      },
    });
    await act(async () => {
      const result = await element.addNodes([
        {
          id: "add-1-to-container1",
          containerId: "container-1",
          data: {},
        },
        {
          id: "add-2-to-container1",
          containerId: "container-1",
          data: {},
        },
      ]);
      expect(result).toEqual([
        {
          data: {},
          id: "add-1-to-container1",
          type: "node",
          containerId: "container-1",
          groupId: undefined,
          useBrick: undefined,
          view: {
            height: 20,
            width: 20,
            x: 60,
            y: 170,
          },
        },
        {
          data: {},
          id: "add-2-to-container1",
          type: "node",
          containerId: "container-1",
          groupId: undefined,
          useBrick: undefined,
          view: {
            height: 20,
            width: 20,
            x: 90,
            y: 170,
          },
        },
      ]);
    });
    act(() => {
      document.body.removeChild(element);
    });
  });

  test("decorator group", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "group",
        id: "group-1",
        view: {
          x: 50,
          y: 400,
          width: 80,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "A",
        groupId: "group-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "B",
        groupId: "group-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "edge",
        source: "A",
        target: "B",
      },
    ];
    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      const result = await element.addNodes([
        {
          id: "add-1-to-group1",
          groupId: "group-1",
          data: {},
        },
      ]);
      expect(result).toEqual([
        {
          data: {},
          id: "add-1-to-group1",
          type: "node",
          groupId: "group-1",
          containerId: undefined,
          useBrick: undefined,
          view: {
            height: 20,
            width: 20,
            x: 90,
            y: 470,
          },
        },
      ]);
    });
    act(() => {
      document.body.removeChild(element);
    });
  });

  test("layered-staggered", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "container",
        id: "container-1",
        view: {
          text: "上层服务",
        },
      } as Cell,
      {
        type: "node",
        id: "A",
        containerId: "container-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "B",
        containerId: "container-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "C",
        containerId: "container-2",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "edge",
        source: "A",
        target: "B",
      },
      {
        type: "decorator",
        decorator: "container",
        id: "container-2",
        view: {
          x: 50,
          y: 400,
          width: 80,
          height: 60,
          direction: "right",
          text: "上游系统",
        },
      } as Cell,
      {
        type: "decorator",
        decorator: "container",
        id: "container-3",
        view: {
          x: 50,
          y: 400,
          width: 80,
          height: 60,
          direction: "bottom",
          text: "中台层",
        },
      } as Cell,
      {
        type: "decorator",
        decorator: "container",
        id: "container-4",
        view: {
          x: 500,
          y: 200,
          width: 380,
          height: 120,
          direction: "left",
          text: "接入层",
        },
      } as Cell,
      {
        type: "decorator",
        decorator: "group",
        containerId: "container-4",
        id: "group-1",
      } as Cell,
      {
        type: "node",
        id: "G",
        groupId: "group-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "node",
        id: "H",
        groupId: "group-1",
        view: {
          width: 60,
          height: 60,
        },
      } as Cell,
      {
        type: "edge",
        source: "G",
        target: "H",
      },
    ];
    element.layoutOptions = { initialLayout: "layered-staggered" };

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      const result = await element.addNodes([
        {
          id: "add-1-to-container1",
          containerId: "container-1",
          data: {},
        },
        {
          id: "add-2-to-container1",
          containerId: "container-1",
          data: {},
        },
      ]);
      expect(result).toEqual([
        {
          data: {},
          id: "add-1-to-container1",
          type: "node",
          containerId: "container-1",
          groupId: undefined,
          useBrick: undefined,
          view: {
            height: 20,
            width: 20,
            x: 30,
            y: 300,
          },
        },
        {
          data: {},
          id: "add-2-to-container1",
          type: "node",
          containerId: "container-1",
          groupId: undefined,
          useBrick: undefined,
          view: {
            height: 20,
            width: 20,
            x: 60,
            y: 300,
          },
        },
      ]);
    });
    act(() => {
      document.body.removeChild(element);
    });
  });

  test("edit decorator rect", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "decorator",
        decorator: "rect",
        id: "rect-1",
        view: {
          x: 100,
          y: 400,
          width: 280,
          height: 120,
          text: "上层服务",
        },
      } as Cell,
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(
      element.shadowRoot!.querySelector(".decorator-rect-container")?.children
        .length
    ).toBe(2);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("zoom bar", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
    ] as NodeBrickCell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    // Zoom in
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".zoom-button")!);
    });

    // Zoom out
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelectorAll(".zoom-button")[1]);
    });

    // Re-center
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".center-button")!);
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("degraded diagram", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "strong" } }];
    element.degradedThreshold = 50;
    element.cells = new Array(40).fill(null).map((_, i) => ({
      type: "node",
      id: `node-${i}`,
      view: {
        x: 20 + (i % 20) * 20,
        y: 20 + Math.floor(i / 20) * 20,
        width: 16,
        height: 16,
      },
    }));
    element.lineConnector = true;

    act(() => {
      document.body.appendChild(element);
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(element.shadowRoot?.querySelectorAll(".degraded").length).toBe(0);
    expect(element.shadowRoot?.querySelectorAll("strong").length).toBe(40);

    act(() => {
      fireEvent.mouseEnter(element.shadowRoot!.querySelector(".cell")!);
    });
    act(() => {
      fireEvent.mouseLeave(element.shadowRoot!.querySelector(".cell")!);
    });

    await act(async () => {
      await element.addNodes(
        new Array(10).fill(null).map((_, i) => ({
          type: "node",
          id: `node-${i + 40}`,
        }))
      );
    });

    expect(element.shadowRoot?.querySelectorAll(".degraded").length).toBe(50);
    expect(element.shadowRoot?.querySelectorAll("strong").length).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("disable contextmenu", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.dragBehavior = "lasso";
    element.ctrlDragBehavior = "grab";

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    // Right click only
    // This should not be prevented
    const contextMenuEvent1 = new MouseEvent("contextmenu");
    const preventDefault1 = jest.spyOn(contextMenuEvent1, "preventDefault");
    document.dispatchEvent(contextMenuEvent1);
    expect(preventDefault1).not.toHaveBeenCalled();

    // Ctrl + Right click
    // This should be prevented
    const contextMenuEvent2 = new MouseEvent("contextmenu", {
      ctrlKey: true,
    });
    const preventDefault2 = jest.spyOn(contextMenuEvent2, "preventDefault");
    document.dispatchEvent(contextMenuEvent2);
    expect(preventDefault2).toHaveBeenCalled();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("toggle lock", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
    ] as NodeBrickCell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(element.shadowRoot?.querySelector(".lock-icon")).toBe(null);

    let result1: Cell[] | null | undefined;
    await act(async () => {
      result1 = await element.toggleLock({ type: "node", id: "a" });
    });
    expect(result1).toEqual([
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
          locked: true,
        },
      },
    ]);
    expect(element.shadowRoot?.querySelector(".lock-icon")).not.toBe(null);

    let result2: Cell[] | null | undefined;
    await act(async () => {
      result2 = await element.toggleLock({ type: "node", id: "a" });
    });
    expect(result2).toEqual([
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
          locked: false,
        },
      },
    ]);
    expect(element.shadowRoot?.querySelector(".lock-icon")).toBe(null);

    let result3: Cell[] | null | undefined;
    await act(async () => {
      result3 = await element.unlock({ type: "node", id: "a" });
    });
    expect(result3).toEqual(null);
    expect(element.shadowRoot?.querySelector(".lock-icon")).toBe(null);

    let result4: Cell[] | null | undefined;
    await act(async () => {
      result4 = await element.lock({ type: "node", id: "a" });
    });
    expect(result4).toEqual([
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
          width: 20,
          height: 20,
          locked: true,
        },
      },
    ]);
    expect(element.shadowRoot?.querySelector(".lock-icon")).not.toBe(null);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("copy and paste ", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
      {
        type: "node",
        id: "b",
        view: {
          x: 20,
          y: 320,
        },
      },
    ] as NodeBrickCell[];

    const onCanvasCopy = jest.fn();
    const onCanvasPaste = jest.fn();
    element.addEventListener("canvas.copy", () => onCanvasCopy());

    element.addEventListener("canvas.paste", () => onCanvasPaste());

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    fireEvent.keyDown(element.shadowRoot!.querySelector("svg")!, {
      key: "c",
      ctrlKey: true,
    });

    expect(onCanvasCopy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(element.shadowRoot!.querySelector("svg")!, {
      key: "v",
      ctrlKey: true,
    });
    expect(onCanvasPaste).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("copy and paste ", async () => {
    const element = document.createElement("eo-draw-canvas") as EoDrawCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "node",
        id: "a",
        view: {
          x: 20,
          y: 20,
        },
      },
      {
        type: "node",
        id: "b",
        view: {
          x: 20,
          y: 320,
        },
      },
    ] as NodeBrickCell[];

    const onCanvasCopy = jest.fn();
    const onCanvasPaste = jest.fn();
    element.addEventListener("canvas.copy", () => onCanvasCopy());

    element.addEventListener("canvas.paste", () => onCanvasPaste());

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    fireEvent.keyDown(element.shadowRoot!.querySelector("svg")!, {
      key: "c",
      ctrlKey: true,
    });

    expect(onCanvasCopy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(element.shadowRoot!.querySelector("svg")!, {
      key: "v",
      ctrlKey: true,
    });
    expect(onCanvasPaste).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
