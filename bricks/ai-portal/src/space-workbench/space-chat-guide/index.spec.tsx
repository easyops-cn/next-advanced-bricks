import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import ".";
import type { SpaceChatGuide } from "./index.jsx";

jest.mock("@next-core/theme", () => ({}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoSpaceApi_generateSpaceCapabilities: jest.fn(() =>
    Promise.resolve({
      manageInstancesCapability: "管理实例能力描述",
      initiateFlowCapability: "发起流程能力描述",
      searchKnowledgeCapability: "搜索知识能力描述",
    })
  ),
}));

describe("ai-portal.space-chat-guide", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.space-chat-guide"
    ) as SpaceChatGuide;

    expect(element.shadowRoot).toBeFalsy();

    // 设置必需的属性
    element.spaceDetail = {
      name: "Test Space",
      instanceId: "test-space-id",
      description: "Test Description",
    };

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
