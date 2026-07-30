import { describe, test, expect } from "@jest/globals";
import { act, fireEvent, getByTestId, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";

import "./";
import { Select, SlPopupElement } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

const mockResolveFn = jest.fn(() => "");
customElements.define(
  "illustrations.get-illustration",
  class extends HTMLElement {
    resolve = mockResolveFn;
  }
);

describe("eo-select", () => {
  const consoleError = jest.spyOn(console, "error").mockReturnValue();

  test("basic usage", async () => {
    const element = document.createElement("eo-select") as Select;
    element.value = "";
    element.options = [
      {
        label: "all",
        value: "",
      },
      {
        label: "a",
        value: "a",
      },
      {
        label: "b",
        value: "b",
      },
    ];

    const mockChangeEvent = jest.fn();
    const mockOptionsChangeEvent = jest.fn();
    const mockSearchEvent = jest.fn();
    element.addEventListener("change", mockChangeEvent);
    element.addEventListener("options.change", mockOptionsChangeEvent);
    element.addEventListener("search", mockSearchEvent);

    expect(element.shadowRoot).toBeFalsy();
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      (
        element.shadowRoot?.querySelector(
          ".selected-single-item"
        ) as HTMLElement
      ).textContent
    ).toBe("all");

    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).not.toHaveAttribute("active");

    act(() => {
      (
        element.shadowRoot?.querySelector(".select-selector") as HTMLElement
      ).click();
    });

    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).toHaveAttribute("active");
    expect(element.shadowRoot?.querySelectorAll(".select-item").length).toBe(3);

    expect(mockChangeEvent).toHaveBeenCalledTimes(0);

    act(() => {
      (
        element.shadowRoot?.querySelectorAll(".select-item")[1] as HTMLElement
      ).click();
    });
    expect(mockChangeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          options: [{ label: "a", value: "a" }],
          value: "a",
        },
      })
    );
    expect(element.value).toBe("a");
    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).not.toHaveAttribute("active");

    expect(
      (
        element.shadowRoot?.querySelectorAll(".select-item")[1] as HTMLElement
      ).classList.contains("select-option-selected")
    ).toBeTruthy();

    expect(mockOptionsChangeEvent).not.toHaveBeenCalled();

    await act(async () => {
      await (element.options = [
        {
          label: "a",
          value: "a",
        },
        {
          label: "b",
          value: "b",
        },
        {
          label: "c",
          value: "c",
        },
      ]);
    });

    expect(mockOptionsChangeEvent).toHaveBeenCalled();

    await act(async () => {
      await (element.value = "c");
    });

    expect(
      (
        element.shadowRoot?.querySelector(
          ".selected-single-item"
        ) as HTMLElement
      ).textContent
    ).toBe("c");

    expect(
      (
        element.shadowRoot?.querySelectorAll(".select-item")[0] as HTMLElement
      ).classList.contains("select-option-selected")
    ).toBeFalsy();

    expect(
      (
        element.shadowRoot?.querySelectorAll(".select-item")[2] as HTMLElement
      ).classList.contains("select-option-selected")
    ).toBe(true);

    act(() => {
      fireEvent.change(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement,
        { target: { value: "test" } }
      );
    });

    expect(mockSearchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          value: "test",
        },
      })
    );

    await act(async () => {
      await (element.value = null);
    });

    expect(consoleError).toHaveBeenCalledTimes(0);

    expect(
      element.shadowRoot?.querySelectorAll(
        ".select-item .select-option-selected"
      ).length
    ).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("mode is multiple", () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [
      {
        label: "a",
        value: "a",
      },
      {
        label: "b",
        value: "b",
      },
    ];
    element.mode = "multiple";
    element.value = ["a", "b"];
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      element.shadowRoot?.querySelectorAll(
        ".select-item.select-option-selected"
      ).length
    ).toBe(2);

    act(() => {
      fireEvent.click(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement
      );
    });

    act(() => {
      fireEvent.keyDown(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement,
        { code: "Backspace" }
      );
    });

    expect(
      element.shadowRoot?.querySelectorAll(
        ".select-item.select-option-selected"
      ).length
    ).toBe(1);

    expect(
      (
        element.shadowRoot?.querySelectorAll(".select-item")[0] as HTMLElement
      ).classList.contains("select-option-selected")
    ).toBeTruthy();

    expect(
      (
        element.shadowRoot?.querySelectorAll(".select-item")[1] as HTMLElement
      ).classList.contains("select-option-selected")
    ).toBeFalsy();

    act(() => {
      fireEvent.keyDown(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement,
        { code: "Backspace" }
      );
    });

    expect(
      element.shadowRoot?.querySelectorAll(
        ".select-item.select-option-selected"
      ).length
    ).toBe(0);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("mode is tags and had value,should render options", async () => {
    const element = document.createElement("eo-select") as Select;
    element.mode = "tags";
    element.value = ["a", "b"];
    element.tokenSeparators = [" ", ","];
    const mockOptionsChange = jest.fn();
    element.addEventListener("options.change", mockOptionsChange);
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      element.shadowRoot?.querySelectorAll(
        ".select-item.select-option-selected"
      ).length
    ).toBe(2);

    await act(async () => {
      fireEvent.change(element.shadowRoot!.querySelector("input")!, {
        target: { value: "hello" },
      });

      await fireEvent.keyDown(element.shadowRoot!.querySelector("input")!, {
        key: "Enter",
      });
    });

    expect(mockOptionsChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        detail: {
          options: [
            { key: "hello", label: "hello", value: "hello" },
            { label: "a", value: "a" },
            { label: "b", value: "b" },
          ],
          name: undefined,
        },
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("group", () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [
      {
        label: "a",
        value: "a",
        tag: "group 1",
      },
      {
        label: "b",
        value: "b",
        tag: "group 2",
      },
      {
        label: "c",
        value: "c",
      },
    ];
    element.groupBy = "tag";
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      element.shadowRoot?.querySelector(".dropdown-list")?.innerHTML
    ).toMatchInlineSnapshot(
      `"<div class="dropdown-inner"><div class="select-group-wrapper"><div class="select-group-label">group 1</div><div class="select-item select-item-option select-option-hover"><div class="select-item-option-content"><div class="option"><div class="text-container"><span class="label">a</span></div></div></div></div></div><div class="select-group-wrapper"><div class="select-group-label">group 2</div><div class="select-item select-item-option"><div class="select-item-option-content"><div class="option"><div class="text-container"><span class="label">b</span></div></div></div></div></div><div class="select-item select-item-option"><div class="select-item-option-content"><div class="option"><div class="text-container"><span class="label">c</span></div></div></div></div></div>"`
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("fields", () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [
      {
        name: "a",
        id: "a",
      },
      {
        name: "b",
        id: "b",
      },
      {
        name: "c",
        id: "c",
      },
    ] as any;
    element.fields = {
      label: "name",
      value: "id",
    };
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(element.shadowRoot?.querySelectorAll(".select-item")?.length).toBe(
      3
    );

    expect(
      element.shadowRoot?.querySelectorAll(".select-item .label")[0].innerHTML
    ).toBe("a");

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("popup strategy should be fixed when dropdownHoist is true", async () => {
    const element = document.createElement("eo-select") as Select;

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).toHaveAttribute("strategy", "absolute");

    await act(async () => {
      element.dropdownHoist = true;
    });

    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).toHaveAttribute("strategy", "fixed");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("caption", () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [
      {
        label: "a",
        value: "a",
        caption: "caption 1",
      },
      {
        label: "b",
        value: "b",
        tag: "caption 2",
      },
      {
        label: "c",
        value: "c",
      },
    ];
    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot?.childNodes.length).toBe(2);

    expect(
      element.shadowRoot?.querySelector(".dropdown-list")?.innerHTML
    ).toMatchInlineSnapshot(
      `"<div class="dropdown-inner"><div class="select-item select-item-option select-option-hover"><div class="select-item-option-content"><div class="option"><div class="text-container"><span class="label">a</span><span class="caption">caption 1</span></div></div></div></div><div class="select-item select-item-option"><div class="select-item-option-content"><div class="option"><div class="text-container"><span class="label">b</span></div></div></div></div><div class="select-item select-item-option"><div class="select-item-option-content"><div class="option"><div class="text-container"><span class="label">c</span></div></div></div></div></div>"`
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("should not select option when pressing Enter with dropdown closed", () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [
      {
        label: "a",
        value: "a",
      },
      {
        label: "b",
        value: "b",
      },
      {
        label: "c",
        value: "c",
      },
    ];
    element.value = "a"; // 预设一个值,这样可以通过点击来切换下拉框状态

    const mockChangeEvent = jest.fn();
    element.addEventListener("change", mockChangeEvent);

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot).toBeTruthy();

    // 确保下拉框未展开
    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).not.toHaveAttribute("active");

    // 打开下拉框
    act(() => {
      (
        element.shadowRoot?.querySelector(".select-selector") as HTMLElement
      ).click();
    });

    // 下拉框应该已展开
    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).toHaveAttribute("active");

    // 关闭下拉框(通过再次点击 selector)
    act(() => {
      (
        element.shadowRoot?.querySelector(".select-selector") as HTMLElement
      ).click();
    });

    // 下拉框应该已关闭
    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).not.toHaveAttribute("active");

    // 在下拉框关闭时按 Enter 键
    act(() => {
      fireEvent.keyDown(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement,
        { code: "Enter" }
      );
    });

    // 不应触发 change 事件(因为下拉框是关闭的)
    expect(mockChangeEvent).not.toHaveBeenCalled();
    // 值应保持为 "a"
    expect(element.value).toBe("a");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should select option when pressing Enter with dropdown open", () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [
      {
        label: "a",
        value: "a",
      },
      {
        label: "b",
        value: "b",
      },
      {
        label: "c",
        value: "c",
      },
    ];

    const mockChangeEvent = jest.fn();
    element.addEventListener("change", mockChangeEvent);

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot).toBeTruthy();

    // 打开下拉框
    act(() => {
      (
        element.shadowRoot?.querySelector(".select-selector") as HTMLElement
      ).click();
    });

    // 确保下拉框已展开
    expect(
      getByTestId(
        element.shadowRoot as unknown as HTMLElement,
        "select-dropdown-popup"
      ) as SlPopupElement
    ).toHaveAttribute("active");

    // 聚焦输入框
    act(() => {
      fireEvent.click(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement
      );
    });

    // 在下拉框展开时按 Enter 键
    act(() => {
      fireEvent.keyDown(
        element.shadowRoot?.querySelector(
          ".select-selection-search-input"
        ) as HTMLElement,
        { code: "Enter" }
      );
    });

    // 应触发 change 事件,选中第一个选项(默认聚焦项)
    expect(mockChangeEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          options: [{ label: "a", value: "a" }],
          value: "a",
        },
      })
    );
    expect(element.value).toBe("a");

    act(() => {
      document.body.removeChild(element);
    });
  });
});

describe("eo-select option label tooltip", () => {
  test("label 文本溢出时,hover 显示 antd tooltip 完整内容", async () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [{ label: "a-very-long-option-label", value: "a" }];
    act(() => {
      document.body.appendChild(element);
    });

    // 打开下拉框
    act(() => {
      (
        element.shadowRoot?.querySelector(".select-selector") as HTMLElement
      ).click();
    });

    const label = element.shadowRoot?.querySelector(
      ".select-item .label"
    ) as HTMLSpanElement;

    // jsdom 不做布局,手动模拟文本溢出(offsetWidth < scrollWidth)
    Object.defineProperty(label, "offsetWidth", {
      value: 50,
      configurable: true,
    });
    Object.defineProperty(label, "scrollWidth", {
      value: 300,
      configurable: true,
    });

    await act(async () => {
      fireEvent.mouseEnter(label);
    });

    // tooltip 浮层 portal 到 body,前缀为 antdV5
    await waitFor(() => {
      expect(document.querySelector(".antdV5-tooltip-inner")?.textContent).toBe(
        "a-very-long-option-label"
      );
    });

    // 离开后触发关闭分支(覆盖 onOpenChange 中 !o 的 setOpen(false));
    // antd Tooltip 关闭受 mouseLeaveDelay 控制用 setTimeout,需等待定时器触发
    await act(async () => {
      fireEvent.mouseLeave(label);
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("label 文本未溢出时,hover 不显示 tooltip", async () => {
    const element = document.createElement("eo-select") as Select;
    element.options = [{ label: "short", value: "a" }];
    act(() => {
      document.body.appendChild(element);
    });

    act(() => {
      (
        element.shadowRoot?.querySelector(".select-selector") as HTMLElement
      ).click();
    });

    const label = element.shadowRoot?.querySelector(
      ".select-item .label"
    ) as HTMLSpanElement;

    // 模拟未溢出(offsetWidth >= scrollWidth)
    Object.defineProperty(label, "offsetWidth", {
      value: 300,
      configurable: true,
    });
    Object.defineProperty(label, "scrollWidth", {
      value: 50,
      configurable: true,
    });

    await act(async () => {
      fireEvent.mouseEnter(label);
    });
    // 等待超过 mouseEnterDelay(0.1s),确认 tooltip 未出现
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(document.querySelector(".antdV5-tooltip")).toBeNull();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
