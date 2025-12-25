import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoApi_listElevoConversations: jest.fn(),
}));

jest.mock("moment", () => {
  const mockMoment = {
    unix: jest.fn(() => ({
      format: jest.fn(() => "2024-01-15 10:30:00"),
    })),
  };
  return mockMoment;
});

jest.mock("../i18n.js", () => ({
  K: {
    HISTORY_SESSIONS: "HISTORY_SESSIONS",
    NO_HISTORY: "NO_HISTORY",
    LOADING: "LOADING",
    LOAD_MORE: "LOAD_MORE",
  },
  t: (key: string) => key,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick:
    () =>
    ({ icon, onClick, className, textContent, disabled }: any) => {
      if (textContent) {
        return (
          <button onClick={onClick} disabled={disabled}>
            {textContent}
          </button>
        );
      }
      return (
        <span
          data-testid={`icon-${icon}`}
          onClick={onClick}
          className={className}
        >
          {icon}
        </span>
      );
    },
}));

jest.mock("../workbenchContext", () => {
  const React = require("react");
  const mockContext = React.createContext({
    spaceDetail: {
      instanceId: "space-1",
      name: "测试空间",
      description: "描述",
    },
  });
  return {
    WorkbenchContext: mockContext,
  };
});

jest.mock("../bricks.js", () => ({
  WrappedDrawer: ({
    visible,
    children,
    onClose,
    customTitle,
  }: {
    visible: boolean;
    children: React.ReactNode;
    onClose: () => void;
    customTitle: string;
  }) =>
    visible ? (
      <div data-testid="drawer">
        <div data-testid="drawer-title">{customTitle}</div>
        <button onClick={onClose}>关闭</button>
        {children}
      </div>
    ) : null,
  WrappedIcon: ({ icon, className }: { icon: string; className?: string }) => (
    <span data-testid={`icon-${icon}`} className={className}>
      {icon}
    </span>
  ),
  WrappedLink: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

import { HistoryDrawer } from "./HistoryDrawer";
import type { ConversationItem } from "../interfaces";
import { ElevoApi_listElevoConversations } from "@next-api-sdk/llm-sdk";

describe("HistoryDrawer", () => {
  const mockConversations: ConversationItem[] = [
    {
      conversationId: "conv-1",
      title: "会话1",
      description: "这是第一个会话",
      startTime: 1705294200,
      updatedAt: 1705294200,
    },
    {
      conversationId: "conv-2",
      title: "会话2",
      startTime: 1705294100,
    },
  ];

  const mockOnClose = jest.fn();
  const mockOnConversationClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该在 visible 为 false 时不渲染", () => {
    render(<HistoryDrawer visible={false} onClose={mockOnClose} />);

    expect(screen.queryByTestId("drawer")).not.toBeInTheDocument();
  });

  test("应该在 visible 为 true 时渲染并加载历史会话", async () => {
    (ElevoApi_listElevoConversations as jest.Mock).mockResolvedValue({
      conversations: mockConversations,
      nextToken: undefined,
    } as never);

    render(<HistoryDrawer visible={true} onClose={mockOnClose} />);

    expect(screen.getByTestId("drawer")).toBeInTheDocument();
    expect(screen.getByTestId("drawer-title")).toHaveTextContent(
      "HISTORY_SESSIONS"
    );

    await waitFor(() => {
      expect(screen.getByText("会话1")).toBeInTheDocument();
      expect(screen.getByText("会话2")).toBeInTheDocument();
    });

    expect(ElevoApi_listElevoConversations).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceInstanceId: "space-1",
        onlyOwner: true,
        limit: 20,
      }),
      expect.any(Object)
    );
  });

  test("应该在点击会话时调用 onConversationClick 并关闭抽屉", async () => {
    (ElevoApi_listElevoConversations as jest.Mock).mockResolvedValue({
      conversations: mockConversations,
      nextToken: undefined,
    } as never);

    render(
      <HistoryDrawer
        visible={true}
        onClose={mockOnClose}
        onConversationClick={mockOnConversationClick}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("会话1")).toBeInTheDocument();
    });

    const conversation1 = screen.getByText("会话1");
    fireEvent.click(conversation1);

    expect(mockOnConversationClick).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: "conv-1",
        title: "会话1",
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  test("应该在没有会话时显示空状态", async () => {
    (ElevoApi_listElevoConversations as jest.Mock).mockResolvedValue({
      conversations: [],
      nextToken: undefined,
    } as never);

    render(<HistoryDrawer visible={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByTestId("icon-inbox")).toBeInTheDocument();
      expect(screen.getByText("NO_HISTORY")).toBeInTheDocument();
    });
  });

  test("应该支持加载更多会话", async () => {
    (ElevoApi_listElevoConversations as jest.Mock)
      .mockResolvedValueOnce({
        conversations: mockConversations,
        nextToken: "token-123",
      } as never)
      .mockResolvedValueOnce({
        conversations: [
          {
            conversationId: "conv-3",
            title: "会话3",
            startTime: 1705294000,
          },
        ],
        nextToken: undefined,
      } as never);

    render(<HistoryDrawer visible={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByText("会话1")).toBeInTheDocument();
    });

    expect(screen.getByText("LOAD_MORE")).toBeInTheDocument();

    const loadMoreButton = screen.getByText("LOAD_MORE");
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(screen.getByText("会话3")).toBeInTheDocument();
    });

    expect(ElevoApi_listElevoConversations).toHaveBeenCalledTimes(2);
    expect(ElevoApi_listElevoConversations).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        token: "token-123",
      }),
      expect.any(Object)
    );
  });
});
