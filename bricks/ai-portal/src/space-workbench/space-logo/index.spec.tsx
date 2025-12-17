import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { SpaceLogo } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.space-logo", () => {
  test("basic usage", async () => {
    const element = document.createElement("ai-portal.space-logo") as SpaceLogo;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("should render with default size", () => {
    const element = document.createElement("ai-portal.space-logo") as SpaceLogo;

    act(() => {
      document.body.appendChild(element);
    });

    const container = element.shadowRoot?.querySelector(
      ".space-logo"
    ) as HTMLElement;
    expect(container).toBeTruthy();
    // 默认 size 为 48px
    expect(container.style.width).toBe("48px");
    expect(container.style.height).toBe("48px");
    // borderRadius 为 size 的 25%，即 12px
    expect(container.style.borderRadius).toBe("12px");

    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.alt).toBe("Space Logo");
    // iconSize 为 size 的 87.5%，即 42px
    expect(img.style.width).toBe("42px");
    expect(img.style.height).toBe("42px");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render with custom size", () => {
    const element = document.createElement("ai-portal.space-logo") as SpaceLogo;
    element.size = 64;

    act(() => {
      document.body.appendChild(element);
    });

    const container = element.shadowRoot?.querySelector(
      ".space-logo"
    ) as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.style.width).toBe("64px");
    expect(container.style.height).toBe("64px");
    // borderRadius 为 64 * 0.25 = 16px
    expect(container.style.borderRadius).toBe("16px");

    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).toBeTruthy();
    // iconSize 为 64 * 0.875 = 56px
    expect(img.style.width).toBe("56px");
    expect(img.style.height).toBe("56px");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should update when size changes", async () => {
    const element = document.createElement("ai-portal.space-logo") as SpaceLogo;

    act(() => {
      document.body.appendChild(element);
    });

    let container = element.shadowRoot?.querySelector(
      ".space-logo"
    ) as HTMLElement;
    expect(container.style.width).toBe("48px");

    // 更新 size 属性并等待重新渲染
    await act(async () => {
      element.size = 80;
      // 等待下一帧渲染
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    container = element.shadowRoot?.querySelector(".space-logo") as HTMLElement;
    expect(container.style.width).toBe("80px");
    expect(container.style.height).toBe("80px");
    // borderRadius 为 80 * 0.25 = 20px
    expect(container.style.borderRadius).toBe("20px");

    const img = container.querySelector("img") as HTMLImageElement;
    // iconSize 为 80 * 0.875 = 70px
    expect(img.style.width).toBe("70px");
    expect(img.style.height).toBe("70px");

    act(() => {
      document.body.removeChild(element);
    });
  });
});
