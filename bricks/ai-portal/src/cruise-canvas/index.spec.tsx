import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { CruiseCanvas } from "./index.js";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-shared/markdown", () => ({
  MarkdownComponent: jest.fn(({ content }) => <div className="markdown">{content}</div>),
}));

describe("ai-portal.cruise-canvas", () => {
  test("basic usage", async () => {
    const element = document.createElement("ai-portal.cruise-canvas") as CruiseCanvas;

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
