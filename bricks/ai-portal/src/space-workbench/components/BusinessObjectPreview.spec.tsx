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
});
