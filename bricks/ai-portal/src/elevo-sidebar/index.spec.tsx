import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { ElevoSidebar } from "./index.js";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoApi_getElevoProjects: jest.fn(() => Promise.resolve({ list: [] })),
  ElevoApi_listElevoConversations: jest.fn(() =>
    Promise.resolve({ conversations: [] })
  ),
}));

describe("ai-portal.elevo-sidebar", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.elevo-sidebar"
    ) as ElevoSidebar;

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
