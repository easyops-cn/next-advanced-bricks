import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DroppableComponentLayoutItem } from "./DroppableComponentLayoutItem";

jest.mock("@next-core/react-runtime", () => ({
  ReactUseBrick: jest.fn(({ useBrick }) => (
    <div
      data-testid="react-use-brick"
      data-use-brick={JSON.stringify(useBrick)}
    >
      Mocked ReactUseBrick
    </div>
  )),
}));

describe("DroppableComponentLayoutItem", () => {
  it("should work", () => {
    const component = {
      title: "card-1",
      useBrick: {
        brick: "div",
        properties: {
          textContent: "card-1",
        },
      },
      thumbnail:
        "/next/sa-static/portal/versions/0.0.0/webroot/-/micro-apps/portal/images/alert-level1747736998873129815.png",
      position: {
        i: "card-1",
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      key: "card-1",
    };
    const layout = {
      i: "card-1",
      x: 0,
      y: 0,
      w: 2,
      h: 1,
      type: "card-1",
      cardBorderWidth: 2,
    };
    const handleDelete = jest.fn();

    render(
      <DroppableComponentLayoutItem
        component={component}
        isEdit
        onDelete={handleDelete}
        layout={layout}
      />
    );
    expect(screen.getByTestId("react-use-brick").dataset["useBrick"]).toBe(
      JSON.stringify(component.useBrick)
    );

    // edit mask click
    act(() => {
      fireEvent.mouseDown(
        screen.getByTestId("droppable-component-layout-item-edit-mask")
      );
    });

    // delete click
    expect(handleDelete).not.toHaveBeenCalled();
    act(() => {
      fireEvent.click(
        screen.getByTestId("droppable-component-layout-item-delete")
      );
    });
    expect(handleDelete).toHaveBeenCalled();
  });
});
