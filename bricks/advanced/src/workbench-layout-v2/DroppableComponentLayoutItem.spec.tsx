import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { DropTargetHookSpec, DropTargetMonitor, useDrop } from "react-dnd";

import { DroppableComponentLayoutItem } from "./DroppableComponentLayoutItem";
import { WorkbenchComponent } from "../interfaces";

jest.mock("react-dnd", () => ({
  useDrag: jest.fn(() => [{}]),
  useDrop: jest.fn(() => []),
}));
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

const mockedUseDrop = useDrop as jest.Mock;

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
      position: {
        i: "card-1",
        x: 0,
        y: 0,
        w: 2,
        h: 1,
      },
      key: "card-1",
    };
    const handleDrop = jest.fn();
    const handleDelete = jest.fn();

    render(
      <DroppableComponentLayoutItem
        component={component}
        isEdit
        onDrop={handleDrop}
        onDelete={handleDelete}
      />
    );
    expect(screen.getByTestId("react-use-brick").dataset["useBrick"]).toBe(
      JSON.stringify(component.useBrick)
    );

    // drop
    act(() => {
      (
        mockedUseDrop.mock.lastCall?.[0] as DropTargetHookSpec<
          WorkbenchComponent,
          void,
          {
            isOver: boolean;
          }
        >
      ).drop?.(component, {} as DropTargetMonitor<WorkbenchComponent, void>);
    });
    expect(handleDrop).toHaveBeenCalledWith(component);

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
