import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { MiniLineChart } from "./index.js";
import { drawMiniLineChart } from "./draw";

jest.mock("@next-core/theme", () => ({}));
jest.mock("./getRemoteWorker.js", () => ({
  getRemoteWorker() {
    return Promise.resolve({
      async init() {},
      async drawMiniLineChart() {},
      async dispose() {},
    });
  },
}));
jest.mock("./draw.js");

jest.mock(
  "resize-observer-polyfill",
  () =>
    class {
      #callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.#callback = callback;
      }
      disconnect() {}
      observe(target: Element) {
        Promise.resolve().then(() => {
          this.#callback(
            [
              { target, contentBoxSize: [{ inlineSize: 300, blockSize: 200 }] },
              {},
            ] as any,
            this
          );
        });
      }
      unobserve() {}
    }
);

describe("eo-mini-line-chart", () => {
  beforeEach(() => {
    HTMLCanvasElement.prototype.transferControlToOffscreen = null!;
  });

  test("basic usage", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.xField = "x";
    element.yField = "y";
    element.lineColor = "gray";
    element.data = [
      { x: 1000, y: 5 },
      { x: 1010, y: 10 },
      { x: 1020, y: 8 },
    ];

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <canvas
          data-id="canvas-1"
          height="40"
          style="width: 155px; height: 40px;"
          width="155"
        />,
        <span
          class="detector"
          style="color: gray;"
        />,
      ]
    `);
    expect(drawMiniLineChart).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pixelRatio: 1,
        width: 155,
        height: 40,
        padding: 1,
        smooth: undefined,
        lineColor: "rgb(128, 128, 128)",
        xField: "x",
        yField: "y",
        data: element.data,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("support transfer offscreen canvas", async () => {
    HTMLCanvasElement.prototype.transferControlToOffscreen = function (
      this: HTMLCanvasElement & { _transferred?: boolean }
    ) {
      if (this._transferred) {
        throw new Error("Canvas has already been transferred");
      }
      this._transferred = true;
      return { mock: "OffscreenCanvas" };
    } as any;

    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.smooth = false;
    element.data = [
      [1000, 5],
      [1010, 10],
      [1020, 8],
    ] as any[];

    act(() => {
      document.body.appendChild(element);
    });

    await Promise.resolve();

    expect(drawMiniLineChart).not.toHaveBeenCalled();

    element.smooth = true;
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("no data", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.width = "120";
    element.height = "60";

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <div
          style="width: 120px; height: 60px;"
        >
          <span>
            NO_DATA
          </span>
        </div>,
      ]
    `);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("auto width", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.width = "auto";

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(element.shadowRoot?.querySelector("div")?.style.width).toEqual(
      "300px"
    );

    // Switch to fixed width
    element.width = "260px";
    await act(async () => {
      await Promise.resolve();
    });
    expect(element.shadowRoot?.querySelector("div")?.style.width).toEqual(
      "260px"
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("auto height", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.height = "auto";

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      await Promise.resolve();
    });
    expect(element.shadowRoot?.querySelector("div")?.style.height).toEqual(
      "200px"
    );

    // Switch to fixed height
    element.height = "260px";
    await act(async () => {
      await Promise.resolve();
    });
    expect(element.shadowRoot?.querySelector("div")?.style.height).toEqual(
      "260px"
    );

    act(() => {
      document.body.removeChild(element);
    });
  });
});
