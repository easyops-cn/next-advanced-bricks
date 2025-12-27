import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../i18n", () => ({
  K: {
    NO_DETAIL: "NO_DETAIL",
    NO_DETAIL_HINT: "NO_DETAIL_HINT",
    INSTANCE_DETAIL: "INSTANCE_DETAIL",
  },
  t: (key: string) => key,
}));

jest.mock("../bricks", () => ({
  WrappedInput: ({ value, onValueChange }: any) => (
    <input
      data-testid="wrapped-input"
      value={value}
      onChange={(e) => onValueChange?.({ detail: e.target.value })}
    />
  ),
  WrappedIcon: ({ lib, icon }: any) => (
    <span data-testid={`icon-${icon}`} data-lib={lib}>
      {icon}
    </span>
  ),
  WrappedTag: ({ children }: any) => <span data-testid="tag">{children}</span>,
}));

jest.mock("./EmptyState", () => ({
  EmptyState: ({ title, description, className }: any) => (
    <div data-testid="empty-state" className={className}>
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

import { BusinessInstanceCard } from "./BusinessInstanceCard";
import type { Attribute } from "../interfaces";

describe("BusinessInstanceCard", () => {
  const mockAttrs: Attribute[] = [
    {
      id: "name",
      name: "名称",
      description: "",
      required: true,
      type: "string",
    },
    {
      id: "description",
      name: "描述",
      description: "",
      required: false,
      type: "text",
    },
    {
      id: "status",
      name: "状态",
      description: "",
      required: false,
      type: "enum",
    },
    {
      id: "attachment",
      name: "附件",
      description: "",
      required: false,
      type: "file",
    },
  ];

  const mockInstance = {
    _id_: "inst-1",
    name: "实例1",
    description: "实例描述",
    status: "active",
    attachment: { name: "file.pdf", uri: "path/to/file.pdf" },
  };

  const mockOnAttrChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该在没有实例时显示空状态", () => {
    render(
      <BusinessInstanceCard
        instance={null}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("NO_DETAIL")).toBeInTheDocument();
    expect(screen.getByText("NO_DETAIL_HINT")).toBeInTheDocument();
  });

  test("应该在没有属性时显示空状态", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={null as any}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  test("应该渲染实例详情标题", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        title="INSTANCE_DETAIL"
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByText("INSTANCE_DETAIL")).toBeInTheDocument();
  });

  test("应该为 string 类型的属性渲染可编辑的输入框", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    const inputs = screen.getAllByTestId("wrapped-input");
    expect(inputs.length).toBeGreaterThan(0);
  });

  test("应该在输入框值变化时调用 onAttrChange", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    const input = screen.getAllByTestId("wrapped-input")[0];
    fireEvent.change(input, { target: { value: "新名称" } });

    expect(mockOnAttrChange).toHaveBeenCalledWith("name", "新名称");
  });

  test("应该为 text 类型的属性渲染单独的区域", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByText("实例描述")).toBeInTheDocument();
  });

  test("应该为 file 类型的属性渲染文件列表", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByText("file.pdf")).toBeInTheDocument();
    expect(screen.getByTestId("icon-file-text")).toBeInTheDocument();
  });

  test("应该为数组类型的文件属性渲染多个文件", () => {
    const instanceWithMultipleFiles = {
      ...mockInstance,
      attachment: [
        { name: "file1.pdf", uri: "path/to/file1.pdf" },
        { name: "file2.pdf", uri: "path/to/file2.pdf" },
      ],
    };

    const attrsWithFileArray: Attribute[] = [
      {
        id: "attachment",
        name: "附件",
        description: "",
        required: false,
        type: "file",
        isArray: true,
      },
    ];

    render(
      <BusinessInstanceCard
        instance={instanceWithMultipleFiles}
        attrs={attrsWithFileArray}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByText("file1.pdf")).toBeInTheDocument();
    expect(screen.getByText("file2.pdf")).toBeInTheDocument();
  });

  test("应该为 enum 类型渲染标签", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    const tags = screen.getAllByTestId("tag");
    expect(tags.length).toBeGreaterThan(0);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  test("应该为数组类型的 enum 渲染为逗号分隔的字符串", () => {
    const instanceWithMultipleEnums = {
      ...mockInstance,
      status: ["active", "pending"],
    };

    const attrsWithEnumArray: Attribute[] = [
      {
        id: "status",
        name: "状态",
        description: "",
        required: false,
        type: "enum",
        isArray: true,
      },
    ];

    render(
      <BusinessInstanceCard
        instance={instanceWithMultipleEnums}
        attrs={attrsWithEnumArray}
        onAttrChange={mockOnAttrChange}
      />
    );

    // 当 isArray 为 true 时,会渲染为逗号分隔的字符串
    expect(screen.getByText("active, pending")).toBeInTheDocument();
  });

  test("应该不渲染空的文件属性", () => {
    const instanceWithoutFile = {
      _id_: "inst-1",
      name: "实例1",
    };

    render(
      <BusinessInstanceCard
        instance={instanceWithoutFile}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.queryByText("附件")).not.toBeInTheDocument();
  });

  test("应该不渲染空的 text 属性", () => {
    const instanceWithoutText = {
      _id_: "inst-1",
      name: "实例1",
    };

    render(
      <BusinessInstanceCard
        instance={instanceWithoutText}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    // text 类型的属性在没有值时不应该显示
    const textSections = screen.queryAllByText("描述");
    // 应该只有属性列表中的标签，没有独立的 section
    expect(textSections.length).toBeLessThanOrEqual(1);
  });

  test("应该正确分组不同类型的属性", () => {
    const allTypesAttrs: Attribute[] = [
      {
        id: "name",
        name: "名称",
        description: "",
        required: true,
        type: "string",
      },
      {
        id: "count",
        name: "数量",
        description: "",
        required: false,
        type: "int",
      },
      {
        id: "content",
        name: "内容",
        description: "",
        required: false,
        type: "text",
      },
      {
        id: "files",
        name: "文件",
        description: "",
        required: false,
        type: "file",
      },
    ];

    const allTypesInstance = {
      _id_: "inst-1",
      name: "测试",
      count: 10,
      content: "这是文本内容",
      files: { name: "test.pdf" },
    };

    render(
      <BusinessInstanceCard
        instance={allTypesInstance}
        attrs={allTypesAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    // 检查不同类型的属性都正确渲染
    const inputs = screen.getAllByTestId("wrapped-input");
    expect(inputs[0]).toHaveValue("测试"); // string 类型使用 input
    expect(screen.getByText("10")).toBeInTheDocument(); // int 类型
    expect(screen.getByText("这是文本内容")).toBeInTheDocument(); // text 类型
    expect(screen.getByText("test.pdf")).toBeInTheDocument(); // file 类型
  });

  test("应该在没有 onAttrChange 时不抛出错误", () => {
    const { container } = render(
      <BusinessInstanceCard instance={mockInstance} attrs={mockAttrs} />
    );

    const input = container.querySelector("input");
    expect(() => {
      if (input) {
        fireEvent.change(input, { target: { value: "新值" } });
      }
    }).not.toThrow();
  });
});
