import React from "react";
import { getByTestId, fireEvent } from "@testing-library/dom";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import * as utilsGeneral from "@next-core/utils/general";
import { Layout, ResponsiveProps, WidthProvider } from "react-grid-layout";

import "./";
import type { EoWorkbenchLayoutV2 } from "./index.js";
import { DroppableComponentLayoutItem } from "./DroppableComponentLayoutItem";
import { defaultCardConfig } from "./utils";
import { DraggableComponentMenuItem } from "./DraggableComponentMenuItem";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-core/utils/general", () => {
  const mockedUnwrapedProvider = jest.fn();

  return {
    ...(jest.requireActual("@next-core/utils/general") as Record<
      string,
      unknown
    >),
    mockedUnwrapedProvider,
    unwrapProvider: jest.fn(() => mockedUnwrapedProvider),
  };
});
jest.mock("react-grid-layout");
jest.mock("./DroppableComponentLayoutItem", () => ({
  DroppableComponentLayoutItem: jest.fn(() => (
    <div>Mocked DroppableComponentLayoutItem</div>
  )),
}));
jest.mock("./DraggableComponentMenuItem", () => ({
  DraggableComponentMenuItem: jest.fn(({ component: { title } }) => (
    <div data-testid="draggable-component-menu-item">{title}</div>
  )),
}));

const MockedReactGridLayoutComponent = jest.fn(
  ({ className, children }: ResponsiveProps) => (
    <div className={className}>{children}</div>
  )
);
const MockedDroppableComponentLayoutItem =
  DroppableComponentLayoutItem as jest.Mock<
    typeof DroppableComponentLayoutItem
  >;
const MockedDraggableComponentMenuItem =
  DraggableComponentMenuItem as jest.Mock<typeof DraggableComponentMenuItem>;

(WidthProvider as jest.Mock).mockReturnValue(MockedReactGridLayoutComponent);

describe("eo-workbench-layout-v2", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "eo-workbench-layout-v2"
    ) as EoWorkbenchLayoutV2;
    const componentList = [
      {
        title: "card-1",
        useBrick: {
          brick: "div",
          properties: {
            textContent: "card-1",
          },
        },
        position: {
          i: "card-1",
          x: 0,
          y: 0,
          w: 2,
          h: 1,
        },
        key: "card-1",
      },
      {
        title: "card-2",
        useBrick: {
          brick: "div",
          properties: {
            textContent: "card-2",
          },
        },
        position: {
          i: "card-2",
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        },
        key: "card-2",
      },
      {
        title: "card-3",
        useBrick: {
          brick: "div",
          properties: {
            textContent: "card-3",
          },
        },
        position: {
          i: "card-3",
          x: 0,
          y: 0,
          w: 1,
          h: 1,
        },
        key: "card-3",
      },
      {
        title: "card-4",
        useBrick: {
          brick: "div",
          properties: {
            textContent: "card-4",
          },
        },
        position: {
          i: "card-4",
          x: 0,
          y: 0,
          w: 2,
          h: 1,
        },
        key: "card-4",
      },
    ];

    element.isEdit = true;
    element.layouts = [
      {
        i: "card-1",
        x: 0,
        y: 0,
        w: 2,
        h: 1,
        type: "card-1",
      },
      {
        i: "card-2",
        x: 0,
        y: 1,
        w: 1,
        h: 1,
        type: "card-2",
      },
    ];

    element.toolbarBricks = {
      useBrick: [
        {
          brick: "div",
          properties: {
            textContent: "tool-1",
            className: "tool-brick",
          },
        },
        {
          brick: "div",
          properties: {
            textContent: "tool-2",
            className: "tool-brick",
          },
        },
      ],
    };
    element.componentList = componentList;
    element.showSettingButton = true;

    expect(element.childElementCount).toBe(0);

    const mockChangeEvent = jest.fn();
    const mockSaveEvent = jest.fn();
    const mockCancelEvent = jest.fn();
    const mockActionClickEventHandler = jest.fn();
    const mockSettingEVent = jest.fn();
    element.addEventListener("change", mockChangeEvent);
    element.addEventListener("save", mockSaveEvent);
    element.addEventListener("cancel", mockCancelEvent);
    element.addEventListener("action.click", mockActionClickEventHandler);
    element.addEventListener("setting", mockSettingEVent);

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.childElementCount).toBeGreaterThan(0);

    const triggerLayoutChange = (layout: Layout[]) => {
      act(() => {
        MockedReactGridLayoutComponent.mock.lastCall?.[0].onLayoutChange?.(
          layout,
          { lg: layout }
        );
      });
    };
    const newLayout1 = [
      {
        w: 2,
        h: 1,
        x: 0,
        y: 0,
        i: "card-1",
        moved: false,
        static: false,
        type: "card-1",
      },
      {
        w: 1,
        h: 1,
        x: 0,
        y: 1,
        i: "card-2",
        moved: false,
        static: false,
        type: "card-2",
      },
    ];

    triggerLayoutChange(newLayout1);

    expect(element.querySelector(".layout")?.childNodes.length).toBe(2);

    const clickSaveBtn = () => {
      (
        element.querySelector("eo-button[type='primary']") as HTMLElement
      )?.click();
    };

    act(() => {
      clickSaveBtn();
    });

    expect(mockSaveEvent).nthCalledWith(
      1,
      expect.objectContaining({
        detail: newLayout1,
      })
    );

    // 点击设置按钮
    await act(async () => {
      fireEvent.click(getByTestId(element, "setting-button"));
      await (global as any).flushPromises();
    });

    expect(mockSettingEVent).toHaveBeenCalled();

    // insert element
    // click
    act(() => {
      MockedDraggableComponentMenuItem.mock.calls[2][0].onClick?.();
    });

    const component3 = componentList[2];
    const newLayout2_1 = [
      expect.anything(),
      expect.anything(),
      {
        ...defaultCardConfig,
        ...component3.position,
        cardWidth: component3.position.w,
        x: 1,
        y: Infinity,
        type: component3.key,
      },
    ];

    expect(element.querySelector(".layout")?.childNodes.length).toBe(3);
    expect(mockChangeEvent).toBeCalledWith(
      expect.objectContaining({
        detail: newLayout2_1,
      })
    );

    // drop on layout
    const component4 = componentList[3];

    act(() => {
      MockedDraggableComponentMenuItem.mock.lastCall?.[0].onDragStart?.();
      MockedReactGridLayoutComponent.mock.lastCall?.[0].onDrop?.(
        {} as Layout[],
        { i: "__dropping-elem__", x: 1, y: 1, w: 1, h: 1 },
        {} as Event
      );
      MockedDraggableComponentMenuItem.mock.lastCall?.[0].onDragEnd?.();
    });

    const newLayout2_2 = [
      {
        ...defaultCardConfig,
        ...component4.position,
        cardWidth: component4.position.w,
        x: 1,
        y: 1,
        type: component4.key,
      },
      expect.anything(),
      expect.anything(),
      expect.anything(),
    ];

    expect(element.querySelector(".layout")?.childNodes.length).toBe(4);
    expect(mockChangeEvent).toBeCalledWith(
      expect.objectContaining({
        detail: newLayout2_2,
      })
    );

    // delete element
    act(() => {
      MockedDroppableComponentLayoutItem.mock.lastCall?.[0].onDelete?.();
    });

    const newLayout3 = [
      {
        w: 2,
        h: 1,
        x: 0,
        y: 0,
        i: "card-1",
        moved: false,
        static: false,
        type: "card-1",
      },
      {
        ...defaultCardConfig,
        w: 1,
        h: 2,
        x: 1,
        y: 1,
        i: "card-3",
        // minH: 2,
        moved: false,
        static: false,
        type: "card-3",
      },
    ];

    triggerLayoutChange(newLayout3);

    expect(element.querySelector(".layout")?.childNodes.length).toBe(2);
    expect(mockChangeEvent).toBeCalledWith(
      expect.objectContaining({
        detail: newLayout3,
      })
    );

    // delete component item
    await act(async () => {
      element.componentList = [
        {
          title: "card-1",
          useBrick: {
            brick: "div",
            properties: {
              textContent: "card-1",
            },
          },
          position: {
            i: "card-1",
            x: 0,
            y: 0,
            w: 2,
            h: 1,
          },
          key: "card-1",
        },
      ];
    });

    expect(element.querySelector(".layout")?.childNodes.length).toBe(1);

    // reset
    (
      utilsGeneral as unknown as {
        mockedUnwrapedProvider: jest.Mock<() => Promise<void>>;
      }
    ).mockedUnwrapedProvider.mockResolvedValueOnce();

    await act(async () => {
      fireEvent(
        getByTestId(element, "edit-layout-actions"),
        new CustomEvent("action.click", { detail: { event: "clear" } })
      );
      await (global as any).flushPromises();
    });

    expect(element.querySelector(".layout")?.childNodes.length).toBe(0);
    expect(mockChangeEvent).toBeCalledWith(
      expect.objectContaining({ detail: [] })
    );

    // toolbarBricks
    expect(element.querySelectorAll(".tool-brick")).toHaveLength(2);

    // cancel
    act(() => {
      (element.querySelectorAll("eo-button")[1] as HTMLElement).click();
    });

    expect(mockCancelEvent).toBeCalledTimes(1);

    // action.click
    const actionEvent = "saveAsTemplate";
    await act(async () => {
      fireEvent(
        getByTestId(element, "edit-layout-actions"),
        new CustomEvent("action.click", { detail: { event: actionEvent } })
      );
    });
    expect(mockActionClickEventHandler).toBeCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          action: expect.objectContaining({ event: actionEvent }),
        }),
      })
    );

    // onLayoutChange called with w > 1 and x > 0 layout
    const newLayout4 = [
      {
        w: 2,
        h: 1,
        x: 1,
        y: 0,
        i: "card-1",
        moved: false,
        static: false,
        type: "card-1",
      },
      {
        w: 1,
        h: 2,
        x: 1,
        y: 1,
        i: "card-3",
        minH: 2,
        moved: false,
        static: false,
        type: "card-3",
      },
    ];

    triggerLayoutChange(newLayout4);

    expect(mockChangeEvent).not.toBeCalledWith(
      expect.objectContaining({
        detail: newLayout4,
      })
    );

    // onLayoutChange called when isEdit is false
    mockChangeEvent.mockClear();
    await act(async () => {
      element.isEdit = false;
    });
    triggerLayoutChange(newLayout3);

    expect(mockChangeEvent).not.toBeCalledWith(
      expect.objectContaining({
        detail: newLayout3,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.childNodes.length).toBe(0);
  });
});
