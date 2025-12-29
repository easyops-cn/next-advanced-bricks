import React from "react";
import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("../i18n", () => ({
  K: {
    NO_DETAIL: "NO_DETAIL",
    NO_DETAIL_HINT: "NO_DETAIL_HINT",
  },
  t: (key: string) => key,
}));

jest.mock("../bricks", () => ({
  WrappedInput: ({ value, onValueChange, onBlur, onKeyDown }: any) => (
    <input
      data-testid="wrapped-input"
      value={value}
      onChange={(e) => onValueChange?.({ detail: e.target.value })}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
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
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <div>{title}</div>
      <div>{description}</div>
    </div>
  ),
}));

jest.mock("../../cruise-canvas/utils/file", () => ({
  formatFileSize: (size: number) => `${size}B`,
  getFileTypeAndIcon: () => ["file", "file-icon.png"],
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
  const mockOnFileClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该在没有实例或属性时显示空状态", () => {
    const { rerender } = render(
      <BusinessInstanceCard
        instance={null}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("NO_DETAIL")).toBeInTheDocument();

    rerender(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={null as any}
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  test("应该正确渲染实例详情和标题", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        title="实例详情"
        onAttrChange={mockOnAttrChange}
      />
    );

    expect(screen.getByText("实例详情")).toBeInTheDocument();
    expect(screen.getByText("实例1")).toBeInTheDocument();
    expect(screen.getByText("实例描述")).toBeInTheDocument();
  });

  test("应该支持编辑 string 类型字段并保存", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
      />
    );

    // 点击编辑按钮
    const editButton = screen.getAllByTestId("icon-edit")[0].closest("button");
    fireEvent.click(editButton!);

    const input = screen.getByTestId("wrapped-input");
    expect(input).toHaveValue("实例1");

    // 修改值
    fireEvent.change(input, { target: { value: "新名称" } });

    // 失焦保存
    fireEvent.blur(input);

    expect(mockOnAttrChange).toHaveBeenCalledWith("name", "新名称");
  });

  test("应该支持按 Enter 键保存和点击外部保存", () => {
    render(
      <div>
        <BusinessInstanceCard
          instance={mockInstance}
          attrs={mockAttrs}
          onAttrChange={mockOnAttrChange}
        />
        <div data-testid="outside">外部元素</div>
      </div>
    );

    // 测试 Enter 键保存
    const editButton = screen.getAllByTestId("icon-edit")[0].closest("button");
    fireEvent.click(editButton!);

    const input = screen.getByTestId("wrapped-input");
    fireEvent.change(input, { target: { value: "新名称1" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockOnAttrChange).toHaveBeenCalledWith("name", "新名称1");

    // 重置 mock
    mockOnAttrChange.mockClear();

    // 测试点击外部保存
    fireEvent.click(editButton!);
    const input2 = screen.getByTestId("wrapped-input");
    fireEvent.change(input2, { target: { value: "新名称2" } });

    const outsideElement = screen.getByTestId("outside");
    fireEvent.mouseDown(outsideElement);

    expect(mockOnAttrChange).toHaveBeenCalledWith("name", "新名称2");
  });

  test("应该正确渲染不同类型的属性", () => {
    render(
      <BusinessInstanceCard
        instance={mockInstance}
        attrs={mockAttrs}
        onAttrChange={mockOnAttrChange}
        onFileClick={mockOnFileClick}
      />
    );

    // enum 类型显示为 tag
    expect(screen.getByTestId("tag")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();

    // file 类型显示文件名
    expect(screen.getByText("file.pdf")).toBeInTheDocument();

    // text 类型显示在独立区域
    expect(screen.getByText("实例描述")).toBeInTheDocument();
  });

  test("应该支持文件点击和数组类型渲染", () => {
    const instanceWithFiles = {
      ...mockInstance,
      attachment: [
        { name: "file1.pdf", uri: "path/to/file1.pdf", size: 1024 },
        { name: "file2.pdf", uri: "path/to/file2.pdf", size: 2048 },
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
        instance={instanceWithFiles}
        attrs={attrsWithFileArray}
        onFileClick={mockOnFileClick}
      />
    );

    // file 数组渲染为多个文件项
    expect(screen.getByText("file1.pdf")).toBeInTheDocument();
    expect(screen.getByText("file2.pdf")).toBeInTheDocument();
    expect(screen.getByText("1024B")).toBeInTheDocument();
    expect(screen.getByText("2048B")).toBeInTheDocument();

    // 点击文件
    fireEvent.click(screen.getByText("file1.pdf"));
    expect(mockOnFileClick).toHaveBeenCalledWith(
      expect.objectContaining({ name: "file1.pdf" })
    );
  });
});
