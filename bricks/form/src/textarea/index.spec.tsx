import { describe, test, expect } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import { Textarea } from "./index.js";
import { fireEvent } from "@testing-library/react";

jest.mock("@next-core/theme", () => ({}));

describe("eo-textarea", () => {
  test("basic usage", async () => {
    const element = document.createElement("eo-textarea") as Textarea;

    const mockChangeEvent = jest.fn();
    const mockFocusEvent = jest.fn();
    const mockBlurEvent = jest.fn();
    element.addEventListener("change", mockChangeEvent);
    element.addEventListener("focus", mockFocusEvent);
    element.addEventListener("blur", mockBlurEvent);

    expect(element.shadowRoot).toBeFalsy();
    await act(async () => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    const textareaElement = element.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;

    // expect((textareaElement?.style as Record<string, any>)?._values).toEqual({
    //   height: "94px",
    // });

    act(() => {
      textareaElement?.focus();
      textareaElement?.blur();
      fireEvent.change(textareaElement as HTMLElement, {
        target: { value: "a" },
      });
    });

    expect(mockFocusEvent).toHaveBeenCalledTimes(1);
    expect(mockBlurEvent).toHaveBeenCalledTimes(1);
    expect(mockChangeEvent).toHaveBeenCalledTimes(1);

    expect(textareaElement?.textContent).toBe("a");

    await act(async () => {
      element.value = undefined;
    });

    expect(textareaElement?.textContent).toBe("");

    // focusTextarea
    const mockedFocus = jest.spyOn(textareaElement, "focus");
    const mockedSetSelectionRange = jest.spyOn(
      textareaElement,
      "setSelectionRange"
    );

    act(() => {
      element.focusTextarea();
    });

    expect(mockedFocus).toHaveBeenCalledTimes(1);
    expect(mockedSetSelectionRange).not.toHaveBeenCalled();

    const value = "a";
    const valueLength = value.length;

    await act(async () => {
      element.value = value;
    });

    act(() => {
      element.focusTextarea();
    });

    expect(mockedFocus).toHaveBeenCalledTimes(2);
    expect(mockedSetSelectionRange).toHaveBeenCalledWith(valueLength, valueLength);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });
});
