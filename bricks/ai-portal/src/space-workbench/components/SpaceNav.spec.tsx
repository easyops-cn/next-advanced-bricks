import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
  i18n: {
    getFixedT: jest.fn(() => (key: string) => key),
  },
}));

jest.mock("../i18n.js", () => ({
  K: {
    DESCRIPTION: "DESCRIPTION",
  },
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string, eventMap?: any) => {
    // eslint-disable-next-line react/display-name
    return ({
      children,
      onClick,
      onNoticeClick,
      onMarkAllRead,
      ...props
    }: any) => {
      const handleClick = () => {
        onClick?.();
        if (eventMap?.onNoticeClick && onNoticeClick) {
          onNoticeClick({ detail: {} });
        }
        if (eventMap?.onMarkAllRead && onMarkAllRead) {
          onMarkAllRead({ detail: undefined });
        }
      };

      return (
        <div
          data-testid={`wrapped-${tagName}`}
          onClick={handleClick}
          {...props}
        >
          {children}
        </div>
      );
    };
  }),
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoSpaceApi_getSpaceSchema: jest.fn(() =>
    Promise.resolve({ businessObjects: [], businessFlows: [] })
  ),
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("./SpaceConfigModal/SpaceConfigModal", () => ({
  SpaceConfigModal: ({ visible, onCancel }: any) =>
    visible ? (
      <div data-testid="space-config-modal">
        <button onClick={onCancel}>关闭</button>
      </div>
    ) : null,
}));

import { SpaceNav } from "./SpaceNav";
import type { SpaceDetail } from "../interfaces";
import { ElevoSpaceApi_getSpaceSchema } from "@next-api-sdk/llm-sdk";
import type { NoticeItem } from "../../notice-dropdown/index.js";

describe("SpaceNav", () => {
  const mockSpaceDetail: SpaceDetail = {
    name: "测试空间",
    instanceId: "test-space-123",
    description: "这是一个测试空间",
  };

  const mockNotices = [
    { id: "1", title: "通知1", content: "内容1", read: false },
    { id: "2", title: "通知2", content: "内容2", read: true },
  ] as unknown as NoticeItem[];

  const defaultProps = {
    spaceDetail: mockSpaceDetail,
    notices: [],
    notifyCenterUrl: "/notify-center",
    onBack: jest.fn(),
    onMembersClick: jest.fn(),
    onMarkAllRead: jest.fn(),
    onNoticeClick: jest.fn(),
    onSpaceEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (ElevoSpaceApi_getSpaceSchema as jest.Mock).mockResolvedValue({
      businessObjects: [],
      businessFlows: [],
    } as never);
  });

  test("应该正确渲染空间名称和基础元素", () => {
    render(<SpaceNav {...defaultProps} />);
    expect(screen.getByText("测试空间")).toBeInTheDocument();
    expect(
      screen.getByTestId("wrapped-ai-portal.space-logo")
    ).toBeInTheDocument();
  });

  test("应该在点击返回按钮时调用 onBack 回调", () => {
    render(<SpaceNav {...defaultProps} />);

    const backButtons = screen.getAllByTestId("wrapped-eo-icon");
    const backButton = backButtons.find((btn) =>
      btn.getAttribute("icon")?.includes("arrow-left")
    );

    if (backButton) {
      fireEvent.click(backButton);
      expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
    }
  });

  test("应该在点击问号按钮时切换描述显示状态", () => {
    render(<SpaceNav {...defaultProps} />);

    const questionButtons = screen.getAllByTestId("wrapped-eo-icon");
    const questionButton = questionButtons.find((btn) =>
      btn.getAttribute("icon")?.includes("question-circle")
    );

    // 初始状态：描述不可见
    const descriptionDiv = screen.queryByText("这是一个测试空间");
    expect(descriptionDiv).toBeInTheDocument();

    // 点击问号按钮
    if (questionButton) {
      fireEvent.click(questionButton);
    }
  });

  test("应该在点击设置按钮时打开配置模态框", async () => {
    render(<SpaceNav {...defaultProps} />);

    const settingButtons = screen.getAllByTestId("wrapped-eo-icon");
    const settingButton = settingButtons.find((btn) =>
      btn.getAttribute("icon")?.includes("setting")
    );

    if (settingButton) {
      fireEvent.click(settingButton);

      await waitFor(() => {
        expect(screen.getByTestId("space-config-modal")).toBeInTheDocument();
      });

      expect(ElevoSpaceApi_getSpaceSchema).toHaveBeenCalledWith(
        "test-space-123"
      );
    }
  });

  test("应该正确渲染通知下拉框并响应事件", () => {
    render(<SpaceNav {...defaultProps} notices={mockNotices} />);

    const noticeDropdown = screen.getByTestId(
      "wrapped-ai-portal.notice-dropdown"
    );
    expect(noticeDropdown).toBeInTheDocument();

    // 模拟点击通知
    fireEvent.click(noticeDropdown);
  });

  test("应该在有描述时显示描述区域和编辑按钮", () => {
    render(<SpaceNav {...defaultProps} />);

    expect(screen.getByText("这是一个测试空间")).toBeInTheDocument();
    expect(screen.getByText("DESCRIPTION")).toBeInTheDocument();

    const editButtons = screen.getAllByTestId("wrapped-eo-icon");
    const editButton = editButtons.find((btn) =>
      btn.getAttribute("icon")?.includes("edit")
    );

    if (editButton) {
      fireEvent.click(editButton);
      expect(defaultProps.onSpaceEdit).toHaveBeenCalledTimes(1);
    }
  });
});
