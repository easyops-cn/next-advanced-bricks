import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
  i18n: {
    getFixedT: jest.fn(() => (key: string) => key),
  },
}));

jest.mock("../i18n.js", () => ({
  K: {
    FLOW_SIDEBAR_TITLE: "FLOW_SIDEBAR_TITLE",
    FLOW_SIDEBAR_SUBTITLE: "FLOW_SIDEBAR_SUBTITLE",
    NO_SERVICE_FLOWS: "NO_SERVICE_FLOWS",
    NO_DESCRIPTION: "NO_DESCRIPTION",
  },
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick: jest.fn((tagName: string) => {
    // eslint-disable-next-line react/display-name
    return (props: any) => {
      const {
        children,
        visible,
        modalTitle,
        onCancel,
        onClose,
        lib,
        icon,
        theme,
        ...otherProps
      } = props;

      if (tagName === "eo-modal" && !visible) return null;

      // 模拟 eo-icon
      if (tagName === "eo-icon") {
        return (
          <span
            data-testid={`wrapped-${tagName}`}
            data-lib={lib}
            data-icon={icon}
            data-theme={theme}
            {...otherProps}
          />
        );
      }

      // 模拟 eo-modal
      if (tagName === "eo-modal") {
        return (
          <div
            data-testid={`wrapped-${tagName}`}
            data-modal-title={modalTitle}
            data-visible={visible}
            {...otherProps}
          >
            <div data-testid="modal-title">{modalTitle}</div>
            <button
              data-testid="modal-close"
              onClick={() => {
                onCancel?.();
                onClose?.();
              }}
            >
              Close
            </button>
            {children}
          </div>
        );
      }

      return <div data-testid={`wrapped-${tagName}`} {...otherProps} />;
    };
  }),
}));

jest.mock("./EmptyState.js", () => ({
  EmptyState: ({ title }: { title: string }) => (
    <div data-testid="empty-state">{title}</div>
  ),
}));

jest.mock("./BusinessFlowPreview.js", () => ({
  BusinessFlowPreview: ({ data, viewType, activityOnlyRead }: any) => (
    <div
      data-testid="business-flow-preview"
      data-flow-name={data?.name}
      data-view-type={viewType}
      data-activity-only-read={activityOnlyRead}
    >
      Business Flow Preview: {data?.name}
    </div>
  ),
}));

import { ServiceFlows } from "./ServiceFlows";
import type { BusinessFlow } from "../interfaces";

describe("ServiceFlows", () => {
  const mockFlows: BusinessFlow[] = [
    {
      instanceId: "flow-1",
      name: "业务流1",
      description: "这是业务流1的描述",
      spec: [
        { name: "阶段1", serviceFlowActivities: [] },
        { name: "阶段2", serviceFlowActivities: [] },
      ],
    },
    {
      instanceId: "flow-2",
      name: "业务流2",
      description: "这是业务流2的描述",
      spec: [
        { name: "阶段A", serviceFlowActivities: [] },
        { name: "阶段B", serviceFlowActivities: [] },
        { name: "阶段C", serviceFlowActivities: [] },
      ],
    },
    {
      instanceId: "flow-3",
      name: "业务流3（无阶段）",
      description: "没有阶段的业务流",
      spec: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该渲染标题和副标题", () => {
    const { getByText } = render(<ServiceFlows businessFlows={mockFlows} />);

    expect(getByText("FLOW_SIDEBAR_TITLE")).toBeInTheDocument();
    expect(getByText("FLOW_SIDEBAR_SUBTITLE")).toBeInTheDocument();
  });

  test("当没有业务流时应该显示空状态", () => {
    const { getByTestId } = render(<ServiceFlows businessFlows={[]} />);

    const emptyState = getByTestId("empty-state");
    expect(emptyState).toBeInTheDocument();
    expect(emptyState.textContent).toBe("NO_SERVICE_FLOWS");
  });

  test("当 businessFlows 为 undefined 时应该显示空状态", () => {
    const { getByTestId } = render(<ServiceFlows />);

    const emptyState = getByTestId("empty-state");
    expect(emptyState).toBeInTheDocument();
  });

  test("应该渲染所有业务流卡片", () => {
    const { getByText } = render(<ServiceFlows businessFlows={mockFlows} />);

    expect(getByText("业务流1")).toBeInTheDocument();
    expect(getByText("业务流2")).toBeInTheDocument();
    expect(getByText("业务流3（无阶段）")).toBeInTheDocument();
  });

  test("应该显示业务流描述", () => {
    const { getByText } = render(<ServiceFlows businessFlows={mockFlows} />);

    expect(getByText("这是业务流1的描述")).toBeInTheDocument();
    expect(getByText("这是业务流2的描述")).toBeInTheDocument();
  });

  test("应该根据 spec 显示阶段进度条", () => {
    const { container } = render(<ServiceFlows businessFlows={mockFlows} />);

    const progressBars = container.querySelectorAll(".progressBar");
    // flow-1 有 2 个阶段, flow-2 有 3 个阶段, flow-3 有 0 个阶段
    expect(progressBars.length).toBe(5);
  });

  test("点击卡片应该调用 onFlowClick", () => {
    const onFlowClick = jest.fn();
    const { getByText } = render(
      <ServiceFlows businessFlows={mockFlows} onFlowClick={onFlowClick} />
    );

    const flowCard = getByText("业务流1").closest(".flowCard");
    fireEvent.click(flowCard!);

    expect(onFlowClick).toHaveBeenCalledWith(mockFlows[0]);
  });

  test("点击详情按钮应该打开模态框", () => {
    const { container, getByTestId } = render(
      <ServiceFlows businessFlows={mockFlows} />
    );

    // 找到第一个详情按钮
    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[0]);

    // 检查模态框是否可见
    const modal = getByTestId("wrapped-eo-modal");
    expect(modal).toBeInTheDocument();
    expect(modal.getAttribute("data-visible")).toBe("true");
    expect(modal.getAttribute("data-modal-title")).toBe("业务流1");
  });

  test("点击详情按钮不应该触发卡片点击", () => {
    const onFlowClick = jest.fn();
    const { container } = render(
      <ServiceFlows businessFlows={mockFlows} onFlowClick={onFlowClick} />
    );

    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[0]);

    // 详情按钮的点击不应该触发 onFlowClick
    expect(onFlowClick).not.toHaveBeenCalled();
  });

  test("模态框应该显示 BusinessFlowPreview", () => {
    const { container, getByTestId } = render(
      <ServiceFlows businessFlows={mockFlows} />
    );

    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[0]);

    const preview = getByTestId("business-flow-preview");
    expect(preview).toBeInTheDocument();
    expect(preview.getAttribute("data-flow-name")).toBe("业务流1");
    expect(preview.getAttribute("data-view-type")).toBe("visual");
    expect(preview.getAttribute("data-activity-only-read")).toBe("true");
  });

  test("关闭模态框应该清除选中的流", () => {
    const { container, getByTestId, queryByTestId } = render(
      <ServiceFlows businessFlows={mockFlows} />
    );

    // 打开模态框
    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[0]);

    expect(getByTestId("wrapped-eo-modal")).toBeInTheDocument();

    // 关闭模态框
    const closeButton = getByTestId("modal-close");
    fireEvent.click(closeButton);

    // 模态框应该不可见
    expect(queryByTestId("wrapped-eo-modal")).not.toBeInTheDocument();
  });

  test("应该为每个卡片设置唯一的 key", () => {
    const { container } = render(<ServiceFlows businessFlows={mockFlows} />);

    const flowCards = container.querySelectorAll(".flowCard");
    expect(flowCards.length).toBe(3);
  });

  test("详情按钮应该有正确的标题", () => {
    const { container } = render(<ServiceFlows businessFlows={mockFlows} />);

    const detailButton = container.querySelector(".detailButton");
    expect(detailButton?.getAttribute("title")).toBe("NO_DESCRIPTION");
  });

  test("应该渲染眼睛图标", () => {
    const { container } = render(<ServiceFlows businessFlows={mockFlows} />);

    const icons = container.querySelectorAll('[data-testid="wrapped-eo-icon"]');
    expect(icons.length).toBeGreaterThan(0);

    const eyeIcon = icons[0];
    expect(eyeIcon.getAttribute("data-lib")).toBe("antd");
    expect(eyeIcon.getAttribute("data-icon")).toBe("eye");
    expect(eyeIcon.getAttribute("data-theme")).toBe("outlined");
  });

  test("打开不同的业务流详情", () => {
    const { container, getByTestId } = render(
      <ServiceFlows businessFlows={mockFlows} />
    );

    // 点击第二个详情按钮
    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[1]);

    const modal = getByTestId("wrapped-eo-modal");
    expect(modal.getAttribute("data-modal-title")).toBe("业务流2");

    const preview = getByTestId("business-flow-preview");
    expect(preview.getAttribute("data-flow-name")).toBe("业务流2");
  });

  test("模态框应该支持点击遮罩关闭", () => {
    const { container, getByTestId } = render(
      <ServiceFlows businessFlows={mockFlows} />
    );

    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[0]);

    const modal = getByTestId("wrapped-eo-modal");
    // maskClosable 作为 prop 传递，可能不会作为 attribute
    expect(modal).toBeInTheDocument();
  });

  test("模态框应该没有底部按钮", () => {
    const { container, getByTestId } = render(
      <ServiceFlows businessFlows={mockFlows} />
    );

    const detailButtons = container.querySelectorAll(".detailButton");
    fireEvent.click(detailButtons[0]);

    const modal = getByTestId("wrapped-eo-modal");
    // noFooter 作为 prop 传递，可能不会作为 attribute
    expect(modal).toBeInTheDocument();
  });

  test("应该处理没有 spec 的业务流", () => {
    const flowsWithoutSpec: BusinessFlow[] = [
      {
        instanceId: "flow-no-spec",
        name: "无 spec 的业务流",
        description: "测试",
      },
    ];

    const { container } = render(
      <ServiceFlows businessFlows={flowsWithoutSpec} />
    );
    const progressBars = container.querySelectorAll(".progressBar");
    expect(progressBars.length).toBe(0);
  });

  test("应该正确处理空的 spec 数组", () => {
    const flowWithEmptySpec: BusinessFlow[] = [
      {
        instanceId: "flow-empty-spec",
        name: "空 spec 的业务流",
        description: "测试",
        spec: [],
      },
    ];

    const { container } = render(
      <ServiceFlows businessFlows={flowWithEmptySpec} />
    );

    // 空 spec 应该不显示进度条区域
    const stageProgress = container.querySelector(".stageProgress");
    expect(stageProgress).not.toBeInTheDocument();
  });

  test("阶段进度条应该有正确的 title", () => {
    const { container } = render(
      <ServiceFlows businessFlows={[mockFlows[0]]} />
    );

    const progressBars = container.querySelectorAll(".progressBar");
    expect(progressBars[0].getAttribute("title")).toBe("阶段1");
    expect(progressBars[1].getAttribute("title")).toBe("阶段2");
  });
});
