import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoSpaceApi_generateSpaceCapabilities: jest.fn(() =>
    Promise.resolve({
      manageInstancesCapability: "管理实例能力描述",
      initiateFlowCapability: "发起流程能力描述",
      searchKnowledgeCapability: "搜索知识能力描述",
    })
  ),
}));

import { SpaceGuide } from "./SpaceGuide";

describe("SpaceGuide", () => {
  const mockSpaceDetail = {
    name: "测试空间",
    instanceId: "test-space-123",
    description: "这是一个测试空间的描述",
  };

  test("应该正确渲染空间名称和描述", async () => {
    render(<SpaceGuide spaceDetail={mockSpaceDetail} />);

    await waitFor(() => {
      expect(screen.getAllByText("测试空间")[0]).toBeInTheDocument();
    });
    expect(screen.getByText("这是一个测试空间的描述")).toBeInTheDocument();
  });

  test("应该渲染三个指导卡片", async () => {
    const { container } = render(<SpaceGuide spaceDetail={mockSpaceDetail} />);

    await waitFor(() => {
      const cards = container.querySelectorAll(".guide-card");
      expect(cards.length).toBe(3);
    });
  });

  test("应该在点击卡片时调用 onCardClick", async () => {
    const onCardClick = jest.fn();
    const { container } = render(
      <SpaceGuide spaceDetail={mockSpaceDetail} onCardClick={onCardClick} />
    );

    await waitFor(() => {
      const cards = container.querySelectorAll(".guide-card");
      if (cards.length > 0) {
        fireEvent.click(cards[0]);
        expect(onCardClick).toHaveBeenCalledWith(0);
      }
    });
  });

  test("应该在组件挂载时获取空间能力", async () => {
    const { ElevoSpaceApi_generateSpaceCapabilities } = await import(
      "@next-api-sdk/llm-sdk"
    );

    render(<SpaceGuide spaceDetail={mockSpaceDetail} />);

    await waitFor(() => {
      expect(ElevoSpaceApi_generateSpaceCapabilities).toHaveBeenCalledWith(
        "test-space-123",
        {
          forceRefresh: false,
        },
        {
          interceptorParams: {
            ignoreLoadingBar: true,
          },
        }
      );
    });
  });
});
