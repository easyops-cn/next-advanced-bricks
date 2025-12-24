import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";

jest.mock("@next-core/theme", () => ({}));

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
  i18n: {
    getFixedT: jest.fn(() => (key: string) => key),
  },
}));

jest.mock("./i18n.js", () => ({
  K: {},
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("../chat-stream/i18n.js", () => ({
  NS: "test-chat-stream-ns",
  locales: {},
}));

jest.mock("./components/SpaceNav", () => ({
  SpaceNav: () => null,
}));

jest.mock("./components/SpaceSidebar", () => ({
  SpaceSidebar: () => null,
}));

jest.mock("./components/ChatArea/ChatArea", () => ({
  ChatArea: () => null,
}));

import "./";
import type { SpaceWorkbench } from "./index.js";

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
    expect(element.shadowRoot).toBeFalsy();
    expect(element.children.length).toBeGreaterThan(0);
    expect(element.innerHTML).toBeTruthy();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
