import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../../i18n.js", () => ({
  K: {
    NO_INSTANCES_IDENTIFIED: "NO_INSTANCES_IDENTIFIED",
    NO_INSTANCES_IDENTIFIED_DESCRIPTION: "NO_INSTANCES_IDENTIFIED_DESCRIPTION",
    DELETE_INSTANCE: "DELETE_INSTANCE",
  },
  NS: "test-ns",
  locales: {},
  t: (key: string) => key,
}));

jest.mock("../EmptyState", () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick:
    () =>
    ({ lib, icon, theme, onClick }: any) => (
      <span
        data-testid={`icon-${icon}`}
        data-lib={lib}
        data-theme={theme}
        onClick={onClick}
      >
        {icon}
      </span>
    ),
}));

import { InstanceList, InstanceCard } from "./InstanceList";
import type { InstanceItem, BusinessObject } from "../../interfaces";

describe("InstanceList", () => {
  const mockBusinessObject: BusinessObject = {
    objectId: "obj-1",
    objectName: "业务对象",
    description: "描述",
    attributes: [
      {
        id: "name",
        name: "名称",
        description: "",
        required: true,
        type: "string",
      },
      {
        id: "status",
        name: "状态",
        description: "",
        required: false,
        type: "string",
      },
    ],
  };

  const mockInstances: InstanceItem[] = [
    { _id_: "inst-1", instanceId: "inst-1", name: "实例1", status: "active" },
    { _id_: "inst-2", instanceId: "inst-2", name: "实例2", status: "inactive" },
  ];

  const mockOnSelect = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该在没有实例时显示空状态", () => {
    render(
      <InstanceList
        instances={[]}
        businessObject={mockBusinessObject}
        selectedInstanceId={null}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("NO_INSTANCES_IDENTIFIED")).toBeInTheDocument();
  });

  test("应该渲染实例列表", () => {
    render(
      <InstanceList
        instances={mockInstances}
        businessObject={mockBusinessObject}
        selectedInstanceId={null}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("实例1")).toBeInTheDocument();
    expect(screen.getByText("实例2")).toBeInTheDocument();
  });

  test("应该在点击实例时调用 onSelect", () => {
    const { container } = render(
      <InstanceList
        instances={mockInstances}
        businessObject={mockBusinessObject}
        selectedInstanceId={null}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const firstCard = container.querySelector('[class*="instanceCard"]');
    expect(firstCard).toBeInTheDocument();

    if (firstCard) {
      fireEvent.click(firstCard);
      expect(mockOnSelect).toHaveBeenCalledWith("inst-1");
    }
  });

  test("应该高亮选中的实例", () => {
    const { container } = render(
      <InstanceList
        instances={mockInstances}
        businessObject={mockBusinessObject}
        selectedInstanceId="inst-1"
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const cards = container.querySelectorAll('[class*="instanceCard"]');
    expect(cards[0].className).toContain("selected");
    expect(cards[1].className).not.toContain("selected");
  });
});

describe("InstanceCard", () => {
  const mockBusinessObject: BusinessObject = {
    objectId: "obj-1",
    objectName: "业务对象",
    description: "描述",
    attributes: [
      {
        id: "name",
        name: "名称",
        description: "",
        required: true,
        type: "string",
      },
      {
        id: "status",
        name: "状态",
        description: "",
        required: false,
        type: "string",
      },
    ],
  };

  const mockInstance: InstanceItem = {
    _id_: "inst-1",
    instanceId: "inst-1",
    name: "实例1",
    status: "active",
  };

  const mockOnSelect = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该显示实例的标题（第一个属性的值）", () => {
    render(
      <InstanceCard
        instance={mockInstance}
        businessObject={mockBusinessObject}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("实例1")).toBeInTheDocument();
  });

  test("应该在有 status 属性时显示状态", () => {
    render(
      <InstanceCard
        instance={mockInstance}
        businessObject={mockBusinessObject}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("active")).toBeInTheDocument();
  });

  test("应该在没有 status 属性时不显示状态区域", () => {
    const businessObjectNoStatus: BusinessObject = {
      ...mockBusinessObject,
      attributes: [
        {
          id: "name",
          name: "名称",
          description: "",
          required: true,
          type: "string",
        },
      ],
    };

    const { container } = render(
      <InstanceCard
        instance={mockInstance}
        businessObject={businessObjectNoStatus}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const statusDiv = container.querySelector('[class*="cardStatus"]');
    expect(statusDiv).not.toBeInTheDocument();
  });

  test("应该在点击卡片时调用 onSelect", () => {
    const { container } = render(
      <InstanceCard
        instance={mockInstance}
        businessObject={mockBusinessObject}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const card = container.querySelector('[class*="instanceCard"]');
    if (card) {
      fireEvent.click(card);
      expect(mockOnSelect).toHaveBeenCalled();
    }
  });

  test("应该在点击删除按钮时调用 onDelete", () => {
    const { container } = render(
      <InstanceCard
        instance={mockInstance}
        businessObject={mockBusinessObject}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = container.querySelector('[class*="deleteButton"]');
    expect(deleteButton).toBeInTheDocument();

    if (deleteButton) {
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalled();
      expect(mockOnSelect).not.toHaveBeenCalled(); // 确保不会触发 select
    }
  });

  test("应该在选中状态时添加 selected 类名", () => {
    const { container } = render(
      <InstanceCard
        instance={mockInstance}
        businessObject={mockBusinessObject}
        isSelected={true}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const card = container.querySelector('[class*="instanceCard"]');
    expect(card?.className).toContain("selected");
  });

  test("应该在未选中状态时不添加 selected 类名", () => {
    const { container } = render(
      <InstanceCard
        instance={mockInstance}
        businessObject={mockBusinessObject}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    const card = container.querySelector('[class*="instanceCard"]');
    expect(card?.className).not.toContain("selected");
  });

  test("应该在没有属性时使用 _id_ 作为标题", () => {
    const businessObjectNoAttrs: BusinessObject = {
      objectId: "obj-1",
      objectName: "业务对象",
      description: "描述",
      attributes: [],
    };

    render(
      <InstanceCard
        instance={mockInstance}
        businessObject={businessObjectNoAttrs}
        isSelected={false}
        onSelect={mockOnSelect}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("inst-1")).toBeInTheDocument();
  });
});
