import { describe, test, expect } from "@jest/globals";
import { getEditingLinePoints } from "./getEditingLinePoints";
import type {
  Cell,
  DecoratorCell,
  EdgeCell,
  LineEditorState,
} from "../../../draw-canvas/interfaces";
import type { HoverState } from "../../../draw-canvas/HoverStateContext";

describe("getEditingLinePoints", () => {
  const source = {
    id: "source-1",
    view: {
      x: 100,
      y: 200,
      width: 80,
      height: 60,
    },
  } as Cell;
  const target = {
    id: "target-1",
    view: {
      x: 200,
      y: 300,
      width: 80,
      height: 60,
    },
  } as Cell;
  const activeEditableLine = {
    type: "edge",
    source: "source-1",
    target: "target-1",
    view: {
      type: "polyline",
      exitPosition: { x: 0.5, y: 0.5 },
    },
  } as EdgeCell;
  const entryState = {
    type: "entry",
  } as LineEditorState;
  const exitState = {
    type: "exit",
  } as LineEditorState;

  test("null inputs", () => {
    expect(getEditingLinePoints(null, null, new WeakMap(), null, null)).toBe(
      null
    );
  });

  test("entry with hoverState.activePointIndex is defined", () => {
    expect(
      getEditingLinePoints(
        activeEditableLine,
        entryState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target } as any,
          ],
        ]),
        null,
        {
          relativePoints: [{ x: 0, y: 0.5 }],
          activePointIndex: 0,
          points: [],
        } as unknown as HoverState
      )
    ).toEqual([
      { x: 180, y: 230 },
      { x: 200, y: 230 },
      { x: 200, y: 280 },
      { x: 180, y: 280 },
      { x: 180, y: 330 },
      { x: 200, y: 330 },
    ]);
  });

  test("entry with connectLineTo", () => {
    expect(
      getEditingLinePoints(
        activeEditableLine,
        entryState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target } as any,
          ],
        ]),
        [150, 100],
        null
      )
    ).toEqual([
      { x: 180, y: 230 },
      { x: 200, y: 230 },
      { x: 200, y: 150 },
      { x: 150, y: 150 },
      { x: 150, y: 100 },
    ]);
  });

  test("exit with hoverState.activePointIndex is defined", () => {
    expect(
      getEditingLinePoints(
        activeEditableLine,
        exitState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target } as any,
          ],
        ]),
        null,
        {
          relativePoints: [{ x: 0, y: 0.5 }],
          activePointIndex: 0,
          points: [],
        } as unknown as HoverState
      )
    ).toEqual([
      { x: 100, y: 230 },
      { x: 80, y: 230 },
      { x: 80, y: 280 },
      { x: 240, y: 280 },
      { x: 240, y: 300 },
    ]);
  });

  test("exit with connectLineTo", () => {
    expect(
      getEditingLinePoints(
        activeEditableLine,
        exitState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target } as any,
          ],
        ]),
        [150, 100],
        null
      )
    ).toEqual([
      { x: 150, y: 100 },
      { x: 150, y: 200 },
      { x: 240, y: 200 },
      { x: 240, y: 300 },
    ]);
  });
});

describe("getEditingLinePoints with control", () => {
  const source = {
    view: {
      x: 100,
      y: 200,
      width: 80,
      height: 60,
    },
  } as Cell;
  const target = {
    view: {
      x: 300,
      y: 100,
      width: 80,
      height: 60,
    },
  } as Cell;
  const activeEditableLine = {
    view: {
      type: "polyline",
      exitPosition: { x: 1, y: 0.5 },
      entryPosition: { x: 0, y: 0.5 },
      vertices: [
        { x: 240, y: 230 },
        { x: 240, y: 130 },
      ],
    },
  } as EdgeCell;
  const points = [
    { x: 180, y: 230 },
    { x: 240, y: 230 },
    { x: 240, y: 130 },
    { x: 300, y: 130 },
  ];

  test("control pull down the first control", () => {
    //               ┌─────┐
    //           ┌───┤  T  │
    // ┌─────┐   │   └─────┘
    // │  S  ├─┬─┘
    // └─────┘ ↓
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 210, y: 230, index: 0, direction: "ns" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target, points } as any,
          ],
        ]),
        [215, 240],
        null
      )
    ).toEqual([
      { x: 180, y: 230 },
      { x: 180, y: 240 },
      { x: 240, y: 240 },
      { x: 240, y: 130 },
      { x: 300, y: 130 },
    ]);
  });

  test("control pull up the last control", () => {
    //             ↑ ┌─────┐
    //           ┌─┴─┤  T  │
    // ┌─────┐   │   └─────┘
    // │  S  ├───┘
    // └─────┘
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 270, y: 130, index: 2, direction: "ns" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target, points } as any,
          ],
        ]),
        [265, 120],
        null
      )
    ).toEqual([
      { x: 180, y: 230 },
      { x: 240, y: 230 },
      { x: 240, y: 120 },
      { x: 300, y: 120 },
      { x: 300, y: 130 },
    ]);
  });

  test("control pull left a intermediate control", () => {
    //               ┌─────┐
    //           ┌───┤  T  │
    // ┌─────┐  ←┤   └─────┘
    // │  S  ├───┘
    // └─────┘
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 240, y: 180, index: 1, direction: "ew" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target, points } as any,
          ],
        ]),
        [230, 179],
        null
      )
    ).toEqual([
      { x: 180, y: 230 },
      { x: 230, y: 230 },
      { x: 230, y: 130 },
      { x: 300, y: 130 },
    ]);
  });

  test("control pull left to collapse some vertices", () => {
    //               ┌─────┐
    //           ┌───┤  T  │
    // ┌─────┐←──┤   └─────┘
    // │  S  ├───┘
    // └─────┘
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 240, y: 180, index: 1, direction: "ew" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { edge: activeEditableLine, source, target, points } as any,
          ],
        ]),
        [180, 179],
        null
      )
    ).toEqual([
      { x: 180, y: 230 },
      { x: 180, y: 130 },
      { x: 300, y: 130 },
    ]);
  });
});

describe("getEditingLinePoints of decorator line with control", () => {
  const activeEditableLine = {
    id: "decorator-1",
    type: "decorator",
    decorator: "line",
    view: {
      source: {
        x: 100,
        y: 200,
      },
      target: {
        x: 300,
        y: 150,
      },
      x: 100,
      y: 150,
      width: 200,
      height: 50,
      type: "polyline",
      vertices: [
        { x: 240, y: 230 },
        { x: 240, y: 130 },
      ],
    },
  } as DecoratorCell;
  const points = [
    { x: 100, y: 200 },
    { x: 200, y: 200 },
    { x: 200, y: 150 },
    { x: 300, y: 150 },
  ];

  test("control pull down the first control", () => {
    //               ┌─────┐
    //           ┌───┤  T  │
    // ┌─────┐   │   └─────┘
    // │  S  ├─┬─┘
    // └─────┘ ↓
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 150, y: 200, index: 0, direction: "ns" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { decorator: activeEditableLine, points } as any,
          ],
        ]),
        [215, 240],
        null
      )
    ).toEqual([
      { x: 100, y: 200 },
      { x: 100, y: 240 },
      { x: 200, y: 240 },
      { x: 200, y: 150 },
      { x: 300, y: 150 },
    ]);
  });

  test("control pull up the last control", () => {
    //             ↑ ┌─────┐
    //           ┌─┴─┤  T  │
    // ┌─────┐   │   └─────┘
    // │  S  ├───┘
    // └─────┘
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 250, y: 150, index: 2, direction: "ns" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { decorator: activeEditableLine, points } as any,
          ],
        ]),
        [265, 120],
        null
      )
    ).toEqual([
      { x: 100, y: 200 },
      { x: 200, y: 200 },
      { x: 200, y: 120 },
      { x: 300, y: 120 },
      { x: 300, y: 150 },
    ]);
  });

  test("control pull left a intermediate control", () => {
    //               ┌─────┐
    //           ┌───┤  T  │
    // ┌─────┐  ←┤   └─────┘
    // │  S  ├───┘
    // └─────┘
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 200, y: 175, index: 1, direction: "ew" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { decorator: activeEditableLine, points } as any,
          ],
        ]),
        [230, 179],
        null
      )
    ).toEqual([
      { x: 100, y: 200 },
      { x: 230, y: 200 },
      { x: 230, y: 150 },
      { x: 300, y: 150 },
    ]);
  });

  test("control pull left to collapse some vertices", () => {
    //               ┌─────┐
    //           ┌───┤  T  │
    // ┌─────┐←──┤   └─────┘
    // │  S  ├───┘
    // └─────┘
    expect(
      getEditingLinePoints(
        activeEditableLine,
        {
          type: "control",
          control: { x: 200, y: 175, index: 1, direction: "ew" },
        } as LineEditorState,
        new WeakMap([
          [
            activeEditableLine,
            { decorator: activeEditableLine, points } as any,
          ],
        ]),
        [100, 179],
        null
      )
    ).toEqual([
      { x: 100, y: 200 },
      { x: 100, y: 150 },
      { x: 300, y: 150 },
    ]);
  });

  test("conner", () => {
    const altLine = {
      ...activeEditableLine,
      view: {
        ...activeEditableLine.view,
        type: "straight",
        vertices: [{ x: 100, y: 150 }],
      },
    };

    expect(
      getEditingLinePoints(
        altLine,
        {
          type: "corner",
          control: { x: 100, y: 150, index: 0 },
        } as LineEditorState,
        new WeakMap([
          [
            altLine,
            {
              decorator: altLine,
              points: [
                { x: 100, y: 200 },
                { x: 100, y: 150 },
                { x: 300, y: 150 },
              ],
            } as any,
          ],
        ]),
        [90, 135],
        null
      )
    ).toEqual([
      { x: 100, y: 200 },
      { x: 90, y: 135 },
      { x: 300, y: 150 },
    ]);
  });

  test("break", () => {
    const altLine = {
      ...activeEditableLine,
      view: {
        ...activeEditableLine.view,
        type: "straight",
        vertices: undefined,
      },
    };

    expect(
      getEditingLinePoints(
        altLine,
        {
          type: "break",
          control: { x: 200, y: 175, index: 0 },
        } as LineEditorState,
        new WeakMap([
          [
            altLine,
            {
              decorator: altLine,
              points: [
                { x: 100, y: 200 },
                { x: 300, y: 150 },
              ],
            } as any,
          ],
        ]),
        [150, 170],
        null
      )
    ).toEqual([
      { x: 100, y: 200 },
      { x: 150, y: 170 },
      { x: 300, y: 150 },
    ]);
  });
});
