import React from "react";
import { getByTestId, fireEvent } from "@testing-library/dom";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import * as utilsGeneral from "@next-core/utils/general";
import { Layout, ResponsiveProps, WidthProvider } from "react-grid-layout";
import { last } from "lodash";
import "./";
import type { EoWorkbenchLayout } from "./index.js";

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

const MockedReactGridLayoutComponent = jest.fn(
  ({ className, children }: ResponsiveProps) => (
    <div className={className}>{children}</div>
  )
);
(WidthProvider as jest.Mock).mockReturnValue(MockedReactGridLayoutComponent);

describe("eo-workbench-layout", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "eo-workbench-layout"
    ) as EoWorkbenchLayout;

    element.isEdit = true;
    element.layouts = [
      {
        i: "card-1",
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      {
        i: "card-2",
        x: 0,
        y: 1,
        w: 1,
        h: 1,
      },
    ];
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
    ];

    expect(element.shadowRoot).toBeFalsy();

    const mockChangeEvent = jest.fn();
    const mockSaveEvent = jest.fn();
    const mockCancelEvent = jest.fn();
    const mockActionClickEventHandler = jest.fn();
    element.addEventListener("change", mockChangeEvent);
    element.addEventListener("save", mockSaveEvent);
    element.addEventListener("cancel", mockCancelEvent);
    element.addEventListener("action.click", mockActionClickEventHandler);

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    const triggerLayoutChange = (layout: Layout[]) => {
      act(() => {
        last(MockedReactGridLayoutComponent.mock.calls)?.[0].onLayoutChange?.(
          layout,
          { lg: layout }
        );
      });
    };
    const newLayout1 = [
      { w: 2, h: 1, x: 0, y: 0, i: "card-1", moved: false, static: false },
      { w: 1, h: 1, x: 0, y: 1, i: "card-2", moved: false, static: false },
    ];

    triggerLayoutChange(newLayout1);

    expect(
      (
        element.shadowRoot?.querySelector("eo-checkbox") as HTMLElement
      ).getAttribute("value")
    ).toBe("card-1,card-2");
    expect(
      element.shadowRoot?.querySelector(".layout")?.childNodes.length
    ).toBe(2);
    expect(
      element.shadowRoot?.querySelectorAll("eo-icon[icon='delete']").length
    ).toBe(2);

    const clickSaveBtn = () => {
      (
        element.shadowRoot?.querySelector(
          "eo-button[type='primary']"
        ) as HTMLElement
      )?.click();
    };

    act(() => {
      clickSaveBtn();
    });

    expect(mockSaveEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        detail: newLayout1,
      })
    );

    // insert element
    await act(async () => {
      await element.shadowRoot?.querySelector("eo-checkbox")?.dispatchEvent(
        new CustomEvent("change", {
          detail: [
            {
              label: "card-1",
              value: "card-1",
              key: "card-1",
            },
            {
              label: "card-2",
              value: "card-2",
              key: "card-2",
            },
            {
              label: "card-3",
              value: "card-3",
              key: "card-3",
              position: {
                i: "card-3",
                x: 0,
                y: 0,
                w: 1,
                h: 2,
              },
            },
          ],
        })
      );
    });

    const newLayout2 = [
      { w: 2, h: 1, x: 0, y: 0, i: "card-1", moved: false, static: false },
      {
        w: 1,
        h: 2,
        x: 0,
        y: 1,
        i: "card-2",
        minH: 1,
        moved: false,
        static: false,
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
      },
    ];

    triggerLayoutChange(newLayout2);

    expect(
      element.shadowRoot?.querySelector(".layout")?.childNodes.length
    ).toBe(3);
    expect(mockChangeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: newLayout2,
      })
    );

    act(() => {
      clickSaveBtn();
    });

    expect(mockSaveEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        detail: newLayout2,
      })
    );
    expect(
      element.shadowRoot?.querySelector(".layout")?.childNodes.length
    ).toBe(3);

    // delete element
    await act(async () => {
      (
        element.shadowRoot?.querySelectorAll(
          "eo-icon[icon='delete']"
        )[1] as HTMLElement
      ).click();
    });

    const newLayout3 = [
      { w: 2, h: 1, x: 0, y: 0, i: "card-1", moved: false, static: false },
      {
        w: 1,
        h: 2,
        x: 1,
        y: 1,
        i: "card-3",
        minH: 2,
        moved: false,
        static: false,
      },
    ];

    triggerLayoutChange(newLayout3);

    expect(
      element.shadowRoot?.querySelector(".layout")?.childNodes.length
    ).toBe(2);
    expect(mockChangeEvent).toHaveBeenCalledWith(
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

    expect(
      element.shadowRoot?.querySelector(".layout")?.childNodes.length
    ).toBe(1);

    // reset
    (
      utilsGeneral as unknown as {
        mockedUnwrapedProvider: jest.Mock<() => Promise<void>>;
      }
    ).mockedUnwrapedProvider.mockResolvedValueOnce();

    await act(async () => {
      fireEvent(
        getByTestId(
          element.shadowRoot as unknown as HTMLElement,
          "edit-layout-actions"
        ),
        new CustomEvent("action.click", { detail: { event: "clear" } })
      );
      await (global as any).flushPromises();
    });

    expect(
      element.shadowRoot?.querySelector(".layout")?.childNodes.length
    ).toBe(0);
    expect(
      (
        element.shadowRoot?.querySelector("eo-checkbox") as HTMLElement
      ).getAttribute("value")
    ).toBe("");
    expect(mockChangeEvent).toHaveBeenCalledWith(
      expect.objectContaining({ detail: [] })
    );

    // cancel
    act(() => {
      (
        element.shadowRoot?.querySelectorAll("eo-button")[1] as HTMLElement
      ).click();
    });

    expect(mockCancelEvent).toHaveBeenCalledTimes(1);

    // action.click
    const actionEvent = "saveAsTemplate";
    await act(async () => {
      fireEvent(
        getByTestId(
          element.shadowRoot as unknown as HTMLElement,
          "edit-layout-actions"
        ),
        new CustomEvent("action.click", { detail: { event: actionEvent } })
      );
    });
    expect(mockActionClickEventHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          action: expect.objectContaining({ event: actionEvent }),
        }),
      })
    );

    // onLayoutChange called with w > 1 and x > 0 layout
    const newLayout4 = [
      { w: 2, h: 1, x: 1, y: 0, i: "card-1", moved: false, static: false },
      {
        w: 1,
        h: 2,
        x: 1,
        y: 1,
        i: "card-3",
        minH: 2,
        moved: false,
        static: false,
      },
    ];

    triggerLayoutChange(newLayout4);

    expect(mockChangeEvent).not.toHaveBeenCalledWith(
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

    expect(mockChangeEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        detail: newLayout3,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });
});
