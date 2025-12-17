import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SpaceNav, type SpaceNavProps } from "./SpaceNav.js";
import type { NoticeItem } from "../../../notice-dropdown/index.js";

// Mock the i18n module
jest.mock("../../i18n.js", () => ({
  K: {
    DESCRIPTION: "DESCRIPTION",
  },
  t: jest.fn((key: string) => {
    const translations: Record<string, string> = {
      DESCRIPTION: "描述",
    };
    return translations[key] || key;
  }),
}));

// Mock wrapped components
jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    const MockComponent = ({
      children,
      onClick,
      onNoticeClick,
      onMarkAllRead,
      className,
      lib,
      icon,
      theme,
      dataSource,
    }: any) => {
      const handleClick = (e: any) => {
        onClick?.(e);
      };

      const handleNoticeClick = (notice: NoticeItem) => {
        onNoticeClick?.({ detail: notice });
      };

      const handleMarkAllRead = () => {
        onMarkAllRead?.();
      };

      // Mock NoticeDropdown
      if (tagName === "ai-portal.notice-dropdown") {
        return (
          <div
            data-testid="mock-notice-dropdown"
            onClick={() => {
              // 模拟通知点击
              if (dataSource && dataSource.length > 0) {
                handleNoticeClick(dataSource[0]);
              }
            }}
          >
            <button
              data-testid="mark-all-read-button"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllRead();
              }}
            >
              Mark All Read
            </button>
            {children}
          </div>
        );
      }

      // Mock SpaceLogo
      if (tagName === "ai-portal.space-logo") {
        return (
          <div data-testid="mock-space-logo" className="space-logo">
            Space Logo
          </div>
        );
      }

      // Mock Icon
      if (tagName === "eo-icon") {
        return (
          <div
            data-testid={`mock-icon-${icon}`}
            className={className}
            onClick={handleClick}
          >
            {lib}-{icon}-{theme}
          </div>
        );
      }

      return (
        <div data-testid={`mock-${tagName}`} onClick={handleClick}>
          {children}
        </div>
      );
    };
    MockComponent.displayName = `Mock${tagName}`;
    return MockComponent;
  }),
}));

describe("SpaceNav", () => {
  const mockNotices: NoticeItem[] = [
    {
      id: "1",
      type: "project",
      isRead: false,
      title: "测试通知",
      description: "测试描述",
      time: 1761820851887,
    },
    {
      id: "2",
      type: "system",
      isRead: true,
      title: "系统通知",
      description: "系统描述",
      time: 1761820851887,
    },
  ];

  const defaultProps: SpaceNavProps = {
    spaceName: "测试空间",
    notices: mockNotices,
    onBack: jest.fn(),
    onMembersClick: jest.fn(),
    notifyCenterUrl: "/notify-center",
    onMarkAllRead: jest.fn(),
    onNoticeClick: jest.fn(),
  };

  test("should render basic structure with space name", () => {
    const { container } = render(<SpaceNav {...defaultProps} />);

    // 验证 header 结构
    expect(
      container.querySelector(".space-workbench-header")
    ).toBeInTheDocument();
    expect(container.querySelector(".header-left")).toBeInTheDocument();
    expect(container.querySelector(".header-right")).toBeInTheDocument();

    // 验证空间名称
    const title = container.querySelector(".space-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("测试空间");
  });

  test("should render all navigation elements", () => {
    render(<SpaceNav {...defaultProps} />);

    // 验证后退按钮图标
    expect(screen.getByTestId("mock-icon-arrow-left")).toBeInTheDocument();

    // 验证 Space Logo
    expect(screen.getByTestId("mock-space-logo")).toBeInTheDocument();

    // 验证设置图标
    expect(screen.getByTestId("mock-icon-setting")).toBeInTheDocument();

    // 验证问号图标
    expect(screen.getByTestId("mock-icon-question-circle")).toBeInTheDocument();

    // 验证成员图标
    expect(screen.getByTestId("mock-icon-usergroup-add")).toBeInTheDocument();

    // 验证通知下拉框
    expect(screen.getByTestId("mock-notice-dropdown")).toBeInTheDocument();
  });

  test("should toggle description visibility when question button is clicked", async () => {
    const { container } = render(
      <SpaceNav {...defaultProps} description="空间描述内容" />
    );

    // 初始状态：描述不显示
    expect(
      container.querySelector(".space-description")
    ).not.toBeInTheDocument();

    // 点击问号按钮
    const questionButton = container.querySelectorAll(
      ".action-icons .icon-button"
    )[1] as HTMLElement;

    await act(async () => {
      fireEvent.click(questionButton);
    });

    // 描述应该显示
    expect(container.querySelector(".space-description")).toBeInTheDocument();
    expect(container.querySelector(".description-content")).toHaveTextContent(
      "空间描述内容"
    );

    // 再次点击问号按钮
    await act(async () => {
      fireEvent.click(questionButton);
    });

    // 描述应该隐藏
    expect(
      container.querySelector(".space-description")
    ).not.toBeInTheDocument();
  });

  test("should add active class to question button when description is shown", async () => {
    const { container } = render(
      <SpaceNav {...defaultProps} description="空间描述" />
    );

    const questionButton = container.querySelectorAll(
      ".action-icons .icon-button"
    )[1] as HTMLElement;

    // 初始状态：无 active class
    expect(questionButton).not.toHaveClass("active");

    // 点击后应该有 active class
    await act(async () => {
      fireEvent.click(questionButton);
    });

    expect(questionButton).toHaveClass("active");

    // 再次点击后应该移除 active class
    await act(async () => {
      fireEvent.click(questionButton);
    });

    expect(questionButton).not.toHaveClass("active");
  });

  test("should handle edit button click in description", async () => {
    const onSpaceEdit = jest.fn();
    const { container } = render(
      <SpaceNav
        {...defaultProps}
        description="可编辑的描述"
        onSpaceEdit={onSpaceEdit}
      />
    );

    // 显示描述
    const questionButton = container.querySelectorAll(
      ".action-icons .icon-button"
    )[1] as HTMLElement;

    await act(async () => {
      fireEvent.click(questionButton);
    });

    // 点击编辑按钮
    const editButton = container.querySelector(
      ".description-edit-button"
    ) as HTMLElement;
    fireEvent.click(editButton);

    expect(onSpaceEdit).toHaveBeenCalledTimes(1);
  });

  test("should pass notices to NoticeDropdown", () => {
    render(<SpaceNav {...defaultProps} />);

    const noticeDropdown = screen.getByTestId("mock-notice-dropdown");
    expect(noticeDropdown).toBeInTheDocument();
  });
  test("should render divider between members icon and notice dropdown", () => {
    const { container } = render(<SpaceNav {...defaultProps} />);

    const divider = container.querySelector(".header-right .divider");
    expect(divider).toBeInTheDocument();
  });

  test("should have correct class names for styling", () => {
    const { container } = render(<SpaceNav {...defaultProps} />);

    // 验证关键 class names
    expect(
      container.querySelector(".space-workbench-header")
    ).toBeInTheDocument();
    expect(container.querySelector(".header-left")).toBeInTheDocument();
    expect(container.querySelector(".header-right")).toBeInTheDocument();
    expect(container.querySelector(".space-title")).toBeInTheDocument();
    expect(container.querySelector(".action-icons")).toBeInTheDocument();
    expect(container.querySelectorAll(".icon-button").length).toBeGreaterThan(
      0
    );
  });

  test("should maintain description state across re-renders", async () => {
    const { container, rerender } = render(
      <SpaceNav {...defaultProps} description="初始描述" />
    );

    // 显示描述
    const questionButton = container.querySelectorAll(
      ".action-icons .icon-button"
    )[1] as HTMLElement;

    await act(async () => {
      fireEvent.click(questionButton);
    });

    expect(container.querySelector(".space-description")).toBeInTheDocument();

    // 重新渲染，更新 description
    await act(async () => {
      rerender(<SpaceNav {...defaultProps} description="更新后的描述" />);
    });

    // 描述应该仍然显示，但内容已更新
    expect(container.querySelector(".space-description")).toBeInTheDocument();
    expect(container.querySelector(".description-content")).toHaveTextContent(
      "更新后的描述"
    );
  });
});
