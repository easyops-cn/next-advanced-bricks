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

import { BusinessObjectPreview } from "./BusinessObjectPreview";
import { BusinessObject } from "../interfaces";

describe("BusinessObjectPreview", () => {
  const mockData = {
    objectId: "obj-1",
    objectName: "用户",
    description: "系统用户对象",
    attributes: [
      { id: "1", name: "姓名", type: "string" },
      { id: "2", name: "年龄", type: "number" },
    ],
  } as BusinessObject;

  test("应该在没有数据时返回 null", () => {
    const { container } = render(<BusinessObjectPreview />);
    expect(container.firstChild).toBeNull();
  });

  test("应该在 visual 模式下正确渲染业务对象", () => {
    render(<BusinessObjectPreview data={mockData} viewType="visual" />);

    expect(screen.getByText("用户")).toBeInTheDocument();
    expect(screen.getByText("系统用户对象")).toBeInTheDocument();
  });

  test("应该在 json 模式下渲染 JSON 视图", () => {
    const { container } = render(
      <BusinessObjectPreview data={mockData} viewType="json" />
    );

    const preElement = container.querySelector("pre");
    expect(preElement).toBeInTheDocument();
    expect(preElement?.textContent).toContain('"objectName": "用户"');
  });

  test("应该渲染字段列表", () => {
    render(<BusinessObjectPreview data={mockData} viewType="visual" />);

    expect(screen.getByText("姓名")).toBeInTheDocument();
    expect(screen.getByText("年龄")).toBeInTheDocument();
  });

  test("应该默认使用 visual 视图", () => {
    render(<BusinessObjectPreview data={mockData} />);
    expect(screen.getByText("用户")).toBeInTheDocument();
  });

  test("应该渲染 relations 字段", () => {
    const dataWithRelations = {
      ...mockData,
      relations: [
        {
          relation_id: "rel-1",
          name: "关联候选人",
          description: "候选人关系",
          left_object_id: "obj-1",
          right_object_id: "obj-2",
          left_id: "user_id",
          right_id: "candidate_id",
        },
      ],
    } as BusinessObject;

    render(
      <BusinessObjectPreview data={dataWithRelations} viewType="visual" />
    );

    expect(screen.getByText("关联候选人")).toBeInTheDocument();
    expect(screen.getByText("Relation")).toBeInTheDocument();
  });

  test("应该为 relations 字段渲染 link 图标", () => {
    const dataWithRelations = {
      ...mockData,
      relations: [
        {
          relation_id: "rel-1",
          name: "关联候选人",
          description: "候选人关系",
          left_object_id: "obj-1",
          right_object_id: "obj-2",
          left_id: "user_id",
          right_id: "candidate_id",
        },
      ],
    } as BusinessObject;

    const { container } = render(
      <BusinessObjectPreview data={dataWithRelations} viewType="visual" />
    );

    const icons = container.querySelectorAll('[data-testid="icon"]');
    // 应该有至少 3 个图标：database icon, link icon, 可能还有 lifecycle icon
    expect(icons.length).toBeGreaterThanOrEqual(2);
  });

  test("应该同时渲染 attributes 和 relations", () => {
    const dataWithBoth = {
      ...mockData,
      relations: [
        {
          relation_id: "rel-1",
          name: "关联候选人",
          description: "候选人关系",
          left_object_id: "obj-1",
          right_object_id: "obj-2",
          left_id: "user_id",
          right_id: "candidate_id",
        },
        {
          relation_id: "rel-2",
          name: "关联部门",
          description: "部门关系",
          left_object_id: "obj-1",
          right_object_id: "obj-3",
          left_id: "user_id",
          right_id: "dept_id",
        },
      ],
    } as BusinessObject;

    render(<BusinessObjectPreview data={dataWithBoth} viewType="visual" />);

    // 检查 attributes
    expect(screen.getByText("姓名")).toBeInTheDocument();
    expect(screen.getByText("年龄")).toBeInTheDocument();

    // 检查 relations
    expect(screen.getByText("关联候选人")).toBeInTheDocument();
    expect(screen.getByText("关联部门")).toBeInTheDocument();
    expect(screen.getAllByText("Relation")).toHaveLength(2);
  });

  test("应该渲染 lifecycle 生命周期状态", () => {
    const dataWithLifecycle = {
      ...mockData,
      lifecycle: "graph TD\n  A[开始] --> B[进行中]\n  B --> C[结束]",
    } as BusinessObject;

    const { container } = render(
      <BusinessObjectPreview data={dataWithLifecycle} viewType="visual" />
    );

    // 检查 markdown display 组件是否被渲染
    const markdownDisplay = container.querySelector(
      '[data-testid="wrapped-eo-markdown-display"]'
    );
    expect(markdownDisplay).toBeInTheDocument();
  });

  test("不应该在没有 lifecycle 时渲染生命周期区域", () => {
    const { container } = render(
      <BusinessObjectPreview data={mockData} viewType="visual" />
    );

    const markdownDisplay = container.querySelector(
      '[data-testid="wrapped-eo-markdown-display"]'
    );
    expect(markdownDisplay).not.toBeInTheDocument();
  });

  test("应该处理空的 attributes 数组", () => {
    const dataWithEmptyAttributes = {
      objectId: "obj-1",
      objectName: "测试对象",
      description: "测试描述",
      attributes: [],
    } as BusinessObject;

    render(
      <BusinessObjectPreview data={dataWithEmptyAttributes} viewType="visual" />
    );

    expect(screen.getByText("测试对象")).toBeInTheDocument();
  });

  test("应该处理空的 relations 数组", () => {
    const dataWithEmptyRelations = {
      ...mockData,
      relations: [],
    } as BusinessObject;

    render(
      <BusinessObjectPreview data={dataWithEmptyRelations} viewType="visual" />
    );

    expect(screen.getByText("姓名")).toBeInTheDocument();
    expect(screen.queryByText("Relation")).not.toBeInTheDocument();
  });

  test("应该处理仅有 relations 没有 attributes 的情况", () => {
    const dataWithOnlyRelations = {
      objectId: "obj-1",
      objectName: "关系对象",
      description: "仅包含关系",
      attributes: [],
      relations: [
        {
          relation_id: "rel-1",
          name: "关联项目",
          description: "项目关系",
          left_object_id: "obj-1",
          right_object_id: "obj-4",
          left_id: "user_id",
          right_id: "project_id",
        },
      ],
    } as BusinessObject;

    render(
      <BusinessObjectPreview data={dataWithOnlyRelations} viewType="visual" />
    );

    expect(screen.getByText("关联项目")).toBeInTheDocument();
    expect(screen.getByText("Relation")).toBeInTheDocument();
  });

  test("应该正确渲染多个 attributes 的类型标签", () => {
    const dataWithMultipleTypes = {
      objectId: "obj-1",
      objectName: "用户",
      description: "系统用户",
      attributes: [
        { id: "1", name: "姓名", type: "string" },
        { id: "2", name: "年龄", type: "int" },
        { id: "3", name: "生日", type: "date" },
        { id: "4", name: "是否激活", type: "bool" },
      ],
    } as BusinessObject;

    render(
      <BusinessObjectPreview data={dataWithMultipleTypes} viewType="visual" />
    );

    expect(screen.getByText("string")).toBeInTheDocument();
    expect(screen.getByText("int")).toBeInTheDocument();
    expect(screen.getByText("date")).toBeInTheDocument();
    expect(screen.getByText("bool")).toBeInTheDocument();
  });

  test("应该在 JSON 模式下包含 relations 数据", () => {
    const dataWithRelations = {
      ...mockData,
      relations: [
        {
          relation_id: "rel-1",
          name: "关联候选人",
          description: "候选人关系",
          left_object_id: "obj-1",
          right_object_id: "obj-2",
          left_id: "user_id",
          right_id: "candidate_id",
        },
      ],
    } as BusinessObject;

    const { container } = render(
      <BusinessObjectPreview data={dataWithRelations} viewType="json" />
    );

    const preElement = container.querySelector("pre");
    expect(preElement?.textContent).toContain('"relations"');
    expect(preElement?.textContent).toContain('"relation_id"');
  });
});
