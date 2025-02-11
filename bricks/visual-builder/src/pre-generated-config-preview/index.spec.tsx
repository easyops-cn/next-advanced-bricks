import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { PreGeneratedConfigPreview } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("visual-builder.pre-generated-config-preview", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "visual-builder.pre-generated-config-preview"
    ) as PreGeneratedConfigPreview;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });
});
