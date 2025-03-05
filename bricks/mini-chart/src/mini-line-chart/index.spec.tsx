import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { MiniLineChart } from "./index.js";
import { drawMiniLineChart } from "./draw";

jest.mock("@next-core/theme", () => ({}));
jest.mock("./worker.mjs", () => ({}));
jest.mock("./draw.js");

describe("eo-mini-line-chart", () => {
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
        lineColor: "gray",
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

  test("no smooth", async () => {
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

    expect(drawMiniLineChart).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pixelRatio: 1,
        width: 155,
        height: 40,
        padding: 1,
        smooth: false,
        lineColor: "",
        xField: "0",
        yField: "1",
        data: element.data,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("min equals to max while not zero", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.xField = "x";
    element.yField = "y";
    element.data = [
      { x: 1000, y: 5 },
      { x: 1010, y: 5 },
      { x: 1020, y: 5 },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    expect(drawMiniLineChart).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pixelRatio: 1,
        width: 155,
        height: 40,
        padding: 1,
        smooth: undefined,
        lineColor: "",
        xField: "x",
        yField: "y",
        data: element.data,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("min equals to max equals to zero", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.xField = "x";
    element.yField = "y";
    element.data = [
      { x: 1000, y: 0 },
      { x: 1010, y: 0 },
      { x: 1020, y: 0 },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    expect(drawMiniLineChart).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        pixelRatio: 1,
        width: 155,
        height: 40,
        padding: 1,
        smooth: undefined,
        lineColor: "",
        xField: "x",
        yField: "y",
        data: element.data,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("no data", async () => {
    const element = document.createElement(
      "eo-mini-line-chart"
    ) as MiniLineChart;
    element.width = 120;
    element.height = 60;

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
});
