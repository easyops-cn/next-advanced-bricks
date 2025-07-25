import { describe, test, expect } from "@jest/globals";
import { act } from "@testing-library/react";
import "./";
import { Radio } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("eo-button", () => {
  test("basic usage", async () => {
    const element = document.createElement("eo-radio") as Radio;
    element.options = [
      {
        label: "a",
        value: "a",
      },
      {
        label: "b",
        value: "b",
        icon: {
          lib: "antd",
          icon: "close",
        },
      },
    ];

    const mockChangeEvent = jest.fn();
    const mockOptionsChangeEvent = jest.fn();
    element.addEventListener("change", mockChangeEvent);
    element.addEventListener("options.change", mockOptionsChangeEvent);

    expect(element.shadowRoot).toBeFalsy();
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      element.shadowRoot?.querySelector(".radio-group")?.childNodes.length
    ).toBe(2);
    expect(element.value).toBe(undefined);

    expect(mockChangeEvent).toHaveBeenCalledTimes(0);
    act(() => {
      (
        element.shadowRoot?.querySelector("input[type='radio']") as HTMLElement
      ).click();
    });

    expect(mockChangeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          label: "a",
          value: "a",
        },
      })
    );
    expect(element.value).toBe("a");
    expect(
      (
        element.shadowRoot?.querySelectorAll(
          "input[type='radio']"
        )[0] as HTMLInputElement
      ).checked
    ).toBeTruthy();
    expect(mockOptionsChangeEvent).toHaveBeenCalledTimes(0);

    await act(async () => {
      await (element.options = ["a", "b", "c"]);
    });

    expect(mockOptionsChangeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          options: [
            {
              label: "a",
              value: "a",
            },
            {
              label: "b",
              value: "b",
            },
            {
              label: "c",
              value: "c",
            },
          ],
        },
      })
    );

    await act(async () => {
      await (element.value = "c");
    });

    expect(
      (
        element.shadowRoot?.querySelectorAll(
          "input[type='radio']"
        )[0] as HTMLInputElement
      ).checked
    ).toBeFalsy();

    expect(
      (
        element.shadowRoot?.querySelectorAll(
          "input[type='radio']"
        )[2] as HTMLInputElement
      ).checked
    ).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("type icon with boolean values", () => {
    const element = document.createElement("eo-radio") as Radio;
    element.type = "icon";
    element.options = [
      {
        label: "Yes",
        value: true,
        icon: {
          lib: "antd",
          icon: "check",
        },
      },
      {
        label: "No",
        value: false,
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".content").length).toBe(2);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("type icon-square", () => {
    const element = document.createElement("eo-radio") as Radio;
    element.type = "icon-square";
    element.options = [
      {
        label: "A",
        value: "a",
        icon: {
          lib: "antd",
          icon: "check",
        },
      },
      {
        label: "B",
        value: "b",
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".square-icon").length).toBe(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("type button", () => {
    const element = document.createElement("eo-radio") as Radio;
    element.type = "button";
    element.options = [
      {
        label: "A",
        value: "a",
        icon: {
          lib: "antd",
          icon: "check",
        },
      },
      {
        label: "B",
        value: "b",
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".content").length).toBe(2);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
