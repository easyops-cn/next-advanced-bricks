import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import { NoticeItem } from "../shared/interfaces.js";
import type { NoticeDropdown } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.notice-dropdown", () => {
  test("should render with all properties and handle all icon types", async () => {
    const element = document.createElement(
      "ai-portal.notice-dropdown"
    ) as NoticeDropdown;

    const mockData: NoticeItem[] = [
      {
        id: "1",
        type: "project",
        isUnread: true,
        title: "项目通知",
        description: "项目描述",
      },
      {
        id: "2",
        type: "account",
        isUnread: false,
        title: "账号通知",
        description: "账号描述",
      },
      {
        id: "3",
        type: "system",
        isUnread: true,
        title: "系统通知",
        description: "系统描述",
      },
      {
        id: "4",
        type: "space",
        isUnread: false,
        title: "空间通知",
        description: "空间描述",
      },
      {
        id: "5",
        type: "unknown",
        isUnread: true,
        title: "未知类型",
        description: "",
      },
    ];

    element.dataSource = mockData;
    element.popoverPlacement = "bottom-start";
    element.urlTemplate = "/notice/{{id}}";
    element.notifyCenterUrl = "/notice-center";
    element.dropdownMaxWidth = "500px";
    element.emptyText = "自定义空状态文案";
    element.hideNotifyCenterButton = false;
    element.dropdownContentStyle = { padding: "20px", maxHeight: "300px" };

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot).toBeTruthy();
    expect(element.dataSource).toEqual(mockData);
    expect(element.popoverPlacement).toBe("bottom-start");
    expect(element.urlTemplate).toBe("/notice/{{id}}");
    expect(element.dropdownMaxWidth).toBe("500px");

    // Verify all icon types are rendered
    const icons = element.shadowRoot?.querySelectorAll(".icon-wrapper eo-icon");
    expect(icons?.length).toBe(5);

    // Verify secondary-text is not rendered for empty description
    const secondaryTexts =
      element.shadowRoot?.querySelectorAll(".secondary-text");
    expect(secondaryTexts?.length).toBe(4); // Only 4 items have description

    // Verify dropdown style applied
    const contentDiv = element.shadowRoot?.querySelector(
      ".content"
    ) as HTMLElement;
    expect(contentDiv?.style.padding).toBe("20px");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle empty state, undefined dataSource and button visibility", async () => {
    const element = document.createElement(
      "ai-portal.notice-dropdown"
    ) as NoticeDropdown;

    element.dataSource = [];
    element.emptyText = "暂无新消息";
    element.hideNotifyCenterButton = true;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot).toBeTruthy();
    expect(element.dataSource).toEqual([]);
    expect(element.emptyText).toBe("暂无新消息");
    expect(element.hideNotifyCenterButton).toBe(true);

    // Test with undefined dataSource
    act(() => {
      element.dataSource = undefined;
      element.hideNotifyCenterButton = false;
    });

    expect(element.dataSource).toBeUndefined();

    // Verify message center button shows when not hidden
    const buttons = element.shadowRoot?.querySelectorAll(
      ".footer .footer-button"
    );
    expect(buttons?.length).toBeGreaterThan(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit events and handle DOM interactions", async () => {
    const element = document.createElement(
      "ai-portal.notice-dropdown"
    ) as NoticeDropdown;

    const mockData: NoticeItem[] = [
      {
        id: "notice-1",
        type: "project",
        isUnread: true,
        title: "测试通知",
        description: "测试描述",
      },
    ];

    element.dataSource = mockData;
    element.urlTemplate = "/notice/{{id}}";

    const noticeClickHandler = jest.fn();
    const markAllReadHandler = jest.fn();

    element.addEventListener("notice.click", ((e: CustomEvent) => {
      noticeClickHandler(e.detail);
    }) as any);

    element.addEventListener("mark.all.read", markAllReadHandler as any);

    act(() => {
      document.body.appendChild(element);
    });

    // Test notice.click through event dispatch
    element.dispatchEvent(
      new CustomEvent("notice.click", { detail: "notice-1" })
    );
    expect(noticeClickHandler).toHaveBeenCalledWith("notice-1");

    // Test mark.all.read through event dispatch
    element.dispatchEvent(new CustomEvent("mark.all.read"));
    expect(markAllReadHandler).toHaveBeenCalled();

    // Test notice click through DOM interaction
    const linkElements = element.shadowRoot?.querySelectorAll("eo-link");
    if (linkElements && linkElements.length > 0) {
      act(() => {
        (linkElements[0] as any).click();
      });
      expect(noticeClickHandler).toHaveBeenCalledTimes(2);
    }

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle mark all read button click and close button", async () => {
    const element = document.createElement(
      "ai-portal.notice-dropdown"
    ) as NoticeDropdown;

    const mockData: NoticeItem[] = [
      {
        id: "1",
        type: "system",
        isUnread: true,
        title: "通知",
        description: "描述",
      },
    ];

    element.dataSource = mockData;

    const markAllReadHandler = jest.fn();
    element.addEventListener("mark.all.read", markAllReadHandler as any);

    act(() => {
      document.body.appendChild(element);
    });

    // Test mark all read button click
    const buttons = element.shadowRoot?.querySelectorAll(
      ".footer .footer-button"
    );
    const markAllReadButton = buttons?.[0];

    if (markAllReadButton) {
      act(() => {
        (markAllReadButton as any).click();
      });
      expect(markAllReadHandler).toHaveBeenCalled();
    }

    // Test close button click
    const closeBtn = element.shadowRoot?.querySelector(".close-btn");
    expect(closeBtn).toBeTruthy();

    if (closeBtn) {
      act(() => {
        (closeBtn as HTMLElement).click();
      });
    }

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle popover visibility change", async () => {
    const element = document.createElement(
      "ai-portal.notice-dropdown"
    ) as NoticeDropdown;

    element.dataSource = [
      {
        id: "1",
        type: "space",
        isUnread: true,
        title: "通知",
        description: "描述",
      },
    ];

    act(() => {
      document.body.appendChild(element);
    });

    const popover = element.shadowRoot?.querySelector("eo-popover");
    expect(popover).toBeTruthy();

    if (popover) {
      // Test visibility change to true
      act(() => {
        popover.dispatchEvent(
          new CustomEvent("before.visible.change", { detail: true })
        );
      });

      // Test visibility change to false
      act(() => {
        popover.dispatchEvent(
          new CustomEvent("before.visible.change", { detail: false })
        );
      });
    }

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle dropdownMaxWidth with different value types", async () => {
    const element = document.createElement(
      "ai-portal.notice-dropdown"
    ) as NoticeDropdown;

    element.dataSource = [];

    // Test with string value
    element.dropdownMaxWidth = "500px";

    act(() => {
      document.body.appendChild(element);
    });

    let contentDiv = element.shadowRoot?.querySelector(
      ".notice-dropdown-content"
    ) as HTMLElement;
    expect(contentDiv?.style.maxWidth).toBe("500px");

    // Test with number value
    act(() => {
      element.dropdownMaxWidth = 400;
    });

    contentDiv = element.shadowRoot?.querySelector(
      ".notice-dropdown-content"
    ) as HTMLElement;
    expect(contentDiv).toBeTruthy();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
