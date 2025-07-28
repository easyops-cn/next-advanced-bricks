import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { ShowCases } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.show-cases", () => {
  test("basic usage", async () => {
    const element = document.createElement("ai-portal.show-cases") as ShowCases;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });
});
