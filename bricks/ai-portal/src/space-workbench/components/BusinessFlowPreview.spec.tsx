import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
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

jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    // eslint-disable-next-line react/display-name
    return (props: any) => (
      <div data-testid={`wrapped-${tagName}`} {...props} />
    );
  }),
}));

jest.mock("../../shared/bricks", () => ({
  WrappedIcon: (props: any) => <div data-testid="icon" {...props} />,
}));

jest.mock("./ActivityCard", () => ({
  ActivityCard: ({ title, onClick }: any) => (
    <div data-testid="activity-card" onClick={onClick}>
      {title}
    </div>
  ),
}));

jest.mock("./ActivityDetailModal", () => ({
  ActivityDetailModal: ({ activity, visible }: any) =>
    visible && activity ? (
      <div data-testid="activity-modal">{activity.name}</div>
    ) : null,
}));

jest.mock("./SpaceConfigModal/ConfigContext", () => {
  const { createContext } = require("react");
  return {
    ConfigContext: createContext({ modifyActivity: jest.fn() }),
  };
});

import { BusinessFlowPreview } from "./BusinessFlowPreview";

describe("BusinessFlowPreview", () => {
  const mockData = {
    instanceId: "flow-1",
    name: "用户注册流程",
    description: "用户注册的完整流程",
    prerequisite: "用户需要提供邮箱",
    spec: [
      {
        name: "阶段1",
        serviceFlowActivities: [
          {
            id: "act-1",
            name: "验证邮箱",
            description: "验证用户邮箱",
            aiEmployeeId: "ai-1",
          },
        ],
      },
    ],
  };

  test("应该在没有数据时返回 null", () => {
    const { container } = render(<BusinessFlowPreview />);
    expect(container.firstChild).toBeNull();
  });

  test("应该在 visual 模式下正确渲染业务流", () => {
    render(<BusinessFlowPreview data={mockData} viewType="visual" />);

    expect(screen.getByText("用户注册流程")).toBeInTheDocument();
    expect(screen.getByText("用户注册的完整流程")).toBeInTheDocument();
  });

  test("应该在 json 模式下渲染 JSON 视图", () => {
    const { container } = render(
      <BusinessFlowPreview data={mockData} viewType="json" />
    );

    const preElement = container.querySelector("pre");
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain('"name": "用户注册流程"');
  });

  test("应该渲染活动卡片", () => {
    render(<BusinessFlowPreview data={mockData} viewType="visual" />);
    expect(screen.getByTestId("activity-card")).toBeInTheDocument();
  });
});
