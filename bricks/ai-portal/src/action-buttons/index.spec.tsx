import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import ".";
import type { ActionButtons } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.action-buttons", () => {
  test("should render buttons with items", () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionButtons;

    const testItems = [
      { key: "item1", text: "按钮1" },
      { key: "item2", text: "按钮2" },
      { key: "item3", text: "按钮3" },
    ];
    element.items = testItems;

    act(() => {
      document.body.appendChild(element);
    });

    const buttons = element.shadowRoot?.querySelectorAll("eo-button");
    expect(buttons?.length).toBe(3);

    // 检查按钮文本
    expect(buttons?.[0]?.textContent?.trim()).toBe("按钮1");
    expect(buttons?.[1]?.textContent?.trim()).toBe("按钮2");
    expect(buttons?.[2]?.textContent?.trim()).toBe("按钮3");

    // 检查激活状态的样式类
    expect(buttons?.[0]?.classList).not.toContain("active");
    expect(buttons?.[1]?.classList).not.toContain("active");
    expect(buttons?.[2]?.classList).not.toContain("active");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle active button switch", () => {
    const element = document.createElement(
      "ai-portal.action-buttons"
    ) as ActionButtons;
    element.activeKey = "item2";

    const testItems = [
      { key: "item1", text: "按钮1" },
      { key: "item2", text: "按钮2" },
      { key: "item3", text: "按钮3" },
    ];
    element.items = testItems;

    const changeHandler = jest.fn();
    element.addEventListener("change", (e) => {
      changeHandler((e as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    const buttons = element.shadowRoot!.querySelectorAll("eo-button")!;
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent?.trim()).toBe("按钮2");

    expect(changeHandler).not.toHaveBeenCalled();

    // Remove active button
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector(".remove")!);
    });
    const buttons2 = element.shadowRoot!.querySelectorAll("eo-button")!;
    expect(buttons2.length).toBe(3);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(null);

    // Click the first button
    act(() => {
      fireEvent.click(buttons2[0]);
    });
    const buttons3 = element.shadowRoot!.querySelectorAll("eo-button")!;
    expect(buttons3.length).toBe(1);
    expect(buttons3[0].textContent?.trim()).toBe("按钮1");
    expect(changeHandler).toHaveBeenCalledTimes(2);
    expect(changeHandler).toHaveBeenLastCalledWith({
      key: "item1",
      text: "按钮1",
    });

    act(() => {
      document.body.removeChild(element);
    });
  });
});
