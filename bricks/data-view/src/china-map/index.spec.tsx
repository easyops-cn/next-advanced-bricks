import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { ChinaMap } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

jest.mock(
  "resize-observer-polyfill",
  () =>
    class {
      #callback: ResizeObserverCallback;
      constructor(callback: ResizeObserverCallback) {
        this.#callback = callback;
      }
      disconnect() {}
      observe(target: Element) {
        this.#callback(
          [
            {
              target: null,
            },
            {
              target,
              contentRect: {
                width: 1200,
                height: 800,
              },
            },
          ] as ResizeObserverEntry[],
          this
        );
      }
      unobserve() {}
    }
);

describe("data-view.china-map", () => {
  test("basic usage", async () => {
    const element = document.createElement("data-view.china-map") as ChinaMap;
    element.dataSource = [
      {
        province: "广东",
        text: "42",
      },
      {
        province: "未知",
        text: "43",
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(element.shadowRoot.querySelector(".message")).toBe(null);

    const labels = element.shadowRoot.querySelectorAll(
      ".label"
    ) as NodeListOf<HTMLElement>;
    expect(labels.length).toBe(1);
    const label = labels[0];
    expect(parseFloat(label.style.left)).toBeCloseTo(619.71, 2);
    expect(parseFloat(label.style.top)).toBeCloseTo(626.01, 2);
    expect(label.classList.contains("right")).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("province map", async () => {
    const element = document.createElement("data-view.china-map") as ChinaMap;
    element.province = "广东";
    element.dataSource = [
      {
        city: "深圳",
        text: "42",
      },
      {
        city: "潮州",
        text: "43",
      },
      {
        city: "未知",
        text: "44",
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      await (global as any).flushPromises();
    });

    const labels = element.shadowRoot.querySelectorAll(
      ".label"
    ) as NodeListOf<HTMLElement>;
    expect(labels.length).toBe(2);
    expect(labels[0].classList.contains("right")).toBe(true);
    expect(labels[1].classList.contains("left")).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("province not found", async () => {
    const element = document.createElement("data-view.china-map") as ChinaMap;
    element.province = "加利福利亚";

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(element.shadowRoot.querySelector(".error").textContent).toBe(
      'Error: 没有找到省份："加利福利亚"'
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("specific coordinates", async () => {
    const element = document.createElement("data-view.china-map") as ChinaMap;
    element.dataSource = [
      {
        text: "山东济南",
        coordinate: [117.1201, 36.6512],
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(element.shadowRoot.querySelector(".message")).toBe(null);

    const labels = element.shadowRoot.querySelectorAll(
      ".label"
    ) as NodeListOf<HTMLElement>;
    expect(labels.length).toBe(1);
    const label = labels[0];
    expect(parseFloat(label.style.left)).toBeCloseTo(678.87, 2);
    expect(parseFloat(label.style.top)).toBeCloseTo(392.36, 2);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
