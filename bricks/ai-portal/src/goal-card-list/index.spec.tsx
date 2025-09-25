import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import "./";
import type { GoalCardList } from "./index.js";
import type { GoalItem, GoalState } from "./CardItem/CardItem.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.goal-card-list", () => {
  const mockGoalList: GoalItem[] = [
    {
      instanceId: "goal-1",
      title: "Goal 1",
      description: "Description 1",
      state: "ready",
      id: 1,
      level: 0,
    },
    {
      instanceId: "goal-2",
      title: "Goal 2",
      description: "Description 2",
      state: "working",
      id: 2,
      level: 0,
    },
  ];

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
    element.goalList = mockGoalList;
    const clickHandler = jest.fn();

    element.addEventListener("item.click", clickHandler);

    act(() => {
      document.body.appendChild(element);
    });

    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".goal-item")!);
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
    element.goalList = mockGoalList;
    const titleChangeHandler = jest.fn();

    element.addEventListener("item.title.change", titleChangeHandler);

    act(() => {
      document.body.appendChild(element);
    });

    const newTitle = "Updated Goal Title";
    act(() => {
      fireEvent.focus(element.shadowRoot!.querySelector(".title")!);
    });

    element.shadowRoot!.querySelector(".title")!.textContent = newTitle;

    act(() => {
      fireEvent.blur(element.shadowRoot!.querySelector(".title")!);
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

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit item.status.change event and update internal state", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;
    element.goalList = mockGoalList;
    const statusChangeHandler = jest.fn();

    element.addEventListener("item.status.change", statusChangeHandler);

    act(() => {
      document.body.appendChild(element);
    });

    // 模拟点击第一个 GoalCardItem 的状态下拉菜单并选择新状态
    const newStatus: GoalState = "completed";
    act(() => {
      fireEvent(
        element.shadowRoot!.querySelector("eo-dropdown-actions")!,
        new CustomEvent("action.click", {
          detail: { key: newStatus },
        })
      );
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
    expect(
      element
        .shadowRoot!.querySelector(".goal-item")
        ?.classList.contains("completed")
    ).toBe(true);

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

  test("should handle append child goal and revoke", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;
    element.goalList = mockGoalList;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot!.querySelectorAll(".goal-item").length).toBe(2);

    // Append child to the first goal
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".append-child")!);
    });
    expect(element.shadowRoot!.querySelectorAll(".goal-item").length).toBe(3);
    expect(element.shadowRoot!.activeElement?.classList.contains("title")).toBe(
      true
    );

    // Revoke by blurring without entering title
    act(() => {
      fireEvent.blur(element.shadowRoot!.activeElement!);
    });
    expect(element.shadowRoot!.querySelectorAll(".goal-item").length).toBe(2);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle append child goal and done", async () => {
    const element = document.createElement(
      "ai-portal.goal-card-list"
    ) as GoalCardList;
    element.goalList = mockGoalList;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot!.querySelectorAll(".goal-item").length).toBe(2);

    // Append child to the first goal
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".append-child")!);
    });
    expect(element.shadowRoot!.querySelectorAll(".goal-item").length).toBe(3);
    expect(element.shadowRoot!.activeElement?.classList.contains("title")).toBe(
      true
    );
    expect(
      element
        .shadowRoot!.querySelectorAll(".goal-item")[1]
        .querySelector(".serial-number")?.textContent
    ).toBe("#");

    element.shadowRoot!.activeElement!.textContent = "New Child Goal";

    act(() => {
      fireEvent.blur(element.shadowRoot!.activeElement!);
    });

    act(() => {
      element.appendChildDone("test-pending-id", {
        instanceId: "goal-1-1",
        title: "New Child Goal",
        description: "",
        state: "ready",
        id: 3,
        level: 1,
      });
    });
    expect(element.shadowRoot!.querySelectorAll(".goal-item").length).toBe(3);
    expect(
      element
        .shadowRoot!.querySelectorAll(".goal-item")[1]
        .querySelector(".serial-number")?.textContent
    ).toBe("#3");

    act(() => {
      document.body.removeChild(element);
    });
  });
});
