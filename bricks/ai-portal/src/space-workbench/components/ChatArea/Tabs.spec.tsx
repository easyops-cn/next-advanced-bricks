import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../../i18n.js", () => ({
  K: {
    CLOSE_TAB: "CLOSE_TAB",
    NEW_SESSION: "NEW_SESSION",
    HISTORY_SESSIONS: "HISTORY_SESSIONS",
  },
  t: (key: string) => key,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick:
    () =>
    ({ icon, className }: any) => (
      <span data-testid={`icon-${icon}`} className={className}>
        {icon}
      </span>
    ),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

import { Tab, Tabs } from "./Tabs";
import type { TabItem } from "./Tabs";

describe("Tab", () => {
  const mockOnClick = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该渲染标签并支持激活状态", () => {
    const { container, rerender } = render(
      <Tab
        id="tab-1"
        title="测试标签"
        active={false}
        onClick={mockOnClick}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("测试标签")).toBeInTheDocument();
    expect(screen.getByTestId("icon-message")).toBeInTheDocument();

    // 测试激活状态
    rerender(
      <Tab
        id="tab-1"
        title="测试标签"
        active={true}
        onClick={mockOnClick}
        onClose={mockOnClose}
      />
    );

    const tab = container.firstChild as HTMLElement;
    expect(tab.className).toContain("active");
  });

  test("应该在点击时调用 onClick", () => {
    render(
      <Tab
        id="tab-1"
        title="测试标签"
        active={false}
        onClick={mockOnClick}
        onClose={mockOnClose}
      />
    );

    const tab = screen.getByText("测试标签").parentElement;
    if (tab) {
      fireEvent.click(tab);
    }

    expect(mockOnClick).toHaveBeenCalledWith("tab-1");
  });

  test("应该在点击关闭按钮时调用 onClose", () => {
    render(
      <Tab
        id="tab-1"
        title="测试标签"
        active={false}
        onClick={mockOnClick}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByTitle("CLOSE_TAB");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledWith("tab-1", expect.anything());
  });
});

describe("Tabs", () => {
  const mockTabs: TabItem[] = [
    { id: "tab-1", title: "标签1" },
    { id: "tab-2", title: "标签2" },
    { id: "tab-3", title: "标签3" },
  ];

  const mockOnTabClick = jest.fn();
  const mockOnTabClose = jest.fn();
  const mockOnAddSession = jest.fn();
  const mockOnHistoryClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该渲染所有标签和操作按钮", () => {
    render(
      <Tabs
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
        onAddSession={mockOnAddSession}
        onHistoryClick={mockOnHistoryClick}
      />
    );

    // 验证标签渲染
    expect(screen.getByText("标签1")).toBeInTheDocument();
    expect(screen.getByText("标签2")).toBeInTheDocument();
    expect(screen.getByText("标签3")).toBeInTheDocument();

    // 验证操作按钮
    expect(screen.getByTitle("NEW_SESSION")).toBeInTheDocument();
    expect(screen.getByTitle("HISTORY_SESSIONS")).toBeInTheDocument();
  });

  test("应该在点击按钮时调用相应的回调", () => {
    render(
      <Tabs
        tabs={mockTabs}
        activeTabId="tab-1"
        onTabClick={mockOnTabClick}
        onTabClose={mockOnTabClose}
        onAddSession={mockOnAddSession}
        onHistoryClick={mockOnHistoryClick}
      />
    );

    // 测试添加按钮
    const addButton = screen.getByTitle("NEW_SESSION");
    fireEvent.click(addButton);
    expect(mockOnAddSession).toHaveBeenCalled();

    // 测试历史按钮
    const historyButton = screen.getByTitle("HISTORY_SESSIONS");
    fireEvent.click(historyButton);
    expect(mockOnHistoryClick).toHaveBeenCalled();
  });
});
