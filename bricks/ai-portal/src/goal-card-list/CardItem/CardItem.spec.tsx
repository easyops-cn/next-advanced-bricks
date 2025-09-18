import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { GoalCardItem, type GoalItem } from "./CardItem.js";

// Mock wrapped components
jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    const MockComponent = ({
      children,
      onClick,
      onActionClick,
      className,
      ..._props
    }: any) => {
      const handleClick = (e: any) => {
        // 模拟下拉菜单状态变更
        if (tagName === "eo-dropdown-actions" && onActionClick) {
          onActionClick({ detail: { key: "completed" } });
        }
        onClick?.(e);
      };

      // 其他组件
      return (
        <div
          data-testid={`mock-${tagName}`}
          className={className}
          onClick={handleClick}
        >
          {children}
        </div>
      );
    };
    MockComponent.displayName = `Mock${tagName}`;
    return MockComponent;
  }),
}));

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
}));

jest.mock("../i18n.js", () => ({
  K: {
    UN_START_STATUS: "UN_START_STATUS",
    RUNNING_STATUS: "RUNNING_STATUS",
    COMPLETED_STATUS: "COMPLETED_STATUS",
  },
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("../../shared/getContentEditable.js", () => ({
  getContentEditable: jest.fn((editable: boolean) =>
    editable ? "plaintext-only" : "false"
  ),
}));

describe("GoalCardItem", () => {
  const mockGoalItem: GoalItem = {
    instanceId: "test-goal-1",
    title: "Test Goal",
    description: "Test Description",
    state: "ready",
    index: 1,
    conversations: 2,
    owner: {
      instanceId: "leader-1",
    },
  };

  const defaultProps = {
    goalItem: mockGoalItem,
  };

  test("should render goal card item with basic information", () => {
    const { container } = render(<GoalCardItem {...defaultProps} />);

    // 验证基本结构渲染
    expect(container.querySelector(".goal-item")).toBeInTheDocument();
    expect(container.querySelector(".goal-item.ready")).toBeInTheDocument();
    expect(container.querySelector(".serial-number")).toHaveTextContent("1");
    expect(container.querySelector(".title")).toHaveTextContent("Test Goal");
    expect(container.querySelector(".count")).toHaveTextContent("2");
  });

  test("should handle status change through dropdown actions", () => {
    const onStatusChange = jest.fn();
    render(<GoalCardItem {...defaultProps} onStatusChange={onStatusChange} />);

    // 模拟点击下拉菜单触发状态变更
    const dropdownActions = screen.getByTestId("mock-eo-dropdown-actions");
    fireEvent.click(dropdownActions);

    expect(onStatusChange).toHaveBeenCalledWith("completed");
  });

  test("should handle title editing with contentEditable", async () => {
    const onTitleChange = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onTitleChange={onTitleChange} />
    );

    const titleElement = container.querySelector(".title") as HTMLElement;

    // 验证 contentEditable 属性
    expect(titleElement).toHaveAttribute("contenteditable", "plaintext-only");

    // 模拟编辑内容
    titleElement.textContent = "New Title";

    // 模拟失焦确认变更
    await act(async () => {
      fireEvent.blur(titleElement);
    });

    expect(onTitleChange).toHaveBeenCalledWith("New Title");
  });

  test("should not call onTitleChange when title is unchanged", async () => {
    const onTitleChange = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onTitleChange={onTitleChange} />
    );

    const titleElement = container.querySelector(".title") as HTMLElement;

    // 模拟失焦但没有改变内容
    await act(async () => {
      fireEvent.blur(titleElement);
    });

    expect(onTitleChange).not.toHaveBeenCalled();
  });

  test("should handle card click event", () => {
    const onClick = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onClick={onClick} />
    );

    const goalItem = container.querySelector(".goal-item") as HTMLElement;
    fireEvent.click(goalItem);

    expect(onClick).toHaveBeenCalled();
  });

  test("should prevent event propagation on title click", () => {
    const onClick = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onClick={onClick} />
    );

    const titleElement = container.querySelector(".title") as HTMLElement;

    // 模拟点击事件
    fireEvent.click(titleElement);

    // 卡片点击事件不应该被触发，因为 title 元素阻止了事件传播
    expect(onClick).not.toHaveBeenCalled();
  });

  test("should handle empty title content", async () => {
    const onTitleChange = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onTitleChange={onTitleChange} />
    );

    const titleElement = container.querySelector(".title") as HTMLElement;

    // 清空内容
    titleElement.textContent = "";

    // 模拟失焦
    await act(async () => {
      fireEvent.blur(titleElement);
    });

    // 空内容也应该触发 onTitleChange，否则界面显示（空）和实际数据（值未变）不一致
    expect(onTitleChange).toHaveBeenCalledWith("");
  });

  test("should handle composition", async () => {
    const onTitleChange = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onTitleChange={onTitleChange} />
    );

    const titleElement = container.querySelector(".title") as HTMLElement;

    titleElement.textContent = "Edited";

    // Start composition
    fireEvent.compositionStart(titleElement);

    // Should ignore Enter during composition
    await act(async () => {
      fireEvent.keyDown(titleElement, { key: "Enter" });
    });
    expect(onTitleChange).not.toHaveBeenCalled();

    // End composition
    fireEvent.compositionEnd(titleElement);

    // Should now respond to Enter
    await act(async () => {
      fireEvent.keyDown(titleElement, { key: "Enter" });
      // Call blur() in keydown handler is not triggered in test environment.
      // So we manually call it.
      fireEvent.blur(titleElement);
    });
    expect(onTitleChange).toHaveBeenCalledWith("Edited");
  });
});
