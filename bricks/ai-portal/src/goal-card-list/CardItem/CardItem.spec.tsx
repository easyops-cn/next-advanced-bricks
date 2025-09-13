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
      onValueChange,
      onBlur,
      className,
      value,
      ..._props
    }: any) => {
      const handleClick = (e: any) => {
        // 模拟下拉菜单状态变更
        if (tagName === "eo-dropdown-actions" && onActionClick) {
          onActionClick({ detail: { key: "completed" } });
        }
        onClick?.(e);
      };

      // 输入框组件
      if (tagName === "eo-input") {
        return (
          <input
            data-testid={`mock-${tagName}`}
            className={className}
            value={value}
            onChange={(e) => onValueChange?.({ detail: e.target.value })}
            onBlur={onBlur}
            onClick={onClick}
          />
        );
      }

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

describe("GoalCardItem", () => {
  const mockGoalItem: GoalItem = {
    instanceId: "test-goal-1",
    title: "Test Goal",
    description: "Test Description",
    state: "ready",
    index: 1,
    conversations: ["conv1", "conv2"],
    leader: {
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
    expect(container.querySelector(".text")).toHaveTextContent("Test Goal");
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

  test("should handle title editing on hover and input change", async () => {
    const onTitleChange = jest.fn();
    const { container } = render(
      <GoalCardItem {...defaultProps} onTitleChange={onTitleChange} />
    );

    const titleElement = container.querySelector(".title") as HTMLElement;
    const inputElement = container.querySelector("input") as HTMLInputElement;

    // 模拟鼠标悬停显示输入框
    fireEvent.mouseEnter(titleElement);

    // 验证输入框显示状态
    expect(container.querySelector(".input.show")).toBeInTheDocument();
    expect(container.querySelector(".text.show")).not.toBeInTheDocument();

    // 模拟输入变更
    fireEvent.change(inputElement, { target: { value: "New Title" } });

    // 模拟失焦确认变更
    await act(async () => {
      fireEvent.blur(inputElement);
    });

    expect(onTitleChange).toHaveBeenCalledWith("New Title");
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

  test("should handle mouse interactions and lock mechanism", () => {
    const { container } = render(<GoalCardItem {...defaultProps} />);

    const titleElement = container.querySelector(".title") as HTMLElement;
    const inputElement = container.querySelector("input") as HTMLInputElement;

    // 模拟鼠标进入
    fireEvent.mouseEnter(titleElement);
    expect(container.querySelector(".input.show")).toBeInTheDocument();

    // 模拟输入变更（会触发锁定）
    fireEvent.change(inputElement, { target: { value: "Editing..." } });

    // 模拟鼠标离开（由于锁定，hover 状态应该保持）
    fireEvent.mouseLeave(titleElement);
    expect(container.querySelector(".input.show")).toBeInTheDocument();

    // 模拟失焦（解除锁定并隐藏输入框）
    act(() => {
      fireEvent.blur(inputElement);
    });
    expect(container.querySelector(".input.show")).not.toBeInTheDocument();
  });
});
