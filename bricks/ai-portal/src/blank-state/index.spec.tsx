import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { BlankState } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.blank-state", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.blank-state"
    ) as BlankState;
    element.illustration = "goals";
    element.description = "No goals";

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
NodeList [
  <style>
    styles.shadow.css
  </style>,
  <img
    height="138"
    src="goals@2x.png"
    width="184"
  />,
  <p>
    No goals
  </p>,
  <slot />,
]
`);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("default illustration", async () => {
    const element = document.createElement(
      "ai-portal.blank-state"
    ) as BlankState;

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
NodeList [
  <style>
    styles.shadow.css
  </style>,
  <img
    height="138"
    src="activities@2x.png"
    width="184"
  />,
  <p />,
  <slot />,
]
`);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
