import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, waitFor } from "@testing-library/react";
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
    return (props: any) => {
      const { children, visible, modalTitle, ...otherProps } = props;
      if (tagName === "eo-modal" && !visible) return null;
      return (
        <div
          data-testid={`wrapped-${tagName}`}
          data-modal-title={modalTitle}
          {...otherProps}
        >
          {modalTitle && <div data-testid="modal-title">{modalTitle}</div>}
          {children}
        </div>
      );
    };
  }),
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoApi_listElevoAiEmployees: jest.fn(() =>
    Promise.resolve({
      list: [
        { employeeId: "ai-1", name: "AI助手1" },
        { employeeId: "ai-2", name: "AI助手2" },
      ],
    })
  ),
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

import { ActivityDetailModal } from "./ActivityDetailModal";

describe("ActivityDetailModal", () => {
  const mockActivity = {
    id: "act-1",
    name: "测试活动",
    description: "这是一个测试活动",
    aiEmployeeId: "ai-1",
    hilUser: "user-1",
  };

  const defaultProps = {
    activity: mockActivity,
    visible: true,
    onClose: jest.fn(),
    onChange: jest.fn(),
  };

  test("应该在 visible 为 false 时不渲染", () => {
    const { container } = render(
      <ActivityDetailModal {...defaultProps} visible={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("应该在 activity 为 null 时返回 null", () => {
    const { container } = render(
      <ActivityDetailModal {...defaultProps} activity={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  test("应该在 visible 为 true 时渲染模态框", () => {
    const { container } = render(<ActivityDetailModal {...defaultProps} />);

    const modal = container.querySelector('[data-testid="wrapped-eo-modal"]');
    expect(modal).toBeInTheDocument();
    expect(modal?.getAttribute("data-modal-title")).toBe("测试活动");
  });

  test("应该在组件挂载时获取 AI 员工列表", async () => {
    const { ElevoApi_listElevoAiEmployees } = await import(
      "@next-api-sdk/llm-sdk"
    );

    render(<ActivityDetailModal {...defaultProps} />);

    await waitFor(() => {
      expect(ElevoApi_listElevoAiEmployees).toHaveBeenCalledWith({
        page: 1,
        page_size: 100,
      });
    });
  });
});
