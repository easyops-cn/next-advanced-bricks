import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { RunningFlow } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.running-flow", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.running-flow"
    ) as RunningFlow;

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
