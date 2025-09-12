import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import ".";
import type { ActionsButtons } from "./index.jsx";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.action-buttons", () => {
  test("should render buttons with items", () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const testItems = [
      { key: "item1", text: "按钮1" },
      { key: "item2", text: "按钮2", active: true },
      { key: "item3", text: "按钮3" },
    ];

    act(() => {
      element.items = testItems;
      document.body.appendChild(element);
    });

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");
    expect(buttons?.length).toBe(3);

    // 检查按钮文本
    expect(buttons?.[0]?.textContent?.trim()).toBe("按钮1");
    expect(buttons?.[1]?.textContent?.trim()).toBe("按钮2");
    expect(buttons?.[2]?.textContent?.trim()).toBe("按钮3");

    // 检查激活状态的样式类
    expect(buttons?.[0]?.className).not.toContain("active");
    expect(buttons?.[1]?.className).toContain("active");
    expect(buttons?.[2]?.className).not.toContain("active");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle single selection mode by default", () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const testItems = [
      { key: "item1", text: "按钮1" },
      { key: "item2", text: "按钮2", active: true },
      { key: "item3", text: "按钮3" },
    ];

    act(() => {
      element.items = testItems;
      document.body.appendChild(element);
    });

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");

    // 点击第一个按钮
    act(() => {
      (buttons?.[0] as any)?.click();
    });

    // 在单选模式下，只有被点击的按钮应该是激活状态
    const updatedItems = element.items;
    expect(updatedItems?.[0]?.active).toBe(true);
    expect(updatedItems?.[1]?.active).toBe(false);
    expect(updatedItems?.[2]?.active).toBe(false);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle multiple selection mode", () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const testItems = [
      { key: "item1", text: "按钮1" },
      { key: "item2", text: "按钮2", active: true },
      { key: "item3", text: "按钮3" },
    ];

    act(() => {
      element.items = testItems;
      element.multiple = true;
      document.body.appendChild(element);
    });

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");

    // 点击第一个按钮
    act(() => {
      (buttons?.[0] as any)?.click();
    });

    // 在多选模式下，两个按钮都应该是激活状态
    let updatedItems = element.items;
    expect(updatedItems?.[0]?.active).toBe(true);
    expect(updatedItems?.[1]?.active).toBe(true);
    expect(updatedItems?.[2]?.active).toBe(undefined); // 未设置的应该是 undefined

    // 再次点击第一个按钮，应该取消激活
    act(() => {
      (buttons?.[0] as any)?.click();
    });

    updatedItems = element.items;
    expect(updatedItems?.[0]?.active).toBe(false);
    expect(updatedItems?.[1]?.active).toBe(true);
    expect(updatedItems?.[2]?.active).toBe(undefined);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should dispatch custom event when action has event property", (done) => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const testItems = [
      { key: "item1", text: "按钮1", event: "item.click" },
      { key: "item2", text: "按钮2" },
    ];

    act(() => {
      element.items = testItems;
      document.body.appendChild(element);
    });

    // 监听自定义事件
    element.addEventListener("item.click", (event: any) => {
      expect(event.detail.current).toEqual({
        key: "item1",
        text: "按钮1",
        event: "item.click",
        active: true,
      });
      expect(event.detail.actives).toHaveLength(1);
      expect(event.detail.actives[0].key).toBe("item1");

      act(() => {
        document.body.removeChild(element);
      });
      done();
    });

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");

    act(() => {
      (buttons?.[0] as any)?.click();
    });
  });

  test("should not dispatch event when action has no event property", () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const testItems = [
      { key: "item1", text: "按钮1" }, // 没有 event 属性
    ];

    const eventSpy = jest.fn();

    act(() => {
      element.items = testItems;
      document.body.appendChild(element);
    });

    // 添加一个通用的事件监听器
    element.addEventListener("click", eventSpy);

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");

    // 点击按钮
    act(() => {
      (buttons?.[0] as any)?.click();
    });

    expect(element.items?.[0]?.active).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });
  test("should update items when property changes", async () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const initialItems = [{ key: "item1", text: "按钮1" }];

    act(() => {
      element.items = initialItems;
      document.body.appendChild(element);
    });

    let buttons = element.shadowRoot?.querySelectorAll("eo-button");
    expect(buttons?.length).toBe(1);

    const updatedItems = [
      { key: "item1", text: "按钮1" },
      { key: "item2", text: "按钮2" },
    ];

    await act(async () => {
      element.items = updatedItems;

      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    buttons = element.shadowRoot?.querySelectorAll("eo-button");
    expect(buttons?.length).toBe(2);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle multiple selection with event dispatching", (done) => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionsButtons;

    const testItems = [
      { key: "item1", text: "按钮1", event: "multi.select" },
      { key: "item2", text: "按钮2", active: true, event: "multi.select" },
    ];

    let eventCount = 0;

    act(() => {
      element.items = testItems;
      element.multiple = true;
      document.body.appendChild(element);
    });

    element.addEventListener("multi.select", (event: any) => {
      eventCount++;

      if (eventCount === 1) {
        // 第一次点击 item1
        expect(event.detail.current.key).toBe("item1");
        expect(event.detail.current.active).toBe(true);
        expect(event.detail.actives).toHaveLength(2);

        // 点击第二个按钮（取消激活）
        const buttons = element.shadowRoot?.querySelectorAll("eo-button");
        act(() => {
          (buttons?.[1] as any)?.click();
        });
      } else if (eventCount === 2) {
        // 第二次点击 item2（取消激活）
        expect(event.detail.current.key).toBe("item2");
        expect(event.detail.current.active).toBe(false);
        expect(event.detail.actives).toHaveLength(1);
        expect(event.detail.actives[0].key).toBe("item1");

        act(() => {
          document.body.removeChild(element);
        });
        done();
      }
    });

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");

    // 点击第一个按钮
    act(() => {
      (buttons?.[0] as any)?.click();
    });
  });
});
