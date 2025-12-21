import React from "react";
import { describe, test, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  test("应该渲染默认图标和标题", () => {
    render(<EmptyState title="暂无数据" />);

    expect(screen.getByText("暂无数据")).toBeInTheDocument();
  });

  test("应该在提供 description 时显示描述", () => {
    render(<EmptyState title="暂无数据" description="请添加一些内容" />);

    expect(screen.getByText("暂无数据")).toBeInTheDocument();
    expect(screen.getByText("请添加一些内容")).toBeInTheDocument();
  });

  test("应该在没有 description 时不显示描述区域", () => {
    const { container } = render(<EmptyState title="暂无数据" />);

    const description = container.querySelector(
      '[class*="emptyStateDescription"]'
    );
    expect(description).not.toBeInTheDocument();
  });

  test("应该支持自定义图标", () => {
    const CustomIcon = () => <div data-testid="custom-icon">自定义图标</div>;
    render(<EmptyState icon={<CustomIcon />} title="暂无数据" />);

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByText("自定义图标")).toBeInTheDocument();
  });
});
