import { describe, test, expect } from "@jest/globals";
import { getPolyLinePoints } from "./getPolyLinePoints";
import type { NodePosition } from "../interfaces";

describe("getPolyLinePoints", () => {
  test.each<
    [name: string, Parameters<typeof getPolyLinePoints>, output: NodePosition[]]
  >([
    [
      //    ┌──────────────┐
      // ┌──┴──┐   ┌─────┐ │
      // │  S  │   │  T  ├─┘
      // └─────┘   └─────┘
      "top to right 👆👉👇👈",
      [
        { x: 100, y: 100, width: 180, height: 120 },
        { x: 400, y: 100, width: 180, height: 120 },
        "top",
        "right",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 40 },
        { x: 100, y: 20 },
        { x: 510, y: 20 },
        { x: 510, y: 100 },
        { x: 490, y: 100 },
      ],
    ],
    [
      //     ┌─────┐
      //     │  T  ├─┐
      //     └─────┘ │
      //    ┌────────┘
      // ┌──┴──┐
      // │  S  │
      // └─────┘
      "top to right 👆👉👆👈 (1)",
      [
        { x: 100, y: 300, width: 180, height: 120 },
        { x: 150, y: 100, width: 180, height: 120 },
        "top",
        "right",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 240 },
        { x: 100, y: 200 },
        { x: 260, y: 200 },
        { x: 260, y: 100 },
        { x: 240, y: 100 },
      ],
    ],
    [
      //           ┌─────┐
      //    ┌────┐ │  T  ├─┐
      // ┌──┴──┐ │ └─────┘ │
      // │  S  │ └─────────┘
      // └─────┘
      "top to right 👆👉👇👉👆👈",
      [
        { x: 100, y: 150, width: 180, height: 120 },
        { x: 400, y: 100, width: 180, height: 120 },
        "top",
        "right",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 90 },
        { x: 100, y: 70 },
        { x: 250, y: 70 },
        { x: 250, y: 180 },
        { x: 510, y: 180 },
        { x: 510, y: 100 },
        { x: 490, y: 100 },
      ],
    ],
    [
      //       ┌─────┐
      //    ┌──┤  T  │
      //    │  └─────┘
      // ┌──┴──┐
      // │  S  │
      // └─────┘
      "top to left 👆👉",
      [
        { x: 100, y: 200, width: 180, height: 120 },
        { x: 400, y: 100, width: 180, height: 120 },
        "top",
        "left",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 140 },
        { x: 100, y: 100 },
        { x: 310, y: 100 },
      ],
    ],
    [
      // ┌─────┐
      // │  T  ├─┐
      // └─────┘ │
      //       ┌─┘
      //    ┌──┴──┐
      //    │  S  │
      //    └─────┘
      "top to right 👆👉👆👈 (2)",
      [
        { x: 190, y: 300, width: 180, height: 120 },
        { x: 100, y: 100, width: 180, height: 120 },
        "top",
        "right",
        0.5,
        0.5,
      ],
      [
        { x: 190, y: 240 },
        { x: 190, y: 200 },
        { x: 210, y: 200 },
        { x: 210, y: 100 },
        { x: 190, y: 100 },
      ],
    ],
    [
      //         ┌────┐
      //         │ ┌──┴──┐
      //         │ │  S  │
      // ┌─────┐ │ └─────┘
      // │  T  ├─┘
      // └─────┘
      "top to right 👆👈👇👈",
      [
        { x: 400, y: 100, width: 180, height: 120 },
        { x: 100, y: 150, width: 180, height: 120 },
        "top",
        "right",
        0.5,
        0.5,
      ],
      [
        { x: 400, y: 40 },
        { x: 400, y: 20 },
        { x: 250, y: 20 },
        { x: 250, y: 150 },
        { x: 190, y: 150 },
      ],
    ],
    [
      //     ┌────┐
      //     │ ┌──┴──┐
      //     │ │  S  │
      //     │ └─────┘
      //     └───┐
      // ┌─────┐ │
      // │  T  ├─┘
      // └─────┘
      "top to right 👆👈👇👉👇👈",
      [
        { x: 200, y: 100, width: 180, height: 120 },
        { x: 100, y: 200, width: 180, height: 120 },
        "top",
        "right",
        0.5,
        0.5,
      ],
      [
        { x: 200, y: 40 },
        { x: 200, y: 20 },
        { x: 90, y: 20 },
        { x: 90, y: 150 },
        { x: 210, y: 150 },
        { x: 210, y: 200 },
        { x: 190, y: 200 },
      ],
    ],
    [
      //    ┌─────────┐
      //    │      ┌──┴──┐
      //    │      │  T  │
      // ┌──┴──┐   └─────┘
      // │  S  │
      // └─────┘
      "top to top 👆👉👇",
      [
        { x: 100, y: 200, width: 180, height: 120 },
        { x: 400, y: 100, width: 180, height: 120 },
        "top",
        "top",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 140 },
        { x: 100, y: 20 },
        { x: 400, y: 20 },
        { x: 400, y: 40 },
      ],
    ],
    [
      //  ┌────┐
      //  │ ┌──┴──┐
      //  │ │  T  │
      //  │ └─────┘
      //  └─┐
      // ┌──┴──┐
      // │  S  │
      // └─────┘
      "top to top 👆👈👆👉👇",
      [
        { x: 100, y: 300, width: 180, height: 120 },
        { x: 150, y: 100, width: 180, height: 120 },
        "top",
        "top",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 240 },
        { x: 100, y: 200 },
        { x: 40, y: 200 },
        { x: 40, y: 20 },
        { x: 150, y: 20 },
        { x: 150, y: 40 },
      ],
    ],
    [
      //           ┌─────┐
      // ┌─────────┤  T  │
      // │ ┌─────┐ └─────┘
      // └─┤  S  │
      //   └─────┘
      "left to left 👈👆👉",
      [
        { x: 100, y: 200, width: 180, height: 120 },
        { x: 400, y: 100, width: 180, height: 120 },
        "left",
        "left",
        0.5,
        0.5,
      ],
      [
        { x: 10, y: 200 },
        { x: -10, y: 200 },
        { x: -10, y: 100 },
        { x: 310, y: 100 },
      ],
    ],
    [
      // ┌─────────┐
      // │ ┌─────┐ │ ┌─────┐
      // └─┤  S  │ └─┤  T  │
      //   └─────┘   └─────┘
      "left to left 👈👆👉👇👉",
      [
        { x: 100, y: 200, width: 180, height: 120 },
        { x: 400, y: 200, width: 180, height: 120 },
        "left",
        "left",
        0.5,
        0.5,
      ],
      [
        { x: 10, y: 200 },
        { x: -10, y: 200 },
        { x: -10, y: 280 },
        { x: 250, y: 280 },
        { x: 250, y: 200 },
        { x: 310, y: 200 },
      ],
    ],
    [
      // ┌─────┐
      // │  T  │
      // └──┬──┘
      //    │
      // ┌──┴──┐
      // │  S  │
      // └─────┘
      "top to bottom 👆",
      [
        { x: 100, y: 300, width: 180, height: 120 },
        { x: 100, y: 100, width: 180, height: 120 },
        "top",
        "bottom",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 240 },
        { x: 100, y: 160 },
      ],
    ],
    [
      //     ┌─────┐
      //     │  T  │
      //     └──┬──┘
      //    ┌───┘
      // ┌──┴──┐
      // │  S  │
      // └─────┘
      "top to bottom 👆👉👆",
      [
        { x: 100, y: 300, width: 180, height: 120 },
        { x: 150, y: 100, width: 180, height: 120 },
        "top",
        "bottom",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 240 },
        { x: 100, y: 200 },
        { x: 150, y: 200 },
        { x: 150, y: 160 },
      ],
    ],
    [
      // ┌─────┐
      // │  T  │
      // └──┬──┘
      // ┌──┴──┐
      // │  S  │
      // └─────┘
      "top to bottom 👆",
      [
        { x: 100, y: 230, width: 180, height: 120 },
        { x: 100, y: 100, width: 180, height: 120 },
        "top",
        "bottom",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 170 },
        { x: 100, y: 160 },
      ],
    ],
    [
      //           ┌─────┐
      //    ┌────┐ │  T  │
      // ┌──┴──┐ │ └──┬──┘
      // │  S  │ └────┘
      // └─────┘
      "top to bottom 👆👉👇👉👆",
      [
        { x: 100, y: 150, width: 180, height: 120 },
        { x: 400, y: 100, width: 180, height: 120 },
        "top",
        "bottom",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 90 },
        { x: 100, y: 70 },
        { x: 250, y: 70 },
        { x: 250, y: 180 },
        { x: 400, y: 180 },
        { x: 400, y: 160 },
      ],
    ],
    [
      //      ┌────┐
      //   ┌──┴──┐ │
      //   │  S  │ │
      //   └─────┘ │
      // ┌─────────┘
      // │ ┌─────┐
      // │ │  T  │
      // │ └──┬──┘
      // └────┘
      "top to bottom 👆👉👇👈👇👉👆",
      [
        { x: 100, y: 100, width: 180, height: 120 },
        { x: 100, y: 300, width: 180, height: 120 },
        "top",
        "bottom",
        0.5,
        0.5,
      ],
      [
        { x: 100, y: 40 },
        { x: 100, y: 20 },
        { x: 210, y: 20 },
        { x: 210, y: 200 },
        { x: -10, y: 200 },
        { x: -10, y: 380 },
        { x: 100, y: 380 },
        { x: 100, y: 360 },
      ],
    ],
  ])("%s", (_name, args, output) => {
    expect(getPolyLinePoints(...args)).toEqual(output);
  });
});
