import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock dependencies
jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

jest.mock("@next-api-sdk/llm-sdk", () => ({
  ElevoObjectApi_listServiceObjects: jest.fn(),
  ElevoObjectApi_listServiceObjectInstances: jest.fn(),
}));

jest.mock("@next-shared/datetime", () => ({
  humanizeTime: jest.fn(() => "2小时前"),
  HumanizeTimeFormat: {
    relative: "relative",
  },
}));

jest.mock("moment", () => {
  const mockMoment = () => ({
    valueOf: () => Date.now(),
  });
  return mockMoment;
});

jest.mock("../i18n.js", () => ({
  K: {
    BUSINESS_OBJECTS: "BUSINESS_OBJECTS",
    KNOWLEDGE: "KNOWLEDGE",
    NO_BUSINESS_OBJECTS: "NO_BUSINESS_OBJECTS",
    LOADING: "LOADING",
    LOAD_FAILED: "LOAD_FAILED",
    CLICK_TO_RETRY: "CLICK_TO_RETRY",
    NO_INSTANCES: "NO_INSTANCES",
  },
  t: (key: string) => key,
}));

jest.mock("./knowLedgesList.js", () => ({
  KnowledgesList: ({ knowledges, onKnowledgeClick, onAddKnowledge }: any) => (
    <div data-testid="knowledges-list">
      {knowledges?.map((k: any) => (
        <div key={k.instanceId} onClick={() => onKnowledgeClick?.(k)}>
          {k.name}
        </div>
      ))}
      <button onClick={onAddKnowledge}>添加知识</button>
    </div>
  ),
}));

jest.mock("../components/AddObjectInstModal/AddObjectInstModal", () => ({
  AddObjectInstModal: ({ visible, onSuccess, onCancel }: any) =>
    visible ? (
      <div data-testid="add-modal">
        <button onClick={onSuccess}>成功</button>
        <button onClick={onCancel}>取消</button>
      </div>
    ) : null,
}));

jest.mock("@next-core/react-element", () => ({
  wrapBrick:
    () =>
    ({ icon, onClick, className }: any) => (
      <span
        data-testid={`icon-${icon}`}
        onClick={onClick}
        className={className}
      >
        {icon}
      </span>
    ),
}));

jest.mock("../workbenchContext", () => {
  const React = require("react");
  const mockContext = React.createContext({
    spaceDetail: {
      instanceId: "space-1",
      name: "测试空间",
      description: "描述",
    },
  });
  return {
    WorkbenchContext: mockContext,
  };
});

import { SpaceSidebar } from "./SpaceSidebar";
import type { KnowledgeItem, BusinessInstance } from "../interfaces";
import {
  ElevoObjectApi_listServiceObjects,
  ElevoObjectApi_listServiceObjectInstances,
} from "@next-api-sdk/llm-sdk";

describe("SpaceSidebar", () => {
  const mockKnowledgeList: KnowledgeItem[] = [
    {
      instanceId: "k-1",
      name: "知识1",
      description: "描述1",
    },
    {
      instanceId: "k-2",
      name: "知识2",
      description: "描述2",
    },
  ];

  const mockOnInstanceClick = jest.fn();
  const mockOnKnowledgeClick = jest.fn();
  const mockOnKnowledgeAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("应该默认显示业务对象标签页", () => {
    render(
      <SpaceSidebar
        knowledgeList={mockKnowledgeList}
        onInstanceClick={mockOnInstanceClick}
        onKnowledgeClick={mockOnKnowledgeClick}
        onKnowledgeAdd={mockOnKnowledgeAdd}
      />
    );

    const buttons = screen.getAllByRole("button");
    const businessButton = buttons.find((btn) =>
      btn.textContent?.includes("BUSINESS_OBJECTS")
    );
    expect(businessButton?.className).toContain("active");
  });

  test("应该在点击知识标签页时切换", () => {
    render(
      <SpaceSidebar
        knowledgeList={mockKnowledgeList}
        onInstanceClick={mockOnInstanceClick}
        onKnowledgeClick={mockOnKnowledgeClick}
        onKnowledgeAdd={mockOnKnowledgeAdd}
      />
    );

    const buttons = screen.getAllByRole("button");
    const knowledgeButton = buttons.find((btn) =>
      btn.textContent?.includes("KNOWLEDGE")
    );

    if (knowledgeButton) {
      fireEvent.click(knowledgeButton);
      expect(screen.getByTestId("knowledges-list")).toBeInTheDocument();
    }
  });

  test("应该在知识标签页显示知识列表", () => {
    render(
      <SpaceSidebar
        knowledgeList={mockKnowledgeList}
        onInstanceClick={mockOnInstanceClick}
        onKnowledgeClick={mockOnKnowledgeClick}
        onKnowledgeAdd={mockOnKnowledgeAdd}
      />
    );

    // 切换到知识标签页
    const buttons = screen.getAllByRole("button");
    const knowledgeButton = buttons.find((btn) =>
      btn.textContent?.includes("KNOWLEDGE")
    );

    if (knowledgeButton) {
      fireEvent.click(knowledgeButton);
      expect(screen.getByText("知识1")).toBeInTheDocument();
      expect(screen.getByText("知识2")).toBeInTheDocument();
    }
  });

  test("应该在点击知识时调用 onKnowledgeClick", () => {
    render(
      <SpaceSidebar
        knowledgeList={mockKnowledgeList}
        onInstanceClick={mockOnInstanceClick}
        onKnowledgeClick={mockOnKnowledgeClick}
        onKnowledgeAdd={mockOnKnowledgeAdd}
      />
    );

    // 切换到知识标签页
    const buttons = screen.getAllByRole("button");
    const knowledgeButton = buttons.find((btn) =>
      btn.textContent?.includes("KNOWLEDGE")
    );

    if (knowledgeButton) {
      fireEvent.click(knowledgeButton);

      // 点击第一个知识
      const knowledge1 = screen.getByText("知识1");
      fireEvent.click(knowledge1);

      expect(mockOnKnowledgeClick).toHaveBeenCalledWith(
        expect.objectContaining({
          instanceId: "k-1",
          name: "知识1",
        })
      );
    }
  });

  test("应该在点击添加知识按钮时调用 onKnowledgeAdd", () => {
    render(
      <SpaceSidebar
        knowledgeList={mockKnowledgeList}
        onInstanceClick={mockOnInstanceClick}
        onKnowledgeClick={mockOnKnowledgeClick}
        onKnowledgeAdd={mockOnKnowledgeAdd}
      />
    );

    // 切换到知识标签页
    const buttons = screen.getAllByRole("button");
    const knowledgeButton = buttons.find((btn) =>
      btn.textContent?.includes("KNOWLEDGE")
    );

    if (knowledgeButton) {
      fireEvent.click(knowledgeButton);

      // 点击添加知识按钮
      const addButton = screen.getByText("添加知识");
      fireEvent.click(addButton);

      expect(mockOnKnowledgeAdd).toHaveBeenCalled();
    }
  });
});

describe("BusinessCategoryPanel", () => {
  const mockBusinessObjects = [
    {
      objectId: "obj-1",
      objectName: "对象1",
      description: "描述1",
      attributes: [
        {
          id: "name",
          name: "名称",
          description: "",
          required: true,
          type: "string" as const,
        },
        {
          id: "status",
          name: "状态",
          description: "",
          required: false,
          type: "string" as const,
        },
      ],
    },
    {
      objectId: "obj-2",
      objectName: "对象2",
      description: "描述2",
      attributes: [
        {
          id: "title",
          name: "标题",
          description: "",
          required: true,
          type: "string" as const,
        },
      ],
    },
  ];

  const mockInstances: BusinessInstance[] = [
    {
      instanceId: "inst-1",
      name: "实例1",
      status: "active",
      ctime: 1234567890000,
      mtime: 1234567890000,
    },
    {
      instanceId: "inst-2",
      name: "实例2",
      status: "inactive",
      ctime: 1234567890000,
      mtime: 1234567890000,
    },
  ];

  const mockOnInstanceClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (ElevoObjectApi_listServiceObjects as jest.Mock).mockResolvedValue({
      list: mockBusinessObjects,
    } as never);
    (ElevoObjectApi_listServiceObjectInstances as jest.Mock).mockResolvedValue({
      list: mockInstances,
    } as never);
  });

  test("应该在初始加载时显示加载状态", () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    expect(screen.getByText("LOADING")).toBeInTheDocument();
  });

  test("应该加载并显示业务对象列表", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
      expect(screen.getByText("对象2")).toBeInTheDocument();
    });
  });

  test("应该默认展开第一个业务对象", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(ElevoObjectApi_listServiceObjectInstances).toHaveBeenCalledWith(
        "obj-1",
        { page: 1, pageSize: 3000 }
      );
    });
  });

  test("应该在点击业务对象时切换展开状态", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    // 点击第二个对象
    const obj2 = screen.getByText("对象2");
    fireEvent.click(obj2);

    await waitFor(() => {
      expect(ElevoObjectApi_listServiceObjectInstances).toHaveBeenCalledWith(
        "obj-2",
        { page: 1, pageSize: 3000 }
      );
    });
  });

  test("应该在点击已展开的对象时折叠", async () => {
    const { container } = render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    // 点击第一个对象（已展开）
    const obj1 = screen.getByText("对象1");
    fireEvent.click(obj1);

    await waitFor(() => {
      const objectGroup = container.querySelector('[class*="objectGroup"]');
      expect(objectGroup?.className).not.toContain("expanded");
    });
  });

  test("应该在点击添加图标时打开添加模态框", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    const plusIcons = screen.getAllByTestId("icon-plus");
    if (plusIcons.length > 0) {
      fireEvent.click(plusIcons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("add-modal")).toBeInTheDocument();
      });
    }
  });

  test("应该在模态框成功后刷新实例列表", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    // 打开模态框
    const plusIcons = screen.getAllByTestId("icon-plus");
    if (plusIcons.length > 0) {
      fireEvent.click(plusIcons[0]);

      await waitFor(() => {
        const successButton = screen.getByText("成功");
        fireEvent.click(successButton);
      });

      await waitFor(() => {
        // 验证刷新调用
        expect(ElevoObjectApi_listServiceObjectInstances).toHaveBeenCalledTimes(
          2
        ); // 一次初始加载，一次刷新
      });
    }
  });

  test("应该在点击实例时调用 onInstanceClick", async () => {
    const { container } = render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    const instanceCards = container.querySelectorAll('[class*="instanceCard"]');
    if (instanceCards.length > 0) {
      fireEvent.click(instanceCards[0]);
      expect(mockOnInstanceClick).toHaveBeenCalledWith(
        expect.objectContaining({
          instanceId: "inst-1",
          name: "实例1",
        }),
        expect.objectContaining({
          objectId: "obj-1",
          objectName: "对象1",
        })
      );
    }
  });

  test("应该在没有业务对象时显示空状态", async () => {
    (ElevoObjectApi_listServiceObjects as jest.Mock).mockResolvedValue({
      list: [],
    } as never);

    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("NO_BUSINESS_OBJECTS")).toBeInTheDocument();
    });
  });

  test("应该在实例列表为空时显示无数据状态", async () => {
    (ElevoObjectApi_listServiceObjectInstances as jest.Mock).mockResolvedValue({
      list: [],
    } as never);

    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("NO_INSTANCES")).toBeInTheDocument();
    });
  });

  test("应该在加载失败时显示错误状态", async () => {
    (ElevoObjectApi_listServiceObjectInstances as jest.Mock).mockRejectedValue(
      new Error("加载失败") as never
    );

    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("LOAD_FAILED")).toBeInTheDocument();
      expect(screen.getByText("CLICK_TO_RETRY")).toBeInTheDocument();
    });
  });

  test("应该在点击重试时重新加载数据", async () => {
    // 第一次调用成功以加载对象列表
    (ElevoObjectApi_listServiceObjects as jest.Mock).mockResolvedValueOnce({
      list: mockBusinessObjects,
    } as never);
    // 第一次获取实例失败,第二次成功
    (ElevoObjectApi_listServiceObjectInstances as jest.Mock)
      .mockRejectedValueOnce(new Error("加载失败") as never)
      .mockResolvedValueOnce({ list: mockInstances } as never);

    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    // 等待对象列表加载并自动展开第一个对象(失败)
    await waitFor(() => {
      expect(screen.getByText("LOAD_FAILED")).toBeInTheDocument();
    });

    // 点击错误区域重试
    const errorContainer = screen.getByText("LOAD_FAILED").parentElement;
    if (errorContainer) {
      fireEvent.click(errorContainer);

      // 等待重试成功,显示实例
      await waitFor(() => {
        expect(screen.getByText("实例1")).toBeInTheDocument();
      });
    }
  });

  test("应该在展开已有缓存数据的对象时不重新加载", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    // 确认第一次加载实例
    expect(ElevoObjectApi_listServiceObjectInstances).toHaveBeenCalledTimes(1);

    // 折叠第一个对象
    const obj1 = screen.getByText("对象1");
    fireEvent.click(obj1);

    await waitFor(() => {
      const instanceCards = document.querySelectorAll(
        '[class*="instanceCard"]'
      );
      expect(instanceCards.length).toBe(0);
    });

    // 再次展开第一个对象 - 应该使用缓存,不重新加载
    fireEvent.click(obj1);

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    // 验证没有额外的 API 调用
    expect(ElevoObjectApi_listServiceObjectInstances).toHaveBeenCalledTimes(1);
  });

  test("应该在取消添加模态框时清理状态", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    // 打开模态框
    const plusIcons = screen.getAllByTestId("icon-plus");
    if (plusIcons.length > 0) {
      fireEvent.click(plusIcons[0]);

      await waitFor(() => {
        expect(screen.getByTestId("add-modal")).toBeInTheDocument();
      });

      // 点击取消
      const cancelButton = screen.getByText("取消");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId("add-modal")).not.toBeInTheDocument();
      });
    }
  });

  test("应该在点击实例时更新 activeInstanceId", async () => {
    const { container } = render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    const instanceCards = container.querySelectorAll('[class*="instanceCard"]');
    expect(instanceCards.length).toBeGreaterThan(0);

    // 点击第一个实例
    fireEvent.click(instanceCards[0]);

    await waitFor(() => {
      expect(instanceCards[0].className).toContain("active");
    });

    // 点击第二个实例
    if (instanceCards.length > 1) {
      fireEvent.click(instanceCards[1]);

      await waitFor(() => {
        expect(instanceCards[1].className).toContain("active");
        expect(instanceCards[0].className).not.toContain("active");
      });
    }
  });

  test("应该正确处理 instanceUpdateTrigger", async () => {
    const { rerender } = render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    // 触发实例更新
    const updateTrigger = {
      objectId: "obj-1",
      instanceId: "inst-1",
      updatedData: { name: "更新后的实例1" },
      timestamp: 1234567890000,
    };

    rerender(
      <SpaceSidebar
        knowledgeList={[]}
        onInstanceClick={mockOnInstanceClick}
        instanceUpdateTrigger={updateTrigger}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("更新后的实例1")).toBeInTheDocument();
    });
  });

  test("应该显示实例的状态标签", async () => {
    const { container } = render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    // 检查状态标签是否存在
    const statusTags = container.querySelectorAll('[class*="statusTag"]');
    expect(statusTags.length).toBeGreaterThan(0);
    expect(statusTags[0].textContent).toBe("active");
  });

  test("应该正确显示实例的时间信息", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    // 验证时间显示功能被调用
    expect(screen.getAllByText("2小时前").length).toBeGreaterThan(0);
  });

  test("应该在没有状态属性时不显示状态标签", async () => {
    const objectsWithoutStatus = [
      {
        objectId: "obj-1",
        objectName: "对象1",
        description: "描述1",
        attributes: [
          {
            id: "name",
            name: "名称",
            description: "",
            required: true,
            type: "string" as const,
          },
        ],
      },
    ];

    (ElevoObjectApi_listServiceObjects as jest.Mock).mockResolvedValue({
      list: objectsWithoutStatus,
    } as never);

    const { container } = render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("实例1")).toBeInTheDocument();
    });

    // 检查状态标签不存在
    const statusTags = container.querySelectorAll('[class*="statusTag"]');
    expect(statusTags.length).toBe(0);
  });

  test("应该正确处理展开图标的切换", async () => {
    render(
      <SpaceSidebar knowledgeList={[]} onInstanceClick={mockOnInstanceClick} />
    );

    await waitFor(() => {
      expect(screen.getByText("对象1")).toBeInTheDocument();
    });

    // 第一个对象默认展开,应该显示 chevron-down
    const chevronDownIcons = screen.getAllByTestId("icon-chevron-down");
    expect(chevronDownIcons.length).toBeGreaterThan(0);

    // 点击折叠
    const obj1 = screen.getByText("对象1");
    fireEvent.click(obj1);

    await waitFor(() => {
      // 折叠后应该有 chevron-right 图标
      const chevronRightIcons = screen.getAllByTestId("icon-chevron-right");
      expect(chevronRightIcons.length).toBeGreaterThan(0);
    });
  });
});
