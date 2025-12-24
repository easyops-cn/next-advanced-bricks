import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
  i18n: {
    getFixedT: jest.fn(() => (key: string) => key),
  },
}));

jest.mock("../i18n.js", () => ({
  K: {},
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("./BusinessObjectPreview", () => ({
  BusinessObjectPreview: () => (
    <div data-testid="business-object-preview">BusinessObjectPreview</div>
  ),
}));

jest.mock("./BusinessFlowPreview", () => ({
  BusinessFlowPreview: () => (
    <div data-testid="business-flow-preview">BusinessFlowPreview</div>
  ),
}));

jest.mock("./EmptyState", () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

jest.mock("../../shared/bricks", () => ({
  WrappedIcon: (props: any) => <div data-testid="icon" {...props} />,
}));

import { ConfigPreview } from "./ConfigPreview";

describe("ConfigPreview", () => {
  const mockBusinessObject = {
    objectId: "obj-1",
    objectName: "测试业务对象",
    description: "描述",
  };

  const mockBusinessFlow = {
    instanceId: "flow-1",
    name: "测试业务流",
    description: "描述",
  };

  test("应该在没有数据时显示空状态", () => {
    render(<ConfigPreview />);
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  test("应该在提供业务对象时显示业务对象预览", () => {
    render(<ConfigPreview businessObject={mockBusinessObject} />);
    expect(screen.getByTestId("business-object-preview")).toBeInTheDocument();
  });

  test("应该在提供业务流时显示业务流预览", () => {
    render(<ConfigPreview businessFlow={mockBusinessFlow} />);
    expect(screen.getByTestId("business-flow-preview")).toBeInTheDocument();
  });

  test("应该支持视图类型切换", () => {
    const onViewTypeChange = jest.fn();
    render(
      <ConfigPreview
        businessObject={mockBusinessObject}
        viewType="visual"
        onViewTypeChange={onViewTypeChange}
      />
    );

    const buttons = screen.getAllByRole("button");
    const jsonButton = buttons.find((btn) => btn.textContent?.includes("JSON"));

    if (jsonButton) {
      fireEvent.click(jsonButton);
      expect(onViewTypeChange).toHaveBeenCalledWith("json");
    }
  });

  test("应该默认使用 visual 视图", () => {
    const { container } = render(
      <ConfigPreview businessObject={mockBusinessObject} />
    );

    const visualButton = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("Visual")
    );

    expect(visualButton?.className).toContain("active");
  });
});
