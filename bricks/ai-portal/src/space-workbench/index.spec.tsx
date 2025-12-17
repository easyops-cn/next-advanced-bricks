import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { SpaceWorkbench } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.space-workbench", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.space-workbench"
    ) as SpaceWorkbench;

    expect(element.shadowRoot).toBeFalsy();

    // 设置必需的属性
    element.spaceDetail = {
      name: "Test Space",
      instanceId: "test-space-id",
      description: "Test Description",
    };
    element.notifyCenterUrl = "/notify-center";

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
