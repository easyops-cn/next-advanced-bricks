import { describe, test, expect } from "@jest/globals";
import { callTool } from "./call-tool.js";

jest.mock("@next-core/http", () => ({
  http: {
    post: jest.fn((url, body) =>
      Promise.resolve({
        data: {
          with: { url, body },
        },
      })
    ),
  },
}));

describe("callTool", () => {
  test("should work", async () => {
    expect(
      await callTool(
        { conversationId: "conv-1", stepId: "step-1" },
        { some: "param" }
      )
    ).toEqual({
      with: {
        url: "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversation/conv-1/step/step-1/view",
        body: { params: { some: "param" } },
      },
    });
  });
});
