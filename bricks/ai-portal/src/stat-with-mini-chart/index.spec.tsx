import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { StatWithMiniChart } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.stat-with-mini-chart", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.stat-with-mini-chart"
    ) as StatWithMiniChart;

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
