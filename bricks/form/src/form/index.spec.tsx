import { describe, test, expect } from "@jest/globals";
import { act } from "@testing-library/react";
import "./";
import { Form } from "./index.js";
import type { FormItem } from "../form-item";

jest.mock("@next-core/theme", () => ({}));

describe("eo-form", () => {
  test("basic usage", async () => {
    jest.useFakeTimers();
    const element = document.createElement("eo-form") as Form;
    element.layout = "vertical";
    element.values = {};
    element.setInitValue({ age: 10, name: "test" });

    expect(element.shadowRoot).toBeFalsy();
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(1);
    expect(element.isFormElement).toEqual(true);

    expect(element.shadowRoot?.querySelector("slot")?.style.display).toBe(
      "flex"
    );

    expect(element.shadowRoot?.querySelector("slot")?.style.flexDirection).toBe(
      "column"
    );

    await act(async () => {
      await (element.layout = "inline");
    });

    expect(element.shadowRoot?.querySelector("slot")?.style.flexDirection).toBe(
      ""
    );

    expect(element.shadowRoot?.querySelector("slot")?.style.gap).toBe("10px");

    await act(async () => {
      await (element.layout = "horizontal");
    });

    expect(element.shadowRoot?.querySelector("slot")?.style.flexDirection).toBe(
      "column"
    );

    expect(element.shadowRoot?.querySelector("slot")?.style.gap).toBe("");

    await act(async () => {
      await element.setInitValue(
        { age: 11, name: "a" },
        { runInMicrotask: true }
      );
    });

    await jest.runAllTimers();

    expect(element.values).toEqual({ age: 11, name: "a" });

    act(() => {
      element.setInitValue({ age: 12, name: "b" }, { runInMacrotask: true });
    });

    await jest.runAllTimers();

    expect(element.values).toEqual({ age: 12, name: "b" });

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("autoScrollToInvalidFields", async () => {
    jest.useFakeTimers();
    const element = document.createElement("eo-form") as Form;
    element.autoScrollToInvalidFields = true;

    // Mock scrollIntoView
    const mockScrollIntoView = jest.fn();
    Element.prototype.scrollIntoView = mockScrollIntoView;

    act(() => {
      document.body.appendChild(element);
    });

    // Create a form item element to simulate validation failure
    const formItem = document.createElement("eo-form-item") as FormItem;
    formItem.name = "testField";
    formItem.required = true;

    act(() => {
      element.appendChild(formItem);
    });

    // Mock the form store to have an invalid field
    const mockFormStore = {
      validateFields(cb: (err: boolean, values: any) => void) {
        cb(true, [
          {
            name: "testField",
            message: "This field is required",
            type: "error",
          },
        ]);
        return false;
      },
      scrollToField: jest.fn(),
    };

    element.formStore = mockFormStore as any;

    // Trigger validation
    await act(async () => {
      await element.validate();
    });

    await jest.runAllTimers();

    // Check that scroll was triggered for the invalid field
    expect(mockFormStore.scrollToField).toHaveBeenCalledWith("testField");

    act(() => {
      document.body.removeChild(element);
    });

    jest.useRealTimers();
  });
});
