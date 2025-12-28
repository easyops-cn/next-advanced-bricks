import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@next-core/i18n", () => ({
  initializeI18n: jest.fn(),
  i18n: {
    getFixedT: jest.fn(() => (key: string) => key),
  },
}));

jest.mock("../i18n.js", () => ({
  K: {
    ACTIVITY_DESCRIPTION: "ACTIVITY_DESCRIPTION",
    NO_DESCRIPTION: "NO_DESCRIPTION",
    RESPONSIBLE_AI_EMPLOYEE: "RESPONSIBLE_AI_EMPLOYEE",
    SELECT_AI_EMPLOYEE_PLACEHOLDER: "SELECT_AI_EMPLOYEE_PLACEHOLDER",
    HITL_RULES: "HITL_RULES",
    HITL_INTERVENTION_USER: "HITL_INTERVENTION_USER",
    SELECT_HITL_USER_PLACEHOLDER: "SELECT_HITL_USER_PLACEHOLDER",
    NOT_SET: "NOT_SET",
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
        onValueChange,
        value,
        options,
        placeholder,
        nameOrInstanceId,
        showName,
        content,
        lib,
        icon,
        className,
        ...otherProps
      } = props;

      if (tagName === "eo-modal" && !visible) return null;

      // 模拟 eo-select
      if (tagName === "eo-select") {
        return (
          <select
            data-testid={`wrapped-${tagName}`}
            value={value}
            onChange={(e) => {
              const customEvent = {
                detail: { value: e.target.value },
              } as any;
              onValueChange?.(customEvent);
            }}
            {...otherProps}
          >
            <option value="">{placeholder}</option>
            {options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      // 模拟 eo-user-or-user-group-select
      if (tagName === "eo-user-or-user-group-select") {
        return (
          <input
            data-testid={`wrapped-${tagName}`}
            value={value?.[0] || ""}
            placeholder={placeholder}
            onChange={(e) => {
              const event = new CustomEvent("change", {
                detail: [e.target.value],
              });
              onValueChange?.(event);
            }}
            {...otherProps}
          />
        );
      }

      // 模拟 eo-markdown-display
      if (tagName === "eo-markdown-display") {
        return (
          <div data-testid={`wrapped-${tagName}`} {...otherProps}>
            {content}
          </div>
        );
      }

      // 模拟 eo-icon
      if (tagName === "eo-icon") {
        return (
          <span
            data-testid={`wrapped-${tagName}`}
            data-lib={lib}
            data-icon={icon}
            className={className}
            {...otherProps}
          />
        );
      }

      // 模拟 eo-easyops-avatar
      if (tagName === "eo-easyops-avatar") {
        return (
          <div data-testid={`wrapped-${tagName}`} {...otherProps}>
            {nameOrInstanceId}
          </div>
        );
      }

      // 默认 eo-modal
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

const mockListEmployees = jest.fn();
const mockHandleHttpError = jest.fn();

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoApi_listElevoAiEmployees: (...args: any[]) => mockListEmployees(...args),
}));

jest.mock("@next-core/runtime", () => ({
  handleHttpError: (error: any) => mockHandleHttpError(error),
}));

import { ActivityDetailModal } from "./ActivityDetailModal";

describe("ActivityDetailModal", () => {
  const mockActivity = {
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockListEmployees.mockResolvedValue({
      list: [
        { employeeId: "ai-1", name: "AI助手1" },
        { employeeId: "ai-2", name: "AI助手2" },
      ],
    } as never);
  });

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
    render(<ActivityDetailModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockListEmployees).toHaveBeenCalledWith({
        page: 1,
        page_size: 100,
      });
    });
  });

  test("应该显示活动描述", () => {
    const { getByTestId } = render(<ActivityDetailModal {...defaultProps} />);
    const markdownDisplay = getByTestId("wrapped-eo-markdown-display");
    expect(markdownDisplay).toBeInTheDocument();
    expect(markdownDisplay.textContent).toBe("这是一个测试活动");
  });

  test("当没有描述时应该显示空描述提示", () => {
    const activityWithoutDesc = { ...mockActivity, description: "" };
    const { getByText } = render(
      <ActivityDetailModal {...defaultProps} activity={activityWithoutDesc} />
    );
    expect(getByText("NO_DESCRIPTION")).toBeInTheDocument();
  });

  test("应该渲染 AI 员工选择器（非只读模式）", async () => {
    const { getByTestId } = render(<ActivityDetailModal {...defaultProps} />);

    await waitFor(() => {
      const select = getByTestId("wrapped-eo-select");
      expect(select).toBeInTheDocument();
      expect(select).toHaveValue("ai-1");
    });
  });

  test("应该在只读模式下显示 AI 员工名称", async () => {
    const { getByTestId, getByText } = render(
      <ActivityDetailModal {...defaultProps} onlyRead />
    );

    await waitFor(() => {
      expect(getByTestId("wrapped-eo-icon")).toBeInTheDocument();
      expect(getByText("AI助手1")).toBeInTheDocument();
    });
  });

  test("应该在 AI 员工未设置时显示未设置提示（只读模式）", () => {
    const activityWithoutAI = { ...mockActivity, aiEmployeeId: "" };
    const { container } = render(
      <ActivityDetailModal
        {...defaultProps}
        activity={activityWithoutAI}
        onlyRead
      />
    );

    const readOnlyTexts = container.querySelectorAll(".readOnlyText");
    // 第一个应该是 AI 员工的 NOT_SET
    expect(readOnlyTexts[0]).toHaveTextContent("NOT_SET");
  });

  test("应该处理 AI 员工选择变更", async () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <ActivityDetailModal {...defaultProps} onChange={onChange} />
    );

    await waitFor(() => {
      expect(getByTestId("wrapped-eo-select")).toBeInTheDocument();
    });

    const select = getByTestId("wrapped-eo-select");
    fireEvent.change(select, { target: { value: "ai-2" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        aiEmployeeId: "ai-2",
      })
    );
  });

  test("应该显示 HITL 规则（如果存在）", () => {
    const activityWithRules = {
      ...mockActivity,
      hilRules: "当置信度低于 0.8 时需要人工介入",
    };
    const { getByText } = render(
      <ActivityDetailModal {...defaultProps} activity={activityWithRules} />
    );

    expect(getByText("当置信度低于 0.8 时需要人工介入")).toBeInTheDocument();
  });

  test("应该渲染 HITL 用户选择器（非只读模式）", () => {
    const { getByTestId } = render(<ActivityDetailModal {...defaultProps} />);
    const userSelect = getByTestId("wrapped-eo-user-or-user-group-select");
    expect(userSelect).toBeInTheDocument();
    expect(userSelect).toHaveValue("user-1");
  });

  test("应该在只读模式下显示 HITL 用户头像", () => {
    const { getByTestId } = render(
      <ActivityDetailModal {...defaultProps} onlyRead />
    );

    const avatar = getByTestId("wrapped-eo-easyops-avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar.textContent).toBe("user-1");
  });

  test("应该在 HITL 用户未设置时显示未设置提示（只读模式）", () => {
    const activityWithoutUser = { ...mockActivity, hilUser: undefined };
    const { container } = render(
      <ActivityDetailModal
        {...defaultProps}
        activity={activityWithoutUser}
        onlyRead
      />
    );

    const readOnlyTexts = container.querySelectorAll(".readOnlyText");
    // 最后一个应该是 HITL 用户的 NOT_SET
    expect(readOnlyTexts[readOnlyTexts.length - 1]).toHaveTextContent(
      "NOT_SET"
    );
  });

  test("应该处理 HITL 用户变更", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <ActivityDetailModal {...defaultProps} onChange={onChange} />
    );

    const userSelect = getByTestId("wrapped-eo-user-or-user-group-select");
    fireEvent.change(userSelect, { target: { value: "user-2" } });

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        hilUser: "user-2",
      })
    );
  });

  test("应该在 activity 变化时更新状态", () => {
    const { rerender, getByTestId } = render(
      <ActivityDetailModal {...defaultProps} />
    );

    const newActivity = {
      ...mockActivity,
      name: "更新后的活动",
      aiEmployeeId: "ai-2",
    };

    rerender(<ActivityDetailModal {...defaultProps} activity={newActivity} />);

    const modal = getByTestId("wrapped-eo-modal");
    expect(modal.getAttribute("data-modal-title")).toBe("更新后的活动");
  });

  test("应该处理 API 错误", async () => {
    mockListEmployees.mockRejectedValueOnce(new Error("API Error") as never);

    render(<ActivityDetailModal {...defaultProps} />);

    await waitFor(() => {
      expect(mockHandleHttpError).toHaveBeenCalled();
    });
  });

  test("应该过滤掉没有 employeeId 的员工", async () => {
    mockListEmployees.mockResolvedValueOnce({
      list: [
        { employeeId: "ai-1", name: "AI助手1" },
        { employeeId: null, name: "无效员工" },
        { employeeId: "ai-2", name: "AI助手2" },
      ],
    } as never);

    const { getByTestId } = render(<ActivityDetailModal {...defaultProps} />);

    await waitFor(() => {
      const select = getByTestId("wrapped-eo-select");
      const options = select.querySelectorAll("option");
      // 应该有 3 个 option (placeholder + 2 个有效员工)
      expect(options.length).toBe(3);
    });
  });

  test("应该在 visible 为 false 时不调用 API", () => {
    render(<ActivityDetailModal {...defaultProps} visible={false} />);
    expect(mockListEmployees).not.toHaveBeenCalled();
  });
});
