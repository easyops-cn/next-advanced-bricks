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

jest.mock("./ConfigPreview", () => ({
  ConfigPreview: () => <div data-testid="config-preview">ConfigPreview</div>,
}));

jest.mock("./EmptyState", () => ({
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

import { BusinessManage } from "./BusinessManage";

describe("BusinessManage", () => {
  const mockConfigSchema = {
    businessObjects: [
      {
        objectId: "obj-1",
        objectName: "业务对象1",
        description: "业务对象1的描述",
      },
      {
        objectId: "obj-2",
        objectName: "业务对象2",
        description: "业务对象2的描述",
      },
    ],
    businessFlows: [
      {
        instanceId: "flow-1",
        name: "业务流1",
        description: "业务流1的描述",
      },
    ],
    objectRelations: [],
  };

  test("应该默认显示业务对象标签页", () => {
    render(<BusinessManage configSchema={mockConfigSchema} />);
    expect(screen.getByText("业务对象1")).toBeInTheDocument();
  });

  test("应该在点击业务流标签页时切换", () => {
    render(<BusinessManage configSchema={mockConfigSchema} />);

    const tabs = screen.getAllByRole("button");
    const flowTab = tabs.find((tab) => tab.textContent?.includes("业务流"));

    if (flowTab) {
      fireEvent.click(flowTab);
      expect(screen.getByText("业务流1")).toBeInTheDocument();
    }
  });

  test("应该在列表为空时显示空状态", () => {
    const emptySchema = {
      businessObjects: [],
      businessFlows: [],
      objectRelations: [],
    };
    render(<BusinessManage configSchema={emptySchema} />);

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  test("应该在点击列表项时选中", () => {
    const { container } = render(
      <BusinessManage configSchema={mockConfigSchema} />
    );

    const cards = container.querySelectorAll('[class*="cardItem"]');
    expect(cards.length).toBeGreaterThan(0);

    if (cards[0]) {
      fireEvent.click(cards[0]);
      expect(cards[0].className).toContain("active");
    }
  });
});
