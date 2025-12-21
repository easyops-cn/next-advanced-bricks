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
    return ({ children, onClick, ...props }: any) => (
      <div data-testid={`wrapped-${tagName}`} onClick={onClick} {...props}>
        {children}
      </div>
    );
  }),
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoSpaceApi_getSpaceSchema: jest.fn(() =>
    Promise.resolve({ businessObjects: [], businessFlows: [] })
  ),
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("./SpaceConfigModal/SpaceConfigModal", () => ({
  SpaceConfigModal: () => (
    <div data-testid="space-config-modal">SpaceConfigModal</div>
  ),
}));

import { SpaceNav } from "./SpaceNav";

describe("SpaceNav", () => {
  const mockSpaceDetail = {
    name: "测试空间",
    instanceId: "test-space-123",
    description: "这是一个测试空间",
  };

  const defaultProps = {
    spaceDetail: mockSpaceDetail,
    notices: [],
    notifyCenterUrl: "/notify-center",
    onBack: jest.fn(),
    onMembersClick: jest.fn(),
    onMarkAllRead: jest.fn(),
    onNoticeClick: jest.fn(),
  };

  test("应该正确渲染空间名称", () => {
    render(<SpaceNav {...defaultProps} />);
    expect(screen.getByText("测试空间")).toBeInTheDocument();
  });

  test("应该渲染配置模态框", () => {
    render(<SpaceNav {...defaultProps} />);
    expect(screen.getByTestId("space-config-modal")).toBeInTheDocument();
  });
});
