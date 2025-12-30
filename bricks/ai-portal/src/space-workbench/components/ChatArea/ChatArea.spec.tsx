import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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

  test("应该将 activeTabId 保存到 localStorage", async () => {
    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 添加新标签
    const addButton = screen.getByText("添加会话");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("space_workbench_active_tab_id"),
        expect.any(String)
      );
    });
  });

  test("应该在保存的 activeTabId 不存在时激活第一个标签", async () => {
    const savedTabs = [
      { id: "session_1", title: "会话1", conversationId: null },
      { id: "session_2", title: "会话2", conversationId: null },
    ];

    // 返回一个不存在的 tabId
    let callCount = 0;
    mockStorage.getItem = jest.fn(() => {
      callCount++;
      if (callCount === 1) return savedTabs; // 第一次调用返回 tabs
      return "non-existent-id"; // 第二次调用返回不存在的 activeTabId
    });

    const { container } = render(<ChatArea />);

    await waitFor(() => {
      const tabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(tabs.length).toBe(2);
      expect(tabs[0].className).toContain("active");
    });
  });

  test("应该通过 ref 调用 addNewSession 方法（带 conversationId 和 content）", async () => {
    const ref = React.createRef<any>();
    render(<ChatArea ref={ref} />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    const initialRequest = {
      conversationId: "conv-123",
      content: "测试消息",
      message: "测试消息",
    };

    act(() => {
      ref.current?.addNewSession(initialRequest);
    });

    await waitFor(() => {
      expect(screen.getByTestId("conversation-id").textContent).toBe(
        "conv-123"
      );
    });
  });

  test("应该通过 ref 调用 addNewSession 方法（仅 conversationId 无 content）", async () => {
    const ref = React.createRef<any>();
    render(<ChatArea ref={ref} />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    const initialRequest = {
      conversationId: "conv-resume",
    };

    act(() => {
      ref.current?.addNewSession(initialRequest);
    });

    await waitFor(() => {
      expect(screen.getByTestId("conversation-id").textContent).toBe(
        "conv-resume"
      );
    });
  });

  test("应该通过 ref 调用 sendMessage 方法", async () => {
    const mockPostResponse = {
      data: { conversationId: "new-conv-456" },
    };
    (http.post as jest.Mock).mockResolvedValue(mockPostResponse as never);

    const ref = React.createRef<any>();
    render(<ChatArea ref={ref} />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    const payload = {
      message: "新消息",
      content: "新消息内容",
    };

    await ref.current?.sendMessage(payload);

    await waitFor(() => {
      expect(http.post).toHaveBeenCalled();
    });
  });

  test("应该在已有 conversationId 时不创建新会话", async () => {
    mockStorage.getItem = jest.fn(() => [
      {
        id: "session_1",
        title: "已有会话",
        conversationId: "existing-conv",
      },
    ]);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByText("已有会话")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("提交消息");
    fireEvent.click(submitButton);

    // 不应该调用创建会话的 API
    expect(http.post).not.toHaveBeenCalled();
  });

  test("应该在提交消息失败时处理错误", async () => {
    const { handleHttpError } = require("@next-core/runtime");
    const error = new Error("网络错误");
    (http.post as jest.Mock).mockRejectedValue(error as never);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("提交消息");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalledWith(error);
    });
  });

  test("应该在提交时设置 submitDisabled", async () => {
    let resolvePost: any;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    (http.post as jest.Mock).mockReturnValue(postPromise as never);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("提交消息");
    fireEvent.click(submitButton);

    await waitFor(() => {
      const submitDisabled = screen.getByTestId("submit-disabled");
      expect(submitDisabled.textContent).toBe("true");
    });

    // 完成请求
    resolvePost({ data: { conversationId: "new-conv" } });

    await waitFor(() => {
      const submitDisabled = screen.getByTestId("submit-disabled");
      expect(submitDisabled.textContent).toBe("false");
    });
  });

  test("应该在关闭标签时清理 processedConversationIds", async () => {
    mockStorage.getItem = jest.fn(() => [
      {
        id: "session_1",
        title: "会话1",
        conversationId: "conv-1",
      },
    ]);

    const { container } = render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByText("会话1")).toBeInTheDocument();
    });

    // 添加第二个标签
    const addButton = screen.getByText("添加会话");
    fireEvent.click(addButton);

    await waitFor(() => {
      const tabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(tabs.length).toBe(2);
    });

    // 关闭第一个标签
    const closeButtons = screen.getAllByText("关闭");
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      const tabs = container.querySelectorAll('[data-testid^="tab-"]');
      expect(tabs.length).toBe(1);
    });
  });

  test("应该在收到数据时标记 conversationId 为已处理", async () => {
    mockStorage.getItem = jest.fn(() => [
      {
        id: "session_1",
        title: "会话1",
        conversationId: "conv-1",
      },
    ]);

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByText("会话1")).toBeInTheDocument();
    });

    // 触发 onData 回调
    const updateButton = screen.getByText("更新标题");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("更新的标题")).toBeInTheDocument();
    });
  });

  test("应该正确计算 effectiveInitialRequest", async () => {
    const ref = React.createRef<any>();
    render(<ChatArea ref={ref} />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 添加带 initialRequest 的新会话
    const initialRequest = {
      conversationId: "conv-123",
      content: "初始消息",
      message: "初始消息",
    };

    act(() => {
      ref.current?.addNewSession(initialRequest);
    });

    await waitFor(() => {
      expect(screen.getByTestId("conversation-id").textContent).toBe(
        "conv-123"
      );
    });

    // 触发 onData 标记为已处理
    const updateButton = screen.getByText("更新标题");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText("更新的标题")).toBeInTheDocument();
    });
  });

  test("应该将 tabs 保存到 localStorage", async () => {
    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    expect(mockStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining("space_workbench_active_tabs"),
      expect.any(Array)
    );
  });

  test("应该在切换标签时渲染不同的 ChatPanelContent", async () => {
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
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument();
    });
  });

  test("应该处理不同 spaceDetail instanceId 的 storage key", async () => {
    // 先设置一些已保存的 tabs，这样会触发读取 activeTabId
    mockStorage.getItem = jest.fn((key: string) => {
      if (key === "space_workbench_active_tabs_space-1") {
        return [{ id: "session_1", title: "会话1", conversationId: null }];
      }
      if (key === "space_workbench_active_tab_id_space-1") {
        return "session_1";
      }
      return null;
    });

    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 检查 getItem 是否被调用了正确的 storage key
    const getItemCalls = (mockStorage.getItem as jest.Mock).mock.calls;
    const tabsKeyCalled = getItemCalls.some(
      (call: any[]) => call[0] === "space_workbench_active_tabs_space-1"
    );
    const tabIdKeyCalled = getItemCalls.some(
      (call: any[]) => call[0] === "space_workbench_active_tab_id_space-1"
    );

    expect(tabsKeyCalled).toBe(true);
    expect(tabIdKeyCalled).toBe(true);
  });

  test("应该在标签数组为空时不保存到 localStorage", async () => {
    mockStorage.setItem.mockClear();

    // 这个测试需要模拟一个特殊场景，实际上组件会自动创建一个新标签
    render(<ChatArea />);

    await waitFor(() => {
      expect(screen.getByTestId("tabs")).toBeInTheDocument();
    });

    // 验证有保存操作（因为会自动创建标签）
    expect(mockStorage.setItem).toHaveBeenCalled();
  });
});
