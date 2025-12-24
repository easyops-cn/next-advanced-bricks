import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoObjectApi_importServiceObjectInstances: jest.fn(),
}));

jest.mock("@next-core/http", () => ({
  http: {
    post: jest.fn(),
  },
}));

jest.mock("../../i18n.js", () => ({
  K: {
    ADD_INSTANCE_MODAL_TITLE: "ADD_INSTANCE_MODAL_TITLE",
    CONFIRM_CREATE: "CONFIRM_CREATE",
    CANCEL: "CANCEL",
    PLEASE_ENTER: "PLEASE_ENTER",
    ADD_INSTANCE_ASSISTANT_WELCOME: "ADD_INSTANCE_ASSISTANT_WELCOME",
    IDENTIFIED_INSTANCES: "IDENTIFIED_INSTANCES",
  },
  t: (key: string, params?: any) => {
    if (params?.objectName) {
      return `${key}:${params.objectName}`;
    }
    return key;
  },
}));

jest.mock("../../../chat-panel/ChatPanelContent", () => ({
  ChatPanelContent: ({ onChatSubmit, onData }: any) => (
    <div data-testid="chat-panel">
      <button
        data-testid="submit-button"
        onClick={() =>
          onChatSubmit?.({ content: "test content", attachments: [] })
        }
      >
        提交
      </button>
      <button
        data-testid="trigger-data"
        onClick={() => {
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
                              type: "easy_cmd_business_instance",
                              content: JSON.stringify({
                                objectId: "obj-1",
                                imports: [
                                  {
                                    instanceId: "inst-1",
                                    name: "测试实例",
                                  },
                                ],
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
          onData?.(mockData);
        }}
      >
        触发数据
      </button>
    </div>
  ),
}));

jest.mock("./InstanceList", () => ({
  InstanceList: ({ instances, onSelect, onDelete }: any) => (
    <div data-testid="instance-list">
      {instances.map((inst: any) => (
        <div key={inst._id_} data-testid={`instance-${inst._id_}`}>
          <span>{inst.name || inst._id_}</span>
          <button onClick={() => onSelect(inst._id_)}>选择</button>
          <button onClick={() => onDelete(inst._id_)}>删除</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock("../BusinessInstanceDetail", () => ({
  BusinessInstanceDetail: ({ instance, onAttrChange }: any) => (
    <div data-testid="business-instance-detail">
      {instance && (
        <>
          <span>{instance.name || instance._id_}</span>
          <button
            onClick={() => onAttrChange?.("name", "新名称")}
            data-testid="change-attr"
          >
            修改属性
          </button>
        </>
      )}
    </div>
  ),
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick:
    () =>
    ({ visible, onCancel, onConfirm, children }: any) =>
      visible ? (
        <div data-testid="modal">
          {children}
          <button onClick={onCancel} data-testid="cancel-button">
            取消
          </button>
          <button onClick={onConfirm} data-testid="confirm-button">
            确认
          </button>
        </div>
      ) : null,
}));

jest.mock("../../workbenchContext", () => {
  const React = require("react");
  const mockContext = React.createContext({
    spaceDetail: {
      instanceId: "space-1",
      name: "测试空间",
      description: "描述",
    },
    uploadOptions: {},
  });
  return {
    WorkbenchContext: mockContext,
  };
});

import { AddObjectInstModal } from "./AddObjectInstModal";
import type { SpaceDetail, BusinessObject } from "../../interfaces";
import { http } from "@next-core/http";
import { ElevoObjectApi_importServiceObjectInstances } from "@next-api-sdk/llm-sdk";

describe("AddObjectInstModal", () => {
  const mockSpaceDetail: SpaceDetail = {
    instanceId: "space-1",
    name: "测试空间",
    description: "测试描述",
  };

  const mockBusinessObject: BusinessObject = {
    objectId: "obj-1",
    objectName: "业务对象",
    description: "描述",
    attributes: [
      {
        id: "name",
        name: "名称",
        description: "",
        required: true,
        type: "string",
      },
    ],
  };

  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (http.post as jest.Mock).mockResolvedValue({
      data: { conversationId: "conv-123" },
    } as never);
  });

  test("应该在 visible 为 true 时渲染模态框", () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  test("应该在 visible 为 false 时不渲染模态框", () => {
    render(
      <AddObjectInstModal
        visible={false}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("应该渲染聊天面板", () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
  });

  test("应该在点击取消按钮时调用 onCancel", () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByTestId("cancel-button");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  test("应该在提交聊天时创建会话", async () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
        {}
      );
    });
  });

  test("应该处理接收到的实例数据", async () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByTestId("instance-list")).toBeInTheDocument();
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });
  });

  test("应该在删除实例时更新列表", async () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 先触发数据生成实例
    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });

    // 找到删除按钮并点击
    const deleteButtons = screen.getAllByText("删除");
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText("测试实例")).not.toBeInTheDocument();
      });
    }
  });

  test("应该在选择实例时显示详情", async () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 先触发数据
    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });

    // 选择实例
    const selectButtons = screen.getAllByText("选择");
    if (selectButtons.length > 0) {
      fireEvent.click(selectButtons[0]);

      await waitFor(() => {
        const detail = screen.getByTestId("business-instance-detail");
        expect(detail).toBeInTheDocument();
      });
    }
  });

  test("应该在修改属性时更新实例数据", async () => {
    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 触发数据并选择实例
    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });

    const selectButtons = screen.getAllByText("选择");
    if (selectButtons.length > 0) {
      fireEvent.click(selectButtons[0]);

      await waitFor(() => {
        const changeAttrButton = screen.getByTestId("change-attr");
        fireEvent.click(changeAttrButton);
      });
    }
  });

  test("应该在确认创建时调用 API", async () => {
    (
      ElevoObjectApi_importServiceObjectInstances as jest.Mock
    ).mockResolvedValue({} as never);

    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 触发数据生成实例
    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });

    // 点击确认按钮
    const confirmButton = screen.getByTestId("confirm-button");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(ElevoObjectApi_importServiceObjectInstances).toHaveBeenCalledWith(
        "obj-1",
        expect.objectContaining({
          imports: expect.arrayContaining([
            expect.objectContaining({
              instanceId: "inst-1",
              name: "测试实例",
            }),
          ]),
        })
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  test("应该在确认创建时过滤掉 _id_ 字段", async () => {
    (
      ElevoObjectApi_importServiceObjectInstances as jest.Mock
    ).mockResolvedValue({} as never);

    render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 触发数据
    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });

    // 确认创建
    const confirmButton = screen.getByTestId("confirm-button");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(ElevoObjectApi_importServiceObjectInstances).toHaveBeenCalled();
      const callArgs = (
        ElevoObjectApi_importServiceObjectInstances as jest.Mock
      ).mock.calls[0][1] as any;
      const firstImport = callArgs.imports[0];
      expect(firstImport._id_).toBeUndefined();
    });
  });

  test("应该在 visible 变化时重置状态", async () => {
    const { rerender } = render(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 触发数据
    const triggerDataButton = screen.getByTestId("trigger-data");
    fireEvent.click(triggerDataButton);

    await waitFor(() => {
      expect(screen.getByText("测试实例")).toBeInTheDocument();
    });

    // 关闭模态框
    rerender(
      <AddObjectInstModal
        visible={false}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 重新打开模态框
    rerender(
      <AddObjectInstModal
        visible={true}
        spaceDetail={mockSpaceDetail}
        businessObject={mockBusinessObject}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    );

    // 实例列表应该被清空
    await waitFor(() => {
      const instanceList = screen.getByTestId("instance-list");
      expect(instanceList.children.length).toBe(0);
    });
  });
});
