import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { GoalCardList } from "./index.js";
import type { GoalItem, GoalState } from "./CardItem/CardItem.js";

jest.mock("@next-core/theme", () => ({}));

// Mock GoalCardItem 组件以便测试事件处理
const mockGoalCardItem = jest.fn();
jest.mock("./CardItem/CardItem.js", () => ({
  GoalCardItem: (props: any) => {
    mockGoalCardItem(props);
    return null;
  },
}));

describe("ai-portal.goal-card-list", () => {
  const mockGoalList: GoalItem[] = [
    {
      instanceId: "goal-1",
      title: "Goal 1",
      description: "Description 1",
      state: "ready",
      id: 1,
    },
    {
      instanceId: "goal-2",
      title: "Goal 2",
      description: "Description 2",
      state: "working",
      id: 2,
    },
  ];

  beforeEach(() => {
    mockGoalCardItem.mockClear();
  });

  test("basic usage - should render and cleanup properly", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("should emit item.click event when GoalCardItem onClick is triggered", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;
    const clickHandler = jest.fn();

    element.addEventListener("item.click", clickHandler);

    act(() => {
      element.goalList = mockGoalList;
      document.body.appendChild(element);
    });

    // 获取传递给第一个 GoalCardItem 的 onClick 函数
    const firstItemProps = mockGoalCardItem.mock.calls[0][0] as any;
    const onClickHandler = firstItemProps.onClick;

    // 模拟点击事件
    act(() => {
      onClickHandler();
    });

    expect(clickHandler).toHaveBeenCalledTimes(1);
    expect(clickHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: mockGoalList[0],
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit item.title.change event and update internal state", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;
    const titleChangeHandler = jest.fn();

    element.addEventListener("item.title.change", titleChangeHandler);

    act(() => {
      element.goalList = [...mockGoalList]; // 使用副本以测试状态更新
      document.body.appendChild(element);
    });

    // 获取传递给第一个 GoalCardItem 的 onTitleChange 函数
    const firstItemProps = mockGoalCardItem.mock.calls[0][0] as any;
    const onTitleChangeHandler = firstItemProps.onTitleChange;

    // 模拟标题变更
    const newTitle = "Updated Goal Title";
    act(() => {
      onTitleChangeHandler(newTitle);
    });

    // 验证事件被触发
    expect(titleChangeHandler).toHaveBeenCalledTimes(1);
    expect(titleChangeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          ...mockGoalList[0],
          title: newTitle,
        }),
      })
    );

    await (global as any).flushPromises();

    // 验证组件被重新调用，并且第一个 GoalCardItem 的数据已更新
    const updatedCalls = mockGoalCardItem.mock.calls;
    const hasUpdatedTitle = updatedCalls.some(
      (call: any) =>
        call[0].goalItem.instanceId === "goal-1" &&
        call[0].goalItem.title === newTitle
    );
    expect(hasUpdatedTitle).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit item.status.change event and update internal state", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;
    const statusChangeHandler = jest.fn();

    element.addEventListener("item.status.change", statusChangeHandler);

    act(() => {
      element.goalList = [...mockGoalList]; // 使用副本以测试状态更新
      document.body.appendChild(element);
    });

    // 获取传递给第一个 GoalCardItem 的 onStatusChange 函数
    const firstItemProps = mockGoalCardItem.mock.calls[0][0] as any;
    const onStatusChangeHandler = firstItemProps.onStatusChange;

    // 模拟状态变更
    const newStatus: GoalState = "completed";
    act(() => {
      onStatusChangeHandler(newStatus);
    });

    // 验证事件被触发
    expect(statusChangeHandler).toHaveBeenCalledTimes(1);
    expect(statusChangeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          ...mockGoalList[0],
          state: newStatus,
        }),
      })
    );

    // 状态更新应该自动触发重新渲染，验证更新后的数据
    // 等待 React 状态更新完成
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // 验证组件被重新调用，并且第一个 GoalCardItem 的状态已更新
    const updatedCalls = mockGoalCardItem.mock.calls;
    const hasUpdatedStatus = updatedCalls.some(
      (call: any) =>
        call[0].goalItem.instanceId === "goal-1" &&
        call[0].goalItem.state === newStatus
    );
    expect(hasUpdatedStatus).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render loading state when goalList is undefined", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;

    act(() => {
      document.body.appendChild(element);
    });

    const loadingElement = element.shadowRoot?.querySelector(".loading");
    expect(loadingElement).toBeTruthy();

    const goalContainer = element.shadowRoot?.querySelector(".goal-container");
    expect(goalContainer).toBeFalsy();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
