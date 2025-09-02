import { describe, test, expect } from "@jest/globals";
import { updateCells } from "./updateCells";
import { SYMBOL_FOR_SIZE_INITIALIZED } from "../constants";
import { Cell, DecoratorView } from "../interfaces";

describe("updateCells", () => {
  test("add related nodes on right side of siblings", () => {
    expect(
      updateCells({
        cells: [
          {
            type: "decorator",
            decorator: "area",
            id: "area-a",
            view: {
              x: 1,
              y: 2,
              width: 3,
              height: 4,
            },
          },
          {
            type: "edge",
            source: "1",
            target: "2",
          },
          {
            type: "edge",
            source: "1",
            target: "3",
          },
          {
            type: "edge",
            source: "1",
            target: "4",
          },
          {
            id: "1",
            type: "node",
            view: {
              x: 100,
              y: 30,
            },
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 160,
              y: 100,
            },
          },
          {
            id: "3",
            type: "node",
            view: {
              x: 20,
              y: 100,
            },
          },
          {
            id: "4",
            type: "node",
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
        reason: "add-related-nodes",
        parent: "1",
      })
    ).toEqual({
      cells: [
        {
          type: "decorator",
          decorator: "area",
          id: "area-a",
          view: {
            x: 1,
            y: 2,
            width: 3,
            height: 4,
          },
        },
        {
          type: "edge",
          source: "1",
          target: "2",
        },
        {
          type: "edge",
          source: "1",
          target: "3",
        },
        {
          type: "edge",
          source: "1",
          target: "4",
        },
        {
          id: "1",
          type: "node",
          view: {
            x: 100,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            x: 160,
            y: 100,
            height: 80,
            width: 120,
          },
        },
        {
          id: "3",
          type: "node",
          view: {
            x: 20,
            y: 100,
            height: 80,
            width: 120,
          },
        },
        {
          id: "4",
          type: "node",
          view: {
            x: 256,
            y: 160,
            height: 80,
            width: 120,
          },
        },
      ],
      updated: [
        {
          id: "4",
          type: "node",
          view: {
            x: 256,
            y: 160,
            height: 80,
            width: 120,
          },
        },
      ],
      shouldReCenter: false,
    });
  });

  test("add related nodes with force layout", () => {
    expect(
      updateCells({
        cells: [
          {
            type: "decorator",
            decorator: "area",
            id: "area-a",
            view: {
              x: 1,
              y: 2,
              width: 3,
              height: 4,
            },
          },
          {
            type: "edge",
            source: "1",
            target: "2",
          },
          {
            type: "edge",
            source: "1",
            target: "3",
          },
          {
            type: "edge",
            source: "1",
            target: "4",
          },
          {
            id: "1",
            type: "node",
            view: {
              x: 100,
              y: 30,
            },
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 160,
              y: 100,
            },
          },
          {
            id: "3",
            type: "node",
            view: {
              x: 20,
              y: 100,
            },
          },
          {
            id: "4",
            type: "node",
          },
        ],
        layout: "force",
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
        reason: "add-related-nodes",
        parent: "1",
      })
    ).toEqual({
      cells: [
        {
          type: "decorator",
          decorator: "area",
          id: "area-a",
          view: {
            x: 1,
            y: 2,
            width: 3,
            height: 4,
          },
        },
        {
          type: "edge",
          source: "1",
          target: "2",
        },
        {
          type: "edge",
          source: "1",
          target: "3",
        },
        {
          type: "edge",
          source: "1",
          target: "4",
        },
        {
          id: "1",
          type: "node",
          view: {
            x: 100,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            x: 160,
            y: 100,
            height: 80,
            width: 120,
          },
        },
        {
          id: "3",
          type: "node",
          view: {
            x: 20,
            y: 100,
            height: 80,
            width: 120,
          },
        },
        {
          id: "4",
          type: "node",
          view: {
            height: 80,
            width: 120,
          },
        },
      ],
      updated: [
        {
          id: "4",
          type: "node",
          view: {
            height: 80,
            width: 120,
          },
        },
      ],
      shouldReCenter: false,
    });
  });

  test("add related nodes below parent", () => {
    expect(
      updateCells({
        cells: [
          {
            type: "edge",
            source: "1",
            target: "2",
          },
          {
            type: "edge",
            source: "2",
            target: "3",
          },
          {
            id: "1",
            type: "node",
            view: {
              x: 100,
              y: 30,
            },
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 20,
              y: 100,
            },
          },
          {
            id: "3",
            type: "node",
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
        reason: "add-related-nodes",
        parent: "2",
      })
    ).toEqual({
      cells: [
        {
          type: "edge",
          source: "1",
          target: "2",
        },
        {
          type: "edge",
          source: "2",
          target: "3",
        },
        {
          id: "1",
          type: "node",
          view: {
            x: 100,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            x: 20,
            y: 100,
            height: 80,
            width: 120,
          },
        },
        {
          id: "3",
          type: "node",
          view: {
            x: 20,
            y: 230,
            height: 80,
            width: 120,
          },
        },
      ],
      updated: [
        {
          id: "3",
          type: "node",
          view: {
            x: 20,
            y: 230,
            height: 80,
            width: 120,
          },
        },
      ],
      shouldReCenter: false,
    });
  });

  test("no reason", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
          },
          {
            id: "2",
            type: "node",
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          view: {
            height: 80,
            width: 120,
            x: 60,
            y: 40,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            height: 80,
            width: 120,
            x: 230,
            y: 40,
          },
        },
      ],
      updated: [expect.anything(), expect.anything()],
      // dagre layout
      shouldReCenter: true,
    });
  });

  test("parent unpositioned", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
          },
          {
            id: "2",
            type: "node",
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
        reason: "add-related-nodes",
        parent: "1",
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          view: {
            height: 80,
            width: 120,
            x: 60,
            y: 40,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            height: 80,
            width: 120,
            x: 230,
            y: 40,
          },
        },
      ],
      updated: [expect.anything(), expect.anything()],
      // dagre layout
      shouldReCenter: true,
    });
  });

  test("all positioned", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
            view: {
              x: 100,
              y: 30,
            },
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 300,
              y: 30,
            },
          },
        ],
        previousCells: [
          {
            id: "1",
            type: "node",
            view: {
              x: 100,
              y: 30,
              width: 160,
              height: 100,
            },
            [SYMBOL_FOR_SIZE_INITIALIZED]: true,
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 300,
              y: 30,
              width: 160,
              height: 100,
            },
          },
        ],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
        reason: "add-related-nodes",
        parent: "1",
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          view: {
            x: 100,
            y: 30,
            height: 100,
            width: 160,
          },
          [SYMBOL_FOR_SIZE_INITIALIZED]: true,
        },
        {
          id: "2",
          type: "node",
          view: {
            x: 300,
            y: 30,
            height: 80,
            width: 120,
          },
        },
      ],
      updated: [],
      shouldReCenter: false,
    });
  });

  test("previous not centered", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
            view: {
              x: 12000,
              y: 30,
            },
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 12300,
              y: 30,
            },
          },
          {
            id: "3",
            type: "node",
            view: {} as any,
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          view: {
            x: 12000,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            x: 12300,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "3",
          type: "node",
          view: {
            x: expect.closeTo(12150, 0),
            y: expect.closeTo(130, 0),
            height: 80,
            width: 120,
          },
        },
      ],
      updated: [
        {
          id: "3",
          type: "node",
          view: {
            x: expect.closeTo(12150, 0),
            y: expect.closeTo(130, 0),
            height: 80,
            width: 120,
          },
        },
      ],
      shouldReCenter: false,
    });
  });

  test("previous not centered with force layout", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
            view: {
              x: 12000,
              y: 30,
            },
          },
          {
            id: "2",
            type: "node",
            view: {
              x: 12300,
              y: 30,
            },
          },
          {
            id: "3",
            type: "node",
            view: {} as any,
          },
        ],
        layout: "force",
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          view: {
            x: 12000,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "2",
          type: "node",
          view: {
            x: 12300,
            y: 30,
            height: 80,
            width: 120,
          },
        },
        {
          id: "3",
          type: "node",
          view: {
            height: 80,
            width: 120,
          },
        },
      ],
      updated: [
        {
          id: "3",
          type: "node",
          view: {
            height: 80,
            width: 120,
          },
        },
      ],
      shouldReCenter: false,
    });
  });

  test("a single positioned node", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
            view: {
              x: 100,
              y: 30,
            },
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          view: {
            x: 100,
            y: 30,
            width: 120,
            height: 80,
          },
        },
      ],
      updated: [],
      shouldReCenter: false,
    });
  });

  test("Initialize the container node", () => {
    expect(
      updateCells({
        cells: [
          {
            id: "1",
            type: "node",
            containerId: "container-1",
            view: {
              x: 100,
              y: 30,
            },
          },
          {
            id: "container-1",
            decorator: "container",
            type: "decorator",
            view: {
              direction: "left",
            } as DecoratorView,
          },
        ],
        previousCells: [],
        defaultNodeSize: [120, 80],
        canvasWidth: 800,
        canvasHeight: 600,
        scaleRange: [0.5, 2],
        transform: { k: 1, x: 0, y: 0 },
      })
    ).toEqual({
      cells: [
        {
          id: "1",
          type: "node",
          containerId: "container-1",
          view: {
            x: 100,
            y: 30,
            width: 120,
            height: 80,
          },
        },
        {
          id: "container-1",
          decorator: "container",
          type: "decorator",
          view: {
            direction: "left",
            height: 160,
            width: 200,
            x: 60,
            y: -10,
          },
        },
      ],
      updated: [
        {
          id: "container-1",
          decorator: "container",
          type: "decorator",
          view: {
            direction: "left",
            height: 160,
            width: 200,
            x: 60,
            y: -10,
          },
        },
      ],
      shouldReCenter: false,
    });
  });

  test("siblings alternate left-right placement", () => {
    const result = updateCells({
      cells: [
        { type: "edge", source: "1", target: "2" },
        { type: "edge", source: "1", target: "3" },
        { type: "edge", source: "1", target: "4" },
        { type: "edge", source: "1", target: "5" },
        { type: "edge", source: "2", target: "6" },
        { type: "edge", source: "2", target: "7" },
        {
          id: "1",
          type: "node",
          view: { x: 200, y: 50, height: 100, width: 60 },
        },
        { id: "2", type: "node" },
        { id: "3", type: "node" },
        { id: "4", type: "node" },
        { id: "5", type: "node" },
        { id: "6", type: "node" },
      ],
      previousCells: [],
      defaultNodeSize: [100, 60],
      canvasWidth: 800,
      canvasHeight: 600,
      scaleRange: [0.5, 2],
      transform: { k: 1, x: 0, y: 0 },
      layoutOptions: {
        initialLayout: "layered-staggered",
      },
      reason: "add-related-nodes",
      parentNode: {
        id: "1",
        type: "node",
        view: { x: 200, y: 50, height: 100, width: 60 },
      },
    });
    const views = result.updated.map((n) => n?.view?.x);
    expect(new Set(views).size).toBe(4);
  });

  test("missing parent falls back to default layout", () => {
    const result = updateCells({
      cells: [
        {
          id: "1",
          type: "node",
          view: { x: 200, y: 50, height: 100, width: 60 },
        },
        { id: "2", type: "node" },
      ],
      previousCells: [
        {
          id: "1",
          type: "node",
          view: { x: 200, y: 50, height: 100, width: 60 },
        },
        { id: "2", type: "node" } as Cell,
      ],
      defaultNodeSize: [120, 80],
      canvasWidth: 800,
      canvasHeight: 600,
      scaleRange: [0.5, 2],
      transform: { k: 1, x: 0, y: 0 },
      reason: "add-related-nodes",
    });
    expect(result.updated.length).toBeGreaterThan(0);
    expect(result.shouldReCenter).toBe(true);
  });
});
