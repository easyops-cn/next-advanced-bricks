import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import "./";
import type { EditableLabel } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("diagram.editable-label", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "diagram.editable-label"
    ) as EditableLabel;
    element.type = "line";
    element.label = "Relation A";
    const onLabelEditingChange = jest.fn();
    element.addEventListener("label.editing.change", (e) =>
      onLabelEditingChange((e as CustomEvent).detail)
    );
    const onLabelChange = jest.fn();
    element.addEventListener("label.change", (e) =>
      onLabelChange((e as CustomEvent).detail)
    );

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <div
          class="label"
        >
          <input
            class="label-input"
            value="Relation A"
          />
          <div
            class="label-text"
          >
            Relation A
          </div>
        </div>,
      ]
    `);

    // Enable editing label
    expect(
      element.shadowRoot?.querySelector(".label")?.classList.contains("editing")
    ).toBe(false);
    act(() => {
      fireEvent.dblClick(element.shadowRoot!.querySelector(".label-text")!);
    });
    expect(
      element.shadowRoot?.querySelector(".label")?.classList.contains("editing")
    ).toBe(true);
    expect(onLabelEditingChange).toHaveBeenCalledTimes(1);
    expect(onLabelEditingChange).toHaveBeenCalledWith(true);

    // Rename label
    act(() => {
      fireEvent.change(element.shadowRoot!.querySelector(".label-input")!, {
        target: { value: "New Name" },
      });
    });
    expect(element.shadowRoot?.querySelector(".label")?.textContent).toBe(
      "New Name"
    );

    // Unrelated keydown
    act(() => {
      fireEvent.keyDown(element.shadowRoot!.querySelector(".label-input")!, {
        key: "ArrowRight",
      });
    });
    expect(onLabelChange).toHaveBeenCalledTimes(0);

    act(() => {
      fireEvent.keyDown(element.shadowRoot!.querySelector(".label-input")!, {
        key: "Enter",
      });
    });
    expect(onLabelChange).toHaveBeenCalledTimes(1);
    expect(onLabelChange).toHaveBeenCalledWith("New Name");

    expect(
      element.shadowRoot?.querySelector(".label")?.classList.contains("editing")
    ).toBe(false);
    expect(onLabelEditingChange).toHaveBeenCalledTimes(2);
    expect(onLabelEditingChange).toHaveBeenCalledWith(false);

    act(() => {
      element.enableEditing();
    });
    expect(
      element.shadowRoot?.querySelector(".label")?.classList.contains("editing")
    ).toBe(true);

    act(() => {
      fireEvent.dblClick(element.shadowRoot!.querySelector(".label")!);
    });

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("readOnly", async () => {
    const element = document.createElement(
      "diagram.editable-label"
    ) as EditableLabel;
    element.type = "line";
    element.label = "ReadOnly Relation";
    element.readOnly = true;

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <div
          class="label"
        >
          <input
            class="label-input"
            value="ReadOnly Relation"
          />
          <div
            class="label-text"
          >
            ReadOnly Relation
          </div>
        </div>,
      ]
    `);

    // Dblclick will be ignored
    act(() => {
      fireEvent.dblClick(element.shadowRoot!.querySelector(".label-text")!);
    });
    expect(
      element.shadowRoot?.querySelector(".label")?.classList.contains("editing")
    ).toBe(false);

    // `enableEditing()` will be ignored
    element.enableEditing();
    expect(
      element.shadowRoot?.querySelector(".label")?.classList.contains("editing")
    ).toBe(false);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
