import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import "./";
import type { EoDisplayCanvas } from "./index.js";
import type { Cell, EdgeLineConf } from "../draw-canvas/interfaces";
import ResizeObserver from "resize-observer-polyfill";

global.ResizeObserver = ResizeObserver as any;
jest.mock("@next-core/theme", () => ({}));
jest.mock("d3-drag");
jest.mock("resize-observer-polyfill", () => ({
  __esModule: true,
  default: function (callback: ResizeObserverCallback) {
    callback([], null!);
    return {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };
  },
}));
(Element as any).prototype.getTotalLength = jest.fn(() => 100);

describe("eo-display-canvas", () => {
  test("hover", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.fadeUnrelatedCells = true;
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
        type: "edge",
        source: "a",
        target: "b",
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
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      },
      {
        type: "decorator",
        id: "container-1",
        decorator: "container",
        view: {
          x: 50,
          y: 400,
          width: 280,
          height: 120,
          direction: "top",
          text: " 上层服务",
        },
      },
    ] as Cell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    // MouseEnter node a
    act(() => {
      fireEvent.mouseEnter(element.shadowRoot!.querySelectorAll(".cell")[2]!);
    });
    expect(
      [...element.shadowRoot!.querySelectorAll(".cells .cell")].map((cell) =>
        cell.classList.contains("faded")
      )
    ).toEqual([true, false, false, false, true, true]);

    // MouseLeave node b
    act(() => {
      fireEvent.mouseLeave(element.shadowRoot!.querySelectorAll(".cell")[3]!);
    });
    // No effects
    expect(
      element.shadowRoot!.querySelectorAll(".cells .cell.faded").length
    ).toBe(3);

    // MouseLeave node a
    act(() => {
      fireEvent.mouseLeave(element.shadowRoot!.querySelectorAll(".cell")[2]!);
    });
    expect(
      element.shadowRoot!.querySelectorAll(".cells .cell.faded").length
    ).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("context menu", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
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
    ] as Cell[];

    const onActiveTargetChange = jest.fn();
    element.addEventListener("activeTarget.change", (e) =>
      onActiveTargetChange((e as CustomEvent).detail)
    );
    const onCellContextMenu = jest.fn();
    element.addEventListener("cell.contextmenu", (e) =>
      onCellContextMenu((e as CustomEvent).detail)
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

    expect(onCellContextMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        cell: expect.objectContaining({
          type: "node",
          id: "a",
        }),
        clientX: 100,
        clientY: 200,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("click on cell", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
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
        type: "decorator",
        decorator: "text",
        id: "b",
        view: {
          x: 20,
          y: 320,
          width: 20,
          height: 100,
        },
      },
    ] as Cell[];

    const onCellClick = jest.fn();
    element.addEventListener("cell.click", (e) =>
      onCellClick((e as CustomEvent).detail)
    );

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".cell")!, {
        clientX: 100,
        clientY: 200,
      });
    });

    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(onCellClick).toHaveBeenCalledWith(
      expect.objectContaining({
        cell: {
          type: "node",
          id: "a",
          view: { x: 20, y: 20, width: 20, height: 20 },
        },
        clientX: 100,
        clientY: 200,
      })
    );

    // Click on a decorator will not trigger `cell.click`
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".cell + .cell")!, {
        clientX: 100,
        clientY: 200,
      });
    });
    expect(onCellClick).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("zoom bar", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
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
    ] as Cell[];

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

  test("dagre layout", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.layout = "dagre";
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
        type: "edge",
        source: "a",
        target: "b",
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
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      },
    ] as Cell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => (global as any).flushPromises());
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(
      [...element.shadowRoot!.querySelectorAll(".cell")].map((cell) =>
        cell.getAttribute("transform")
      )
    ).toEqual(["translate(10,10)", null, null, null, "translate(150,160)"]);

    expect(
      [...element.shadowRoot!.querySelectorAll(".cell .node > *")].map((cell) =>
        [
          (cell as HTMLElement).style.left,
          (cell as HTMLElement).style.top,
        ].join(",")
      )
    ).toEqual(["0px,0px", "0px,50px"]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("dagre layout with empty nodes", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.layout = "dagre";
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
    ] as Cell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => (global as any).flushPromises());
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(element.shadowRoot!.querySelectorAll(".cell").length).toBe(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("force layout", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.layout = "force";
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
        type: "edge",
        source: "a",
        target: "b",
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
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      },
    ] as Cell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => (global as any).flushPromises());
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(
      [...element.shadowRoot!.querySelectorAll(".cell")].map((cell) =>
        cell.getAttribute("transform")
      )
    ).toEqual(["translate(10,10)", null, null, null, "translate(150,160)"]);

    expect(
      [...element.shadowRoot!.querySelectorAll(".cell .node > *")].map((cell) =>
        [
          (cell as HTMLElement).style.left,
          (cell as HTMLElement).style.top,
        ].join(",")
      )
    ).toEqual([
      expect.stringMatching(/^16\.01\d+px,-8\.22\d+px$/),
      expect.stringMatching(/^-16\.01\d+px,8\.22\d+px$/),
    ]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("line conf", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.cells = [
      {
        type: "edge",
        source: "a",
        target: "b",
        view: {
          exitPosition: { x: 0.5, y: 1 },
          entryPosition: { x: 0.5, y: 0 },
        },
      },
      {
        type: "edge",
        source: "b",
        target: "c",
        data: {
          dotted: true,
          showStartArrow: true,
          showEndArrow: false,
        },
      },
      {
        type: "edge",
        source: "b",
        target: "a",
        data: {
          dashed: true,
          strokeColor: "blue",
          markers: [
            {
              type: null,
              placement: "start",
            },
            {
              type: "circle",
              placement: "end",
            },
          ],
          strokeWidth: 5,
          parallelGap: 5,
          animate: {
            useAnimate: true,
          },
        },
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
          x: 320,
          y: 320,
        },
      },
    ] as Cell[];
    element.defaultEdgeLines = [
      { if: "<% DATA.edge.source === 'a' %>", strokeColor: "red" },
      {
        if: true,
        dashed: "<% DATA.edge?.data?.dashed %>",
        dotted: "<% DATA.edge?.data?.dotted %>",
        strokeColor: "<% DATA.edge?.data?.strokeColor %>",
        markers: "<% DATA.edge?.data?.markers %>",
        showStartArrow: "<% DATA.edge?.data?.showStartArrow %>",
        showEndArrow: "<% DATA.edge?.data?.showEndArrow %>",
        strokeWidth: "<% DATA.edge?.data?.strokeWidth %>",
        parallelGap: "<% DATA.edge?.data?.parallelGap %>",
        animate: "<% DATA.edge?.data?.animate %>",
        overrides: {
          active: {
            strokeColor: "cyan",
          },
          activeRelated: {
            strokeColor: "orange",
          },
        },
      } as any as EdgeLineConf,
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => (global as any).flushPromises());
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(
      [...element.shadowRoot!.querySelectorAll("marker path")].map(
        (markerPath) => (markerPath as SVGPathElement).getAttribute("stroke")
      )
    ).toEqual(["gray", "red", "cyan", "orange", "blue"]);
    expect(element.shadowRoot!.querySelectorAll("path.dotted").length).toBe(1);
    expect(element.shadowRoot!.querySelectorAll("marker circle").length).toBe(
      3
    );
    expect(
      element.shadowRoot!.querySelectorAll(".dashed-animation").length
    ).toBe(1);
    act(() => {
      document.body.removeChild(element);
    });
  });

  test("update cells", async () => {
    const element = document.createElement(
      "eo-display-canvas"
    ) as EoDisplayCanvas;
    element.defaultNodeBricks = [{ useBrick: { brick: "div" } }];
    element.layout = "force";
    element.autoCenterWhenCellsChange = true;
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
        type: "edge",
        source: "a",
        target: "b",
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
        type: "decorator",
        decorator: "text",
        id: "text-1",
        view: {
          x: 150,
          y: 160,
        },
      },
    ] as Cell[];

    act(() => {
      document.body.appendChild(element);
    });

    await act(() => (global as any).flushPromises());
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(element.shadowRoot!.querySelectorAll(".cell").length).toEqual(5);

    element.cells = element.cells.concat({
      type: "node",
      id: "c",
      view: {
        x: 320,
        y: 20,
      },
    });

    await act(() => (global as any).flushPromises());
    await act(() => new Promise((resolve) => setTimeout(resolve, 1)));

    expect(element.shadowRoot!.querySelectorAll(".cell").length).toEqual(6);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
