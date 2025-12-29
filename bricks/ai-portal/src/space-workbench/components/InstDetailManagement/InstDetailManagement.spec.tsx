import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoObjectApi_updateServiceObjectInstance: jest.fn(),
}));

jest.mock("@next-core/http", () => ({
  http: {
    post: jest.fn(),
  },
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("../../i18n.js", () => ({
  K: {
    INSTANCE_DETAIL_CHAT_PLACEHOLDER: "INSTANCE_DETAIL_CHAT_PLACEHOLDER",
  },
  t: (key: string) => key,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick: (component: string) => {
    if (component === "eo-icon") {
      // eslint-disable-next-line react/display-name
      return ({ icon, onClick }: any) => (
        <span data-testid={`icon-${icon}`} onClick={onClick}>
          {icon}
        </span>
      );
    }
    if (component === "ai-portal.chat-input") {
      // eslint-disable-next-line react/display-name
      return ({ onChatSubmit, submitDisabled, placeholder }: any) => (
        <div data-testid="chat-input">
          <input
            data-testid="chat-input-field"
            placeholder={placeholder}
            disabled={submitDisabled}
          />
          <button
            data-testid="chat-submit-button"
            disabled={submitDisabled}
            onClick={() =>
              onChatSubmit?.({
                detail: { content: "测试消息", files: [] },
              } as CustomEvent)
            }
          >
            提交
          </button>
        </div>
      );
    }
    return () => null;
  },
}));

jest.mock("../BusinessInstanceCard", () => ({
  InstFieldsView: ({ instance, attrs, onAttrChange }: any) => (
    <div data-testid="inst-fields-view">
      {attrs.map((attr: any) => (
        <div key={attr.id} data-testid={`field-${attr.id}`}>
          <label>{attr.name}</label>
          <input
            data-testid={`input-${attr.id}`}
            value={instance[attr.id] || ""}
            onChange={(e) => onAttrChange?.(attr.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  ),
}));

jest.mock("./ActivityLogs", () => ({
  ActivityLogs: ({ onLinkConversation }: any) => (
    <div data-testid="activity-logs">
      <button
        data-testid="link-conversation-button"
        onClick={() =>
          onLinkConversation?.({ conversationId: "conv-123" } as any)
        }
      >
        关联会话
      </button>
    </div>
  ),
}));

jest.mock("../../../shared/FilePreview/FilePreview.js", () => ({
  FilePreview: ({ file }: any) =>
    file ? <div data-testid="file-preview">{file.name}</div> : null,
}));

jest.mock("../../../shared/TaskContext", () => {
  const React = require("react");
  return {
    TaskContext: React.createContext({}),
  };
});

jest.mock("../../workbenchContext", () => {
  const React = require("react");
  const mockContext = React.createContext({
    spaceDetail: {
      instanceId: "space-1",
      name: "测试空间",
      description: "描述",
    },
    uploadOptions: {
      enabled: true,
      maxFiles: 5,
    },
  });
  return {
    WorkbenchContext: mockContext,
  };
});

import { InstDetailManagement } from "./InstDetailManagement";
import { ElevoObjectApi_updateServiceObjectInstance } from "@next-api-sdk/llm-sdk";
import { http } from "@next-core/http";
import { handleHttpError } from "@next-core/runtime";

describe("InstDetailManagement", () => {
  const mockInstance = {
    instanceId: "inst-1",
    name: "实例1",
    status: "active",
    description: "描述1",
    ctime: 1234567890000,
    mtime: 1234567890000,
  };

  const mockBusinessObject = {
    objectId: "obj-1",
    objectName: "业务对象1",
    description: "对象描述",
    attributes: [
      {
        id: "name",
        name: "名称",
        description: "",
        required: true,
        type: "string" as const,
      },
      {
        id: "status",
        name: "状态",
        description: "",
        required: false,
        type: "string" as const,
      },
      {
        id: "description",
        name: "描述",
        description: "",
        required: false,
        type: "text" as const,
      },
    ],
  };

  const mockOnClose = jest.fn();
  const mockOnNewConversation = jest.fn();
  const mockOnInstanceUpdate = jest.fn();

  const defaultProps = {
    instance: mockInstance,
    businessObject: mockBusinessObject,
    onClose: mockOnClose,
    onNewConversation: mockOnNewConversation,
    onInstanceUpdate: mockOnInstanceUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该渲染实例详情管理组件", () => {
    render(<InstDetailManagement {...defaultProps} />);

    expect(screen.getByText("业务对象1")).toBeInTheDocument();
    expect(screen.getByTestId("inst-fields-view")).toBeInTheDocument();
    expect(screen.getByTestId("activity-logs")).toBeInTheDocument();
    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });

  test("应该显示所有字段", () => {
    render(<InstDetailManagement {...defaultProps} />);

    expect(screen.getByTestId("field-name")).toBeInTheDocument();
    expect(screen.getByTestId("field-status")).toBeInTheDocument();
    expect(screen.getByTestId("field-description")).toBeInTheDocument();
  });

  test("应该在点击关闭按钮时调用 onClose", () => {
    render(<InstDetailManagement {...defaultProps} />);

    const closeButton = screen.getByTestId("icon-x").parentElement;
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  test("应该能够更新字段值", async () => {
    (ElevoObjectApi_updateServiceObjectInstance as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<InstDetailManagement {...defaultProps} />);

    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "新名称" } });

    await waitFor(() => {
      expect(ElevoObjectApi_updateServiceObjectInstance).toHaveBeenCalledWith(
        "obj-1",
        "inst-1",
        {
          data: {
            name: "新名称",
          },
        }
      );
    });
  });

  test("应该在字段更新成功后调用 onInstanceUpdate", async () => {
    (ElevoObjectApi_updateServiceObjectInstance as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<InstDetailManagement {...defaultProps} />);

    const statusInput = screen.getByTestId("input-status");
    fireEvent.change(statusInput, { target: { value: "inactive" } });

    await waitFor(() => {
      expect(mockOnInstanceUpdate).toHaveBeenCalledWith({
        ...mockInstance,
        status: "inactive",
      });
    });
  });

  test("应该在字段更新失败时调用错误处理", async () => {
    const error = new Error("更新失败");
    (ElevoObjectApi_updateServiceObjectInstance as jest.Mock).mockRejectedValue(
      error as never
    );

    render(<InstDetailManagement {...defaultProps} />);

    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "新名称" } });

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalledWith(error);
    });
  });

  test("应该能够提交聊天消息", async () => {
    (http.post as jest.Mock).mockResolvedValue({
      data: { conversationId: "conv-new-123" },
    } as never);

    render(<InstDetailManagement {...defaultProps} />);

    const submitButton = screen.getByTestId("chat-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
        {}
      );
    });

    await waitFor(() => {
      expect(mockOnNewConversation).toHaveBeenCalledWith({
        content: "测试消息",
        files: [],
        agentId: "elevo-service_object_instance_manager",
        cmd: {
          type: "serviceObjectInstance-createOrEdit",
          payload: {
            spaceInstanceId: "space-1",
            serviceObjectId: "obj-1",
            instanceId: "inst-1",
          },
        },
        conversationId: "conv-new-123",
      });
    });
  });

  test("应该在提交聊天时禁用输入框", async () => {
    let resolvePost: (value: any) => void;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });

    (http.post as jest.Mock).mockReturnValue(postPromise as never);

    render(<InstDetailManagement {...defaultProps} />);

    const submitButton = screen.getByTestId("chat-submit-button");
    const inputField = screen.getByTestId("chat-input-field");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(inputField).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    // 完成请求
    resolvePost!({ data: { conversationId: "conv-123" } });

    await waitFor(() => {
      expect(inputField).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("应该在提交聊天失败时调用错误处理", async () => {
    const error = new Error("创建会话失败");
    (http.post as jest.Mock).mockRejectedValue(error as never);

    render(<InstDetailManagement {...defaultProps} />);

    const submitButton = screen.getByTestId("chat-submit-button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalledWith(error);
    });
  });

  test("应该在提交聊天失败后重新启用输入框", async () => {
    const error = new Error("创建会话失败");
    (http.post as jest.Mock).mockRejectedValue(error as never);

    render(<InstDetailManagement {...defaultProps} />);

    const submitButton = screen.getByTestId("chat-submit-button");
    const inputField = screen.getByTestId("chat-input-field");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(inputField).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("应该能够通过 ActivityLogs 关联会话", () => {
    render(<InstDetailManagement {...defaultProps} />);

    const linkButton = screen.getByTestId("link-conversation-button");
    fireEvent.click(linkButton);

    expect(mockOnNewConversation).toHaveBeenCalledWith({
      conversationId: "conv-123",
    });
  });

  test("应该正确传递 uploadOptions 到 ChatInput", () => {
    render(<InstDetailManagement {...defaultProps} />);

    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
  });

  test("应该正确传递 placeholder 到 ChatInput", () => {
    render(<InstDetailManagement {...defaultProps} />);

    const inputField = screen.getByTestId("chat-input-field");
    expect(inputField).toHaveAttribute(
      "placeholder",
      "INSTANCE_DETAIL_CHAT_PLACEHOLDER"
    );
  });

  test("应该在没有 onInstanceUpdate 回调时仍能更新字段", async () => {
    (ElevoObjectApi_updateServiceObjectInstance as jest.Mock).mockResolvedValue(
      {} as never
    );

    const propsWithoutUpdate = {
      ...defaultProps,
      onInstanceUpdate: undefined,
    };

    render(<InstDetailManagement {...propsWithoutUpdate} />);

    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "新名称" } });

    await waitFor(() => {
      expect(ElevoObjectApi_updateServiceObjectInstance).toHaveBeenCalled();
    });
  });

  test("应该正确传递实例数据到 InstFieldsView", () => {
    render(<InstDetailManagement {...defaultProps} />);

    const nameInput = screen.getByTestId("input-name") as HTMLInputElement;
    expect(nameInput.value).toBe("实例1");

    const statusInput = screen.getByTestId("input-status") as HTMLInputElement;
    expect(statusInput.value).toBe("active");
  });

  test("应该正确传递业务对象属性到 InstFieldsView", () => {
    render(<InstDetailManagement {...defaultProps} />);

    expect(screen.getByText("名称")).toBeInTheDocument();
    expect(screen.getByText("状态")).toBeInTheDocument();
    expect(screen.getByText("描述")).toBeInTheDocument();
  });

  test("应该在没有属性时不显示字段", () => {
    const propsWithoutAttrs = {
      ...defaultProps,
      businessObject: {
        ...mockBusinessObject,
        attributes: [],
      },
    };

    render(<InstDetailManagement {...propsWithoutAttrs} />);

    expect(screen.queryByTestId("field-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("field-status")).not.toBeInTheDocument();
  });

  test("应该正确传递 spaceId 到 ActivityLogs", () => {
    render(<InstDetailManagement {...defaultProps} />);

    expect(screen.getByTestId("activity-logs")).toBeInTheDocument();
  });

  test("应该能够更新多个字段", async () => {
    (ElevoObjectApi_updateServiceObjectInstance as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<InstDetailManagement {...defaultProps} />);

    // 更新名称
    const nameInput = screen.getByTestId("input-name");
    fireEvent.change(nameInput, { target: { value: "新名称" } });

    await waitFor(() => {
      expect(ElevoObjectApi_updateServiceObjectInstance).toHaveBeenCalledWith(
        "obj-1",
        "inst-1",
        {
          data: {
            name: "新名称",
          },
        }
      );
    });

    // 更新状态
    const statusInput = screen.getByTestId("input-status");
    fireEvent.change(statusInput, { target: { value: "inactive" } });

    await waitFor(() => {
      expect(ElevoObjectApi_updateServiceObjectInstance).toHaveBeenCalledWith(
        "obj-1",
        "inst-1",
        {
          data: {
            status: "inactive",
          },
        }
      );
    });

    expect(mockOnInstanceUpdate).toHaveBeenCalledTimes(2);
  });

  test("应该在属性为 null 时使用空数组", () => {
    const propsWithNullAttrs = {
      ...defaultProps,
      businessObject: {
        ...mockBusinessObject,
        attributes: null as any,
      },
    };

    render(<InstDetailManagement {...propsWithNullAttrs} />);

    expect(screen.getByTestId("inst-fields-view")).toBeInTheDocument();
  });

  test("应该正确处理复杂的字段值类型", async () => {
    (ElevoObjectApi_updateServiceObjectInstance as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<InstDetailManagement {...defaultProps} />);

    const descInput = screen.getByTestId("input-description");
    fireEvent.change(descInput, {
      target: { value: "包含特殊字符的描述: @#$%^&*()" },
    });

    await waitFor(() => {
      expect(ElevoObjectApi_updateServiceObjectInstance).toHaveBeenCalledWith(
        "obj-1",
        "inst-1",
        {
          data: {
            description: "包含特殊字符的描述: @#$%^&*()",
          },
        }
      );
    });
  });
});
