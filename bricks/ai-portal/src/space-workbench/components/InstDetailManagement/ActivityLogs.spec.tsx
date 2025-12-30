import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("@next-core/easyops-runtime", () => ({
  auth: {
    getAuth: jest.fn(() => ({
      username: "testuser",
    })),
  },
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoSpaceApi_listActivityLogs: jest.fn(),
  ElevoSpaceApi_createActivityLog: jest.fn(),
}));

jest.mock("@next-shared/datetime", () => ({
  humanizeTime: jest.fn(() => "2小时前"),
  HumanizeTimeFormat: {
    relative: "relative",
  },
}));

jest.mock("../../i18n.js", () => ({
  K: {
    ACTIVITY_RECORD: "ACTIVITY_RECORD",
    LOADING: "LOADING",
    NO_ACTIVITY_RECORD: "NO_ACTIVITY_RECORD",
    ADD_COMMENT_PLACEHOLDER: "ADD_COMMENT_PLACEHOLDER",
    CREATED_INSTANCE: "CREATED_INSTANCE",
    EDITED_INSTANCE: "EDITED_INSTANCE",
    COMMENTED: "COMMENTED",
    STARTED_CONVERSATION: "STARTED_CONVERSATION",
    STATUS_CHANGED: "STATUS_CHANGED",
    CONVERSATION: "CONVERSATION",
    CHANGED_STATUS_TO: "CHANGED_STATUS_TO",
  },
  t: (key: string) => key,
}));

jest.mock("../../bricks", () => ({
  WrappedTextarea: ({
    value,
    disabled,
    onValueChange,
    onKeyDown,
    placeholder,
  }: any) => (
    <textarea
      data-testid="comment-textarea"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) =>
        onValueChange?.({ detail: e.target.value } as CustomEvent<string>)
      }
      onKeyDown={onKeyDown}
    />
  ),
  WrappedIcon: ({ icon }: any) => (
    <span data-testid={`icon-${icon}`}>{icon}</span>
  ),
}));

jest.mock("../EmptyState", () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

import { ActivityLogs } from "./ActivityLogs";
import {
  ElevoSpaceApi_listActivityLogs,
  ElevoSpaceApi_createActivityLog,
} from "@next-api-sdk/llm-sdk";
import { handleHttpError } from "@next-core/runtime";
import { auth } from "@next-core/easyops-runtime";

describe("ActivityLogs", () => {
  const mockOnLinkConversation = jest.fn();
  const defaultProps = {
    objectId: "obj-1",
    objectInstanceId: "inst-1",
    spaceId: "space-1",
    onLinkConversation: mockOnLinkConversation,
  };

  const mockActivities = [
    {
      activityId: "act-1",
      spaceId: "space-1",
      objectId: "obj-1",
      objectInstanceId: "inst-1",
      conversationId: "conv-1",
      actionType: "create_instance" as const,
      userName: "张三",
      payload: {},
      createTime: 1234567890,
    },
    {
      activityId: "act-2",
      spaceId: "space-1",
      objectId: "obj-1",
      objectInstanceId: "inst-1",
      conversationId: "conv-2",
      actionType: "edit_instance" as const,
      userName: "李四",
      payload: { new: { name: "新名称", status: "active" } },
      createTime: 1234567900,
    },
    {
      activityId: "act-3",
      spaceId: "space-1",
      objectId: "obj-1",
      objectInstanceId: "inst-1",
      conversationId: "conv-3",
      actionType: "comment" as const,
      userName: "王五",
      payload: { content: "这是一条评论" },
      createTime: 1234567910,
    },
    {
      activityId: "act-4",
      spaceId: "space-1",
      objectId: "obj-1",
      objectInstanceId: "inst-1",
      conversationId: "conv-4",
      actionType: "start_conversation" as const,
      userName: "赵六",
      payload: { title: "开始对话" },
      createTime: 1234567920,
    },
    {
      activityId: "act-5",
      spaceId: "space-1",
      objectId: "obj-1",
      objectInstanceId: "inst-1",
      conversationId: "conv-5",
      actionType: "status_change" as const,
      userName: "孙七",
      payload: { conversationTitle: "状态变更对话", status: "completed" },
      createTime: 1234567930,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: mockActivities,
    } as never);
  });

  test("应该渲染活动记录标题和计数", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("ACTIVITY_RECORD")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  test("应该在加载时显示加载状态", () => {
    render(<ActivityLogs {...defaultProps} />);
    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });

  test("应该加载并显示活动记录列表", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("CREATED_INSTANCE")).toBeInTheDocument();
      expect(screen.getByText("EDITED_INSTANCE")).toBeInTheDocument();
      expect(screen.getByText("COMMENTED")).toBeInTheDocument();
      expect(screen.getByText("STARTED_CONVERSATION")).toBeInTheDocument();
      expect(screen.getByText("STATUS_CHANGED")).toBeInTheDocument();
    });

    expect(ElevoSpaceApi_listActivityLogs).toHaveBeenCalledWith("space-1", {
      objectId: "obj-1",
      objectInstanceId: "inst-1",
      limit: 200,
    });
  });

  test("应该在没有活动记录时显示空状态", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
      expect(screen.getByText("NO_ACTIVITY_RECORD")).toBeInTheDocument();
    });
  });

  test("应该在加载失败时调用错误处理", async () => {
    const error = new Error("加载失败");
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockRejectedValue(
      error as never
    );

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalledWith(error);
    });
  });

  test("应该正确格式化 create_instance 活动", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[0]],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("张三 CREATED_INSTANCE")).toBeInTheDocument();
    });
  });

  test("应该正确格式化 edit_instance 活动并显示字段名", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[1]],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/李四 EDITED_INSTANCE-name,status/)
      ).toBeInTheDocument();
    });
  });

  test("应该正确格式化 comment 活动", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[2]],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("王五 COMMENTED: 这是一条评论")
      ).toBeInTheDocument();
    });
  });

  test("应该正确格式化 start_conversation 活动", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[3]],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("赵六 STARTED_CONVERSATION: 开始对话")
      ).toBeInTheDocument();
    });
  });

  test("应该正确格式化 status_change 活动", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[4]],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("状态变更对话 CHANGED_STATUS_TOcompleted")
      ).toBeInTheDocument();
    });
  });

  test("应该在点击 start_conversation 活动时调用 onLinkConversation", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[3]],
    } as never);

    const { container } = render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("STARTED_CONVERSATION")).toBeInTheDocument();
    });

    const clickableCard = container.querySelector('[class*="clickable"]');
    expect(clickableCard).toBeInTheDocument();

    if (clickableCard) {
      fireEvent.click(clickableCard);
      expect(mockOnLinkConversation).toHaveBeenCalledWith({
        conversationId: "conv-4",
      });
    }
  });

  test("应该在点击非 start_conversation 活动时不调用 onLinkConversation", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[0]],
    } as never);

    const { container } = render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("CREATED_INSTANCE")).toBeInTheDocument();
    });

    const disabledCard = container.querySelector('[class*="disabled"]');
    expect(disabledCard).toBeInTheDocument();

    if (disabledCard) {
      fireEvent.click(disabledCard);
      expect(mockOnLinkConversation).not.toHaveBeenCalled();
    }
  });

  test("应该显示正确的图标类型", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      // start_conversation 应该显示 message-square 图标
      expect(screen.getByTestId("icon-message-square")).toBeInTheDocument();
      // 其他类型应该显示 info 图标
      expect(screen.getAllByTestId("icon-info").length).toBeGreaterThan(0);
    });
  });

  test("应该能够输入评论内容", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "新评论" } });

    expect(textarea).toHaveValue("新评论");
  });

  test("应该能够提交评论", async () => {
    (ElevoSpaceApi_createActivityLog as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "新评论内容" } });

    // 模拟按下 Enter 键
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => {
      expect(ElevoSpaceApi_createActivityLog).toHaveBeenCalledWith("space-1", {
        objectId: "obj-1",
        objectInstanceId: "inst-1",
        actionType: "comment",
        userName: "testuser",
        payload: { content: "新评论内容" },
      });
    });

    // 验证评论提交后清空输入框
    await waitFor(() => {
      expect(textarea).toHaveValue("");
    });

    // 验证刷新列表
    expect(ElevoSpaceApi_listActivityLogs).toHaveBeenCalledTimes(2);
  });

  test("应该在按下 Shift+Enter 时不提交评论", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "新评论" } });

    // 模拟按下 Shift+Enter 键
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

    // 验证没有调用 createActivityLog
    expect(ElevoSpaceApi_createActivityLog).not.toHaveBeenCalled();
  });

  test("应该在评论内容为空时不提交", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "   " } });

    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    expect(ElevoSpaceApi_createActivityLog).not.toHaveBeenCalled();
  });

  test("应该在提交评论时禁用输入框", async () => {
    let resolveCreate: () => void;
    const createPromise = new Promise<void>((resolve) => {
      resolveCreate = resolve;
    });

    (ElevoSpaceApi_createActivityLog as jest.Mock).mockReturnValue(
      createPromise as never
    );

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "新评论" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => {
      expect(textarea).toBeDisabled();
    });

    // 完成创建
    resolveCreate!();

    await waitFor(() => {
      expect(textarea).not.toBeDisabled();
    });
  });

  test("应该在提交评论失败时调用错误处理", async () => {
    const error = new Error("提交失败");
    (ElevoSpaceApi_createActivityLog as jest.Mock).mockRejectedValue(
      error as never
    );

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "新评论" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => {
      expect(handleHttpError).toHaveBeenCalledWith(error);
    });
  });

  test("应该在没有用户名时使用 Anonymous", async () => {
    (auth.getAuth as jest.Mock).mockReturnValue({});

    (ElevoSpaceApi_createActivityLog as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("comment-textarea")).toBeInTheDocument();
    });

    const textarea = screen.getByTestId("comment-textarea");
    fireEvent.change(textarea, { target: { value: "新评论" } });
    fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

    await waitFor(() => {
      expect(ElevoSpaceApi_createActivityLog).toHaveBeenCalledWith("space-1", {
        objectId: "obj-1",
        objectInstanceId: "inst-1",
        actionType: "comment",
        userName: "Anonymous",
        payload: { content: "新评论" },
      });
    });
  });

  test("应该显示活动的时间信息", async () => {
    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      const timeElements = screen.getAllByText("2小时前");
      expect(timeElements.length).toBe(5);
    });
  });

  test("应该正确处理没有 payload.new 的 edit_instance 活动", async () => {
    const activityWithoutNew = {
      ...mockActivities[1],
      payload: {},
    };

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [activityWithoutNew],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("李四 EDITED_INSTANCE")).toBeInTheDocument();
    });
  });

  test("应该在没有总数时不显示计数标签", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [],
    } as never);

    const { container } = render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      const countBadge = container.querySelector('[class*="countBadge"]');
      expect(countBadge).not.toBeInTheDocument();
    });
  });

  test("应该正确处理未知的 actionType", async () => {
    const unknownActivity = {
      ...mockActivities[0],
      actionType: "unknown_type" as any,
    };

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [unknownActivity],
    } as never);

    const { container } = render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      const cards = container.querySelectorAll('[class*="activityCard"]');
      expect(cards.length).toBe(1);
    });
  });

  test("应该正确处理没有 conversationTitle 的 status_change 活动", async () => {
    const activityWithoutTitle = {
      ...mockActivities[4],
      payload: { status: "completed" },
    };

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [activityWithoutTitle],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText("CONVERSATION CHANGED_STATUS_TOcompleted")
      ).toBeInTheDocument();
    });
  });

  test("应该正确处理没有 payload.content 的 comment 活动", async () => {
    const activityWithoutContent = {
      ...mockActivities[2],
      payload: {},
    };

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [activityWithoutContent],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/王五 COMMENTED:/)).toBeInTheDocument();
    });
  });

  test("应该正确处理没有 payload.title 的 start_conversation 活动", async () => {
    const activityWithoutTitle = {
      ...mockActivities[3],
      payload: {},
    };

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [activityWithoutTitle],
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/赵六 STARTED_CONVERSATION:/)
      ).toBeInTheDocument();
    });
  });

  test("应该正确处理 formatTime 返回空字符串的情况", async () => {
    // Mock humanizeTime 返回空字符串
    const { humanizeTime } = require("@next-shared/datetime");
    (humanizeTime as jest.Mock).mockReturnValueOnce("");

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [mockActivities[0]],
    } as never);

    const { container } = render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      const timeElements = container.querySelectorAll('[class*="timeText"]');
      expect(timeElements.length).toBe(1);
      expect(timeElements[0].textContent).toBe("");
    });
  });

  test("应该在点击没有 conversationId 的 start_conversation 活动时不调用回调", async () => {
    const activityWithoutConvId = {
      ...mockActivities[3],
      conversationId: "",
    };

    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: [activityWithoutConvId],
    } as never);

    const { container } = render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("STARTED_CONVERSATION")).toBeInTheDocument();
    });

    const clickableCard = container.querySelector('[class*="clickable"]');
    if (clickableCard) {
      fireEvent.click(clickableCard);
      expect(mockOnLinkConversation).not.toHaveBeenCalled();
    }
  });

  test("应该在 list 为 null 时正确处理", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue({
      list: null,
    } as never);

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  test("应该在 list 为 undefined 时正确处理", async () => {
    (ElevoSpaceApi_listActivityLogs as jest.Mock).mockResolvedValue(
      {} as never
    );

    render(<ActivityLogs {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });
});
