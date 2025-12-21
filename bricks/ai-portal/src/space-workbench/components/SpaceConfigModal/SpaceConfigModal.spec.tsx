import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
  i18n: {
    getFixedT: jest.fn(() => (key: string) => key),
  },
}));

jest.mock("../../i18n.js", () => ({
  K: {},
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    // eslint-disable-next-line react/display-name
    return ({ children, visible, onCancel, onConfirm, ...props }: any) => {
      if (!visible) return null;
      return (
        <div data-testid={`wrapped-${tagName}`} {...props}>
          {children}
          <button data-testid="cancel-btn" onClick={onCancel}>
            取消
          </button>
          <button data-testid="confirm-btn" onClick={onConfirm}>
            确定
          </button>
        </div>
      );
    };
  }),
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoSpaceApi_importSpaceSchema: jest.fn(() => Promise.resolve()),
}));

jest.mock("../../../chat-panel/ChatPanelContent", () => ({
  ChatPanelContent: (props: any) => {
    return (
      <div data-testid="chat-panel">
        ChatPanel
        <button
          data-testid="submit-chat"
          onClick={() => props.onChatSubmit?.({ text: "test" })}
        >
          提交
        </button>
        <button
          data-testid="trigger-data"
          onClick={() => {
            const testData = (global as any).__testData;
            if (testData && props.onData) {
              props.onData(testData);
            }
          }}
        >
          触发数据
        </button>
      </div>
    );
  },
}));

jest.mock("../BusinessManage", () => ({
  BusinessManage: () => <div data-testid="business-manage">BusinessManage</div>,
}));

jest.mock("@next-core/http", () => ({
  http: {
    post: jest.fn(() =>
      Promise.resolve({ data: { conversationId: "conv-123" } })
    ),
  },
}));

import { SpaceConfigModal } from "./SpaceConfigModal";

describe("SpaceConfigModal", () => {
  const mockSpaceDetail = {
    instanceId: "space-1",
    name: "测试空间",
    description: "测试空间描述",
  };

  const mockConfigSchema = {
    businessObjects: [],
    businessFlows: [],
    objectRelations: [],
  };

  const defaultProps = {
    visible: true,
    spaceDetail: mockSpaceDetail,
    configSchema: mockConfigSchema,
    onSave: jest.fn(),
    onCancel: jest.fn(),
  };

  test("应该在 visible 为 false 时不渲染", () => {
    const { container } = render(
      <SpaceConfigModal {...defaultProps} visible={false} />
    );
    expect(
      container.querySelector('[data-testid="wrapped-eo-modal"]')
    ).toBeNull();
  });

  test("应该渲染聊天面板和业务管理组件", () => {
    render(<SpaceConfigModal {...defaultProps} />);

    expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    expect(screen.getByTestId("business-manage")).toBeInTheDocument();
  });

  test("应该在点击取消时调用 onCancel", () => {
    render(<SpaceConfigModal {...defaultProps} />);

    const cancelBtn = screen.getByTestId("cancel-btn");
    fireEvent.click(cancelBtn);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  test("应该在点击保存时调用保存 API", async () => {
    const { ElevoSpaceApi_importSpaceSchema } = await import(
      "@next-api-sdk/llm-sdk"
    );

    render(<SpaceConfigModal {...defaultProps} />);

    const confirmBtn = screen.getByTestId("confirm-btn");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(ElevoSpaceApi_importSpaceSchema).toHaveBeenCalledWith(
        "space-1",
        mockConfigSchema
      );
    });
  });

  test("应该在保存失败时处理错误", async () => {
    const { ElevoSpaceApi_importSpaceSchema } = await import(
      "@next-api-sdk/llm-sdk"
    );
    const { handleHttpError } = await import("@next-core/runtime");

    (ElevoSpaceApi_importSpaceSchema as jest.Mock).mockRejectedValueOnce(
      new Error("保存失败") as unknown as never
    );

    render(<SpaceConfigModal {...defaultProps} />);

    const confirmBtn = screen.getByTestId("confirm-btn");
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalled();
    });
  });

  test("应该在 configSchema 变化时同步更新内部状态", () => {
    const { rerender } = render(<SpaceConfigModal {...defaultProps} />);

    const newConfigSchema = {
      businessObjects: [
        { objectId: "obj-1", objectName: "新对象", description: "描述" },
      ],
      businessFlows: [],
      objectRelations: [],
    };

    rerender(
      <SpaceConfigModal {...defaultProps} configSchema={newConfigSchema} />
    );

    expect(screen.getByTestId("business-manage")).toBeInTheDocument();
  });

  test("应该处理聊天提交并创建会话", async () => {
    const { http } = await import("@next-core/http");

    render(<SpaceConfigModal {...defaultProps} aiEmployeeId="ai-123" />);

    const submitBtn = screen.getByTestId("submit-chat");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
        {}
      );
    });
  });

  test("应该处理聊天提交失败", async () => {
    const { http } = await import("@next-core/http");
    const { handleHttpError } = await import("@next-core/runtime");

    (http.post as jest.Mock).mockRejectedValueOnce(
      new Error("创建会话失败") as unknown as never
    );

    render(<SpaceConfigModal {...defaultProps} />);

    const submitBtn = screen.getByTestId("submit-chat");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalled();
    });
  });

  test("应该处理接收到的有效数据", async () => {
    render(<SpaceConfigModal {...defaultProps} />);

    const mockData = {
      tasks: [
        {
          jobs: [
            {
              messages: [
                {
                  parts: [
                    {
                      type: "data",
                      data: {
                        type: "easy_cmd_business_object",
                        content: JSON.stringify({
                          businessObjects: [
                            {
                              objectId: "obj-2",
                              objectName: "新对象",
                              description: "新描述",
                            },
                          ],
                          objectRelations: [],
                          businessFlows: [],
                        }),
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    (global as any).__testData = mockData;

    const triggerBtn = screen.getByTestId("trigger-data");
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(screen.getByTestId("business-manage")).toBeInTheDocument();
    });

    delete (global as any).__testData;
  });

  test("应该处理无效的 JSON 数据", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error");

    render(<SpaceConfigModal {...defaultProps} />);

    const mockData = {
      tasks: [
        {
          jobs: [
            {
              messages: [
                {
                  parts: [
                    {
                      type: "data",
                      data: {
                        type: "easy_cmd_business_object",
                        content: "invalid json {",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    (global as any).__testData = mockData;

    const triggerBtn = screen.getByTestId("trigger-data");
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
    delete (global as any).__testData;
  });

  test("应该忽略非预期类型的数据", () => {
    render(<SpaceConfigModal {...defaultProps} />);

    const mockData = {
      tasks: [
        {
          jobs: [
            {
              messages: [
                {
                  parts: [
                    {
                      type: "text",
                      text: "普通文本消息",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    (global as any).__testData = mockData;

    const triggerBtn = screen.getByTestId("trigger-data");
    fireEvent.click(triggerBtn);

    expect(screen.getByTestId("business-manage")).toBeInTheDocument();

    delete (global as any).__testData;
  });
});
