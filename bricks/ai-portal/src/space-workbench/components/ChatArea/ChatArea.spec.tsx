import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-shared/general/JsonStorage", () => ({
  JsonStorage: jest.fn().mockImplementation(() => ({
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
  })),
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("@next-core/http", () => ({
  http: {
    post: jest.fn(),
  },
}));

jest.mock("../../i18n.js", () => ({
  K: {
    NEW_SESSION: "NEW_SESSION",
    PLEASE_ENTER: "PLEASE_ENTER",
    HISTORY_SESSIONS: "HISTORY_SESSIONS",
  },
  t: (key: string) => key,
}));

jest.mock("../../workbenchContext", () => {
  const React = require("react");
  const mockContext = React.createContext({
    spaceDetail: {
      instanceId: "space-1",
      name: "测试空间",
      description: "描述",
    },
    uploadOptions: {
      bucketName: "test-bucket",
    },
  });
  return {
    WorkbenchContext: mockContext,
  };
});

jest.mock("../../../chat-panel/ChatPanelContent.js", () => {
  const mockReact = require("react");
  return {
    ChatPanelContent: mockReact.forwardRef(
      (
        { conversationId, onChatSubmit, onData, submitDisabled }: any,
        ref: any
      ) => {
        mockReact.useImperativeHandle(ref, () => ({}));
        return (
          <div data-testid="chat-panel">
            <div data-testid="conversation-id">{conversationId || "null"}</div>
            <div data-testid="submit-disabled">
              {submitDisabled ? "true" : "false"}
            </div>
            <button
              onClick={() =>
                onChatSubmit?.({
                  message: "test message",
                  conversationId,
                })
              }
            >
              提交消息
            </button>
            <button
              onClick={() =>
                onData?.({
                  id: conversationId,
                  title: "更新的标题",
                })
              }
            >
              更新标题
            </button>
          </div>
        );
      }
    ),
  };
});

jest.mock("./Tabs.js", () => ({
  Tabs: ({
    tabs,
    activeTabId,
    onTabClick,
    onTabClose,
    onAddSession,
    onHistoryClick,
  }: any) => (
    <div data-testid="tabs">
      {tabs.map((tab: any) => (
        <div
          key={tab.id}
          data-testid={`tab-${tab.id}`}
          className={activeTabId === tab.id ? "active" : ""}
          onClick={() => onTabClick(tab.id)}
        >
          {tab.title}
          <button onClick={(e) => onTabClose(tab.id, e)}>关闭</button>
        </div>
      ))}
      <button onClick={onAddSession}>添加会话</button>
      <button onClick={onHistoryClick}>历史记录</button>
    </div>
  ),
}));

jest.mock("../HistoryDrawer.js", () => ({
  HistoryDrawer: ({ visible, onClose, onConversationClick }: any) =>
    visible ? (
      <div data-testid="history-drawer">
        <button onClick={onClose}>关闭</button>
        <button
          onClick={() =>
            onConversationClick({
              conversationId: "conv-1",
              title: "历史会话",
            })
          }
        >
          选择会话
        </button>
      </div>
    ) : null,
}));

import { ChatArea } from "./ChatArea";
import { JsonStorage } from "@next-shared/general/JsonStorage";
import { http } from "@next-core/http";

describe("ChatArea", () => {
  let mockStorage: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage = {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
    };
    (JsonStorage as jest.Mock).mockImplementation(() => mockStorage);
  });

  test("应该初始化时创建一个新会话标签", async () => {
    render(<ChatArea />);

    await waitFor(() => {
      const tabs = screen.getByTestId("tabs");
      expect(tabs).toBeInTheDocument();
      expect(screen.getByText("NEW_SESSION")).toBeInTheDocument();
    });
  });

  test("应该从 localStorage 加载已保存的标签", async () => {
    const savedTabs = [
      {
        id: "session_1",
        title: "已保存的会话",
        conversationId: "conv-1",
      },
    ];

    mockStorage.getItem = jest.fn(() => savedTabs);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByText("已保存的会话")).toBeInTheDocument();
    });
  });

  test("应该能够添加新的会话标签", async () => {
    const { container } = render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 记录初始标签数量
    const initialTabs = container.querySelectorAll('[data-testid^="tab-"]');
    const initialCount = initialTabs.length;

    const addButton = screen.getByText("添加会话");
    fireEvent.click(addButton);

    await waitFor(() => {
      const newTabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(newTabs.length).toBe(initialCount + 1);
    });
  });

  test("应该能够关闭标签并切换到相邻标签", async () => {
    const { container } = render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 添加第二个标签
    const addButton = screen.getByText("添加会话");
    fireEvent.click(addButton);

    await waitFor(() => {
      const tabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(tabs.length).toBe(2);
    });

    // 关闭第二个标签
    const closeButtons = screen.getAllByText("关闭");
    fireEvent.click(closeButtons[1]);

    await waitFor(() => {
      const tabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(tabs.length).toBe(1);
    });
  });

  test("应该在关闭所有标签后自动创建新标签", async () => {
    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 关闭唯一的标签
    const closeButton = screen.getByText("关闭");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.getByText("NEW_SESSION")).toBeInTheDocument();
    });
  });

  test("应该能够切换标签", async () => {
    const { container } = render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 添加第二个标签
    const addButton = screen.getByText("添加会话");
    fireEvent.click(addButton);

    await waitFor(() => {
      const tabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(tabs.length).toBe(2);
    });

    // 点击第一个标签
    const tabs = container.querySelectorAll('[data-testid^="tab-"]');
    fireEvent.click(tabs[0]);

    await waitFor(() => {
      expect(tabs[0].className).toContain("active");
    });
  });

  test("应该在提交消息时创建新会话", async () => {
    const mockPostResponse = {
      data: { conversationId: "new-conv-123" },
    };
    (http.post as jest.Mock).mockResolvedValue(mockPostResponse as never);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("提交消息");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalledWith(
        "api/gateway/logic.llm.aiops_service/api/v1/elevo/conversations",
        {}
      );
    });

    await waitFor(() => {
      const conversationId = screen.getByTestId("conversation-id");
      expect(conversationId.textContent).toBe("new-conv-123");
    });
  });

  test("应该在收到标题更新时更新标签标题", async () => {
    mockStorage.getItem = jest.fn(() => [
      {
        id: "session_1",
        title: "旧标题",
        conversationId: "conv-1",
      },
    ]);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByText("旧标题")).toBeInTheDocument();
    });

    const updateButton = screen.getByText("更新标题");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("更新的标题")).toBeInTheDocument();
    });
  });

  test("应该能够打开和关闭历史抽屉", async () => {
    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 打开历史抽屉
    const historyButton = screen.getByText("历史记录");
    fireEvent.click(historyButton);

    await waitFor(() => {
      expect(screen.getByTestId("history-drawer")).toBeInTheDocument();
    });

    // 关闭历史抽屉
    const closeButton = screen
      .getAllByText("关闭")
      .find((btn) => btn.closest('[data-testid="history-drawer"]'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByTestId("history-drawer")).not.toBeInTheDocument();
    });
  });

  test("应该能够从历史记录中选择会话", async () => {
    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 打开历史抽屉
    const historyButton = screen.getByText("历史记录");
    fireEvent.click(historyButton);

    await waitFor(() => {
      expect(screen.getByTestId("history-drawer")).toBeInTheDocument();
    });

    // 选择历史会话
    const selectButton = screen.getByText("选择会话");
    fireEvent.click(selectButton);

    // 等待新标签出现
    await waitFor(() => {
      expect(screen.queryByTestId("history-drawer")).not.toBeInTheDocument();
    });
  });

  test("应该在选择已存在的历史会话时激活该标签", async () => {
    mockStorage.getItem = jest.fn(() => [
      {
        id: "session_1",
        title: "已存在的会话",
        conversationId: "conv-1",
      },
    ]);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByText("已存在的会话")).toBeInTheDocument();
    });

    // 添加一个新标签
    const addButton = screen.getByText("添加会话");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("NEW_SESSION")).toBeInTheDocument();
    });

    // 打开历史抽屉并选择已存在的会话
    const historyButton = screen.getByText("历史记录");
    fireEvent.click(historyButton);

    await waitFor(() => {
      const selectButton = screen.getByText("选择会话");
      fireEvent.click(selectButton);
    });

    await waitFor(() => {
      const tabs = screen.queryAllByTestId(/^tab-/);
      expect(tabs[0].className).toContain("active");
    });
  });
});
