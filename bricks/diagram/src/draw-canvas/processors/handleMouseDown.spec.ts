import { describe, test, expect, jest } from "@jest/globals";
import { fireEvent } from "@testing-library/dom";
import { handleMouseDown } from "./handleMouseDown";
import type { ActiveTarget, Cell, DecoratorCell } from "../interfaces";

describe("handleMouseDown", () => {
  const onCellsMoving = jest.fn();
  const onCellsMoved = jest.fn();
  const onCellResizing = jest.fn();
  const onCellResized = jest.fn();
  const onSwitchActiveTarget = jest.fn();
  const methods = {
    onCellsMoving,
    onCellsMoved,
    onCellResizing,
    onCellResized,
    onSwitchActiveTarget,
    scale: 1,
    cells: [],
    activeTarget: null,
  };

  test("mousedown on edge", () => {
    const noopMouseDown = new MouseEvent("mousedown");
    handleMouseDown(noopMouseDown, {
      cell: { type: "edge", source: "a", target: "b" },
      action: "move",
      ...methods,
    });
    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "edge",
      source: "a",
      target: "b",
    });
  });

  test("move node", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "move",
      cell: { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
      ...methods,
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "node",
      id: "b",
    });

    fireEvent.mouseMove(document, { clientX: 11, clientY: 22 });
    expect(onCellsMoving).not.toHaveBeenCalled();

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).toHaveBeenCalledWith([
      {
        type: "node",
        id: "b",
        x: 19,
        y: 36,
        guideLines: [],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      { type: "node", id: "b", x: 20, y: 37 },
    ]);

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });

  test("move container node", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "move",
      cell: {
        type: "decorator",
        id: "container-1",
        decorator: "container",
        view: { x: 4, y: 6 },
      } as any,
      ...methods,
      cells: [
        {
          type: "node",
          id: "a",
          containerId: "container-1",
          view: {
            x: 20,
            y: 50,
            width: 60,
            height: 60,
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
        {
          type: "decorator",
          id: "group-1",
          decorator: "group",
          containerId: "container-1",
          view: {
            x: 80,
            y: 380,
            width: 180,
            height: 80,
          },
        },
        {
          type: "node",
          id: "g-a",
          groupId: "group-1",
          view: {
            x: 20,
            y: 50,
            width: 60,
            height: 60,
          },
        },
      ],
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "decorator",
      id: "container-1",
    });

    fireEvent.mouseMove(document, { clientX: 11, clientY: 22 });
    expect(onCellsMoving).not.toHaveBeenCalled();

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).toHaveBeenCalledWith([
      {
        decorator: "container",
        height: undefined,
        id: "container-1",
        type: "decorator",
        width: undefined,
        containerId: undefined,
        groupId: undefined,
        x: 19,
        y: 36,
        guideLines: [],
      },
      {
        decorator: undefined,
        containerId: "container-1",
        groupId: undefined,
        height: 60,
        id: "a",
        type: "node",
        width: 60,
        x: 35,
        y: 80,
        guideLines: [],
      },
      {
        decorator: "group",

        height: 80,
        id: "group-1",
        type: "decorator",
        width: 180,
        x: 95,
        y: 410,
        guideLines: [],
        containerId: "container-1",
        groupId: undefined,
      },
      {
        decorator: undefined,
        containerId: undefined,
        groupId: "group-1",
        height: 60,
        id: "g-a",
        type: "node",
        width: 60,
        x: 35,
        y: 80,
        guideLines: [],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      {
        decorator: "container",
        height: undefined,
        id: "container-1",
        type: "decorator",
        width: undefined,
        guideLines: undefined,
        containerId: undefined,
        groupId: undefined,
        x: 20,
        y: 37,
      },
      {
        id: "a",
        type: "node",
        guideLines: undefined,
        decorator: undefined,
        containerId: "container-1",
        groupId: undefined,
        width: 60,
        height: 60,
        x: 36,
        y: 81,
      },
      {
        decorator: "group",
        height: 80,
        id: "group-1",
        type: "decorator",
        width: 180,
        guideLines: undefined,
        containerId: "container-1",
        groupId: undefined,
        x: 96,
        y: 411,
      },
      {
        id: "g-a",
        type: "node",
        guideLines: undefined,
        decorator: undefined,
        containerId: undefined,
        groupId: "group-1",
        width: 60,
        height: 60,
        x: 36,
        y: 81,
      },
    ]);

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });

  test("move group node", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "move",
      cell: {
        type: "decorator",
        id: "group-1",
        decorator: "group",
        view: { x: 4, y: 6 },
      } as any,
      ...methods,
      cells: [
        {
          type: "decorator",
          id: "group-1",
          decorator: "group",
          view: {
            x: 80,
            y: 380,
            width: 180,
            height: 80,
          },
        },
        {
          type: "node",
          id: "g-a",
          groupId: "group-1",
          view: {
            x: 20,
            y: 50,
            width: 60,
            height: 60,
          },
        },
      ],
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "decorator",
      id: "group-1",
    });

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).toHaveBeenCalledWith([
      {
        decorator: "group",
        height: undefined,
        containerId: undefined,
        groupId: undefined,
        id: "group-1",
        type: "decorator",
        width: undefined,
        x: 19,
        y: 36,
        guideLines: [],
      },
      {
        containerId: undefined,
        decorator: undefined,
        height: 60,
        groupId: "group-1",
        id: "g-a",
        type: "node",
        width: 60,
        x: 35,
        y: 80,
        guideLines: [],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      {
        decorator: "group",
        height: undefined,
        guideLines: undefined,
        containerId: undefined,
        groupId: undefined,
        id: "group-1",
        type: "decorator",
        width: undefined,
        x: 20,
        y: 37,
      },
      {
        id: "g-a",
        type: "node",
        decorator: undefined,
        guideLines: undefined,
        containerId: undefined,
        groupId: "group-1",
        width: 60,
        height: 60,
        x: 36,
        y: 81,
      },
    ]);

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });

  test("move node and snap to grid", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "move",
      cell: { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
      layoutOptions: {
        snap: {
          grid: true,
        },
      },
      ...methods,
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "node",
      id: "b",
    });

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).toHaveBeenCalledWith([
      {
        type: "node",
        id: "b",
        x: 20,
        y: 40,
        guideLines: [],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      { type: "node", id: "b", x: 20, y: 40 },
    ]);

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });

  test("move node and snap to object", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    const cells: Cell[] = [
      { type: "node", id: "a", view: { x: 44, y: 46, width: 100, height: 60 } },
      { type: "node", id: "b", view: { x: 4, y: 6, width: 100, height: 60 } },
      {
        type: "node",
        id: "c",
        view: { x: 144, y: 146, width: 100, height: 60 },
      },
    ];
    handleMouseDown(mousedown, {
      action: "move",
      cell: cells[1],
      layoutOptions: {
        snap: {
          object: true,
        },
      },
      ...methods,
      cells,
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "node",
      id: "b",
    });

    fireEvent.mouseMove(document, { clientX: 50, clientY: 50 });
    expect(onCellsMoving).toHaveBeenNthCalledWith(1, [
      {
        type: "node",
        id: "b",
        x: 44,
        y: 36,
        width: 100,
        height: 60,
        guideLines: [
          [
            [94, 76],
            [94, 66],
          ],
        ],
      },
    ]);

    fireEvent.mouseMove(document, { clientX: 50, clientY: 56 });
    expect(onCellsMoving).toHaveBeenNthCalledWith(2, [
      {
        type: "node",
        id: "b",
        x: 44,
        y: 46,
        width: 100,
        height: 60,
        guideLines: [
          [
            [94, 46],
            [94, 106],
          ],
          [
            [44, 76],
            [144, 76],
          ],
        ],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 56 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      { type: "node", id: "b", x: 20, y: 46, width: 100, height: 60 },
    ]);

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });

  test("move multi nodes", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "move",
      cell: { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
      ...methods,
      cells: [
        { type: "node", id: "a", view: { x: 44, y: 46 } } as any,
        { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
        { type: "node", id: "c", view: { x: 144, y: 146 } } as any,
      ],
      activeTarget: {
        type: "multi",
        targets: [
          {
            type: "node",
            id: "b",
          },
          {
            type: "node",
            id: "c",
          },
        ],
      },
    });

    fireEvent.mouseMove(document, { clientX: 11, clientY: 22 });
    expect(onCellsMoving).not.toHaveBeenCalled();

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).toHaveBeenCalledWith([
      {
        type: "node",
        id: "b",
        x: 19,
        y: 36,
        guideLines: [],
      },
      {
        type: "node",
        id: "c",
        x: 159,
        y: 176,
        guideLines: [],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      { type: "node", id: "b", x: 20, y: 37 },
      { type: "node", id: "c", x: 160, y: 177 },
    ]);

    expect(onSwitchActiveTarget).not.toHaveBeenCalled();
  });

  test("no movable nodes", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "move",
      cell: { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
      ...methods,
      layout: "force",
      cells: [
        { type: "node", id: "a", view: { x: 44, y: 46 } } as any,
        { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
        { type: "node", id: "c", view: { x: 144, y: 146 } } as any,
      ],
      activeTarget: {
        type: "multi",
        targets: [
          {
            type: "node",
            id: "b",
          },
          {
            type: "node",
            id: "c",
          },
        ],
      },
    });

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).not.toHaveBeenCalled();
    expect(onSwitchActiveTarget).not.toHaveBeenCalled();
  });

  test("resize node", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    handleMouseDown(mousedown, {
      action: "resize",
      cell: {
        type: "decorator",
        id: "b",
        view: { width: 100, height: 60 },
      } as any,
      ...methods,
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "decorator",
      id: "b",
    });

    fireEvent.mouseMove(document, { clientX: 11, clientY: 22 });
    expect(onCellResizing).not.toHaveBeenCalled();

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellResizing).toHaveBeenCalledWith({
      type: "decorator",
      id: "b",
      width: 115,
      height: 90,
    });

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellResized).toHaveBeenCalledWith({
      type: "decorator",
      id: "b",
      width: 116,
      height: 91,
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });

  test("mousedown on node with force layout", () => {
    const noopMouseDown = new MouseEvent("mousedown");
    handleMouseDown(noopMouseDown, {
      cell: { type: "node", id: "a" } as Cell,
      action: "move",
      layout: "force",
      ...methods,
    });
    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "node",
      id: "a",
    });
  });

  test("shift select", () => {
    const mousedown = new MouseEvent("mousedown", {
      clientX: 10,
      clientY: 20,
      shiftKey: true,
    });
    handleMouseDown(mousedown, {
      action: "move",
      cell: { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
      layoutOptions: {
        snap: {
          grid: true,
        },
      },
      ...methods,
    });
    const activeTarget = {
      type: "multi",
      targets: [{ type: "node", id: "b", view: { x: 4, y: 6 } }],
    } as any as ActiveTarget;
    expect(onSwitchActiveTarget).toHaveBeenCalledWith(activeTarget);

    handleMouseDown(mousedown, {
      action: "move",
      cell: { type: "node", id: "b", view: { x: 4, y: 6 } } as any,
      layoutOptions: {
        snap: {
          grid: true,
        },
      },
      ...methods,
      activeTarget,
    });
    expect(onSwitchActiveTarget).toHaveBeenCalledWith(null);

    fireEvent.mouseUp(document, { clientX: 10, clientY: 20 });
  });

  test("move line decorator", () => {
    const mousedown = new MouseEvent("mousedown", { clientX: 10, clientY: 20 });
    const cell = {
      type: "decorator",
      id: "decorator-1",
      decorator: "line",
      view: {
        source: { x: 4, y: 6 },
        target: { x: 100, y: 200 },
        x: 4,
        y: 6,
        width: 96,
        height: 194,
        vertices: [{ x: 4, y: 200 }],
      },
    } as unknown as DecoratorCell;

    handleMouseDown(mousedown, {
      action: "move",
      cell,
      ...methods,
      cells: [cell],
    });

    expect(onSwitchActiveTarget).toHaveBeenCalledWith({
      type: "decorator",
      id: "decorator-1",
    });

    fireEvent.mouseMove(document, { clientX: 11, clientY: 22 });
    expect(onCellsMoving).not.toHaveBeenCalled();

    fireEvent.mouseMove(document, { clientX: 25, clientY: 50 });
    expect(onCellsMoving).toHaveBeenCalledWith([
      {
        decorator: "line",
        id: "decorator-1",
        type: "decorator",
        source: { x: 19, y: 36 },
        target: { x: 115, y: 230 },
        vertices: [{ x: 19, y: 230 }],
        x: 19,
        y: 36,
        width: 96,
        height: 194,
        guideLines: [],
      },
    ]);

    fireEvent.mouseUp(document, { clientX: 26, clientY: 51 });
    expect(onCellsMoved).toHaveBeenCalledWith([
      {
        decorator: "line",
        id: "decorator-1",
        type: "decorator",
        source: { x: 20, y: 37 },
        target: { x: 116, y: 231 },
        vertices: [{ x: 20, y: 231 }],
        x: 20,
        y: 37,
        width: 96,
        height: 194,
        guideLines: undefined,
      },
    ]);

    expect(onSwitchActiveTarget).toHaveBeenCalledTimes(1);
  });
});
