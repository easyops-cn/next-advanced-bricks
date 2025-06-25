import React from "react";
import { render, createEvent, act, fireEvent } from "@testing-library/react";
import { DesktopCustom } from "./DesktopCustom.js";

describe("DesktopCustom", () => {
  it("should work", () => {
    const stopPropagation = jest.fn();
    const handleClick = jest.fn();
    const handleAddClick = jest.fn();
    const name = "世界";
    const url = "/hello";
    const { container } = render(
      <DesktopCustom
        name={name}
        url={url}
        onAddClick={handleAddClick}
        onClick={handleClick}
        showAddIcon={true}
        isFavorite={true}
      />
    );

    expect(container.querySelector("img")?.getAttribute("src")).toBe(
      "default-app-icon.png"
    );

    const mockEvent = createEvent.click(
      container.querySelector("eo-link") as HTMLElement
    );
    mockEvent.stopPropagation = stopPropagation;
    act(() => {
      fireEvent(container.querySelector("eo-link") as HTMLElement, mockEvent);
    });

    expect(stopPropagation).toHaveBeenCalled();
    expect(mockEvent.defaultPrevented).toBeFalsy();
    expect(handleClick).toHaveBeenCalled();

    expect(container.querySelector(".addIcon")).toBeTruthy();
    act(() => {
      fireEvent.click(container.querySelector(".addIcon") as HTMLElement);
    });
    expect(handleAddClick).toHaveBeenCalledTimes(1);

    act(() => {
      fireEvent(container.querySelector("eo-link") as HTMLElement, mockEvent);
    });

    expect(stopPropagation).toHaveBeenCalledTimes(2);
  });
});
