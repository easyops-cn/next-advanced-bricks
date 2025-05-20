import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { DraggableComponentMenuItem } from "./DraggableComponentMenuItem";

describe("DraggableComponentMenuItem", () => {
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
    const handleClick = jest.fn();

    render(
      <DraggableComponentMenuItem component={component} onClick={handleClick} />
    );
    expect(
      screen.getByTestId("draggable-component-menu-item")
    ).toHaveTextContent(component.title);

    // click
    expect(handleClick).not.toHaveBeenCalled();
    act(() => {
      fireEvent.click(
        screen.getByTestId("draggable-component-menu-item-thumbnail")
      );
    });
    expect(handleClick).toHaveBeenCalled();
  });
});
