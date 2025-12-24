import React from "react";
import { describe, test, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ActivityCard } from "./ActivityCard";

describe("ActivityCard", () => {
  test("应该正确渲染基本属性", () => {
    render(
      <ActivityCard title="测试活动" description="这是一个测试活动的描述" />
    );

    expect(screen.getByText("测试活动")).toBeInTheDocument();
    expect(screen.getByText("这是一个测试活动的描述")).toBeInTheDocument();
  });

  test("应该在有 assignee 时显示负责人", () => {
    render(
      <ActivityCard title="测试活动" description="描述" assignee="张三" />
    );

    expect(screen.getByText("张三")).toBeInTheDocument();
  });

  test("应该在 active 为 true 时应用激活样式", () => {
    const { container } = render(
      <ActivityCard title="测试活动" description="描述" active={true} />
    );

    const card = container.querySelector('[class*="activityCard"]');
    expect(card?.className).toContain("activityCardActive");
  });

  test("应该在没有 assignee 时不显示负责人区域", () => {
    const { container } = render(
      <ActivityCard title="测试活动" description="描述" />
    );

    const assignee = container.querySelector('[class*="activityAssignee"]');
    expect(assignee).not.toBeInTheDocument();
  });
});
