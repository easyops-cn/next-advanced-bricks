import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { NoticeList } from "./index.js";
import type { NoticeItem } from "../notice-dropdown/index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.notice-list", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.notice-list"
    ) as NoticeList;

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

  test("should render empty state when no data", async () => {
    const element = document.createElement(
      "ai-portal.notice-list"
    ) as NoticeList;

    act(() => {
      document.body.appendChild(element);
    });

    const emptyState = element.shadowRoot?.querySelector(".empty-state");
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toBe("No messages");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render notice list and handle item selection", async () => {
    const element = document.createElement(
      "ai-portal.notice-list"
    ) as NoticeList;
    const mockData: NoticeItem[] = [
      {
        id: "1",
        title: "Test Notice 1",
        time: 1704067200000,
        type: "info",
        isRead: false,
      },
      {
        id: "2",
        title: "Test Notice 2",
        time: 1703980800000,
        type: "warning",
        isRead: false,
      },
    ];

    act(() => {
      element.dataSource = mockData;
      document.body.appendChild(element);
    });

    const messageList = element.shadowRoot?.querySelector(".message-list");
    expect(messageList).toBeTruthy();

    const listItems =
      element.shadowRoot?.querySelectorAll(".message-item-link");
    expect(listItems?.length).toBe(2);
    expect(listItems?.[0]?.textContent).toContain("Test Notice 1");
    expect(listItems?.[1]?.textContent).toContain("Test Notice 2");

    // Test individual checkbox
    const itemCheckboxes =
      element.shadowRoot?.querySelectorAll(".item-checkbox");
    expect(itemCheckboxes?.length).toBe(2);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should emit events for notice click, mark items read and mark all read", async () => {
    const element = document.createElement(
      "ai-portal.notice-list"
    ) as NoticeList;
    const mockData: NoticeItem[] = [
      {
        id: "1",
        title: "Test Notice 1",
        time: 1704067200000,
        type: "info",
        isRead: false,
      },
    ];

    const noticeClickListener = jest.fn();
    const markItemsReadListener = jest.fn();
    const markAllReadListener = jest.fn();

    element.addEventListener("notice.click", noticeClickListener);
    element.addEventListener("mark.items.read", markItemsReadListener);
    element.addEventListener("mark.all.read", markAllReadListener);

    act(() => {
      element.dataSource = mockData;
      document.body.appendChild(element);
    });

    // Test notice click
    const noticeLink = element.shadowRoot?.querySelector(
      ".message-item-link"
    ) as HTMLElement;
    act(() => {
      noticeLink?.click();
    });
    expect(noticeClickListener).toHaveBeenCalledTimes(1);
    expect(
      (noticeClickListener.mock.calls[0][0] as CustomEvent).detail
    ).toEqual(mockData[0]);

    // Test mark all read button
    const markAllReadButton = element.shadowRoot?.querySelectorAll(
      ".read-link"
    )[1] as HTMLElement;
    act(() => {
      markAllReadButton?.click();
    });
    expect(markAllReadListener).toHaveBeenCalledTimes(1);

    // Test mark items read button (need to select items first)
    const allCheckbox = element.shadowRoot?.querySelector(
      ".all-checkbox"
    ) as any;
    act(() => {
      allCheckbox?.dispatchEvent(
        new CustomEvent("change", { detail: ["selectAll"] })
      );
    });

    const markItemsReadButton = element.shadowRoot?.querySelectorAll(
      ".read-link"
    )[0] as HTMLElement;
    act(() => {
      markItemsReadButton?.click();
    });
    expect(markItemsReadListener).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should handle select all functionality", async () => {
    const element = document.createElement(
      "ai-portal.notice-list"
    ) as NoticeList;
    const mockData: NoticeItem[] = [
      {
        id: "1",
        title: "Test Notice 1",
        time: 1704067200000,
        type: "info",
        isRead: false,
      },
      {
        id: "2",
        title: "Test Notice 2",
        time: 1703980800000,
        type: "warning",
        isRead: false,
      },
      {
        id: "3",
        title: "Test Notice 3",
        time: 1703894400000,
        type: "error",
        isRead: true,
      },
    ];

    act(() => {
      element.dataSource = mockData;
      document.body.appendChild(element);
    });

    // Initially mark items read button should be disabled
    const markItemsReadButton = element.shadowRoot?.querySelectorAll(
      ".read-link"
    )[0] as any;
    expect(markItemsReadButton.hasAttribute("disabled")).toBe(true);

    // Select all items
    const allCheckbox = element.shadowRoot?.querySelector(
      ".all-checkbox"
    ) as any;
    act(() => {
      allCheckbox?.dispatchEvent(
        new CustomEvent("change", { detail: ["selectAll"] })
      );
    });

    // Now mark items read button should be enabled
    expect(markItemsReadButton.hasAttribute("disabled")).toBe(false);

    // Click mark items read button to verify only unread items are selected
    const markItemsReadListener = jest.fn();
    element.addEventListener("mark.items.read", markItemsReadListener);

    act(() => {
      markItemsReadButton?.click();
    });

    // Should only mark unread items (id: 1 and 2), not the read item (id: 3)
    expect(markItemsReadListener).toHaveBeenCalledTimes(1);
    const markedItems = (markItemsReadListener.mock.calls[0][0] as CustomEvent)
      .detail;
    expect(markedItems).toHaveLength(2);
    expect(markedItems.map((item: NoticeItem) => item.id)).toEqual(["1", "2"]);
    // All marked items should be unread (isRead: false)
    expect(markedItems.some((item: NoticeItem) => item.isRead)).toBe(false);

    // Deselect all
    act(() => {
      allCheckbox?.dispatchEvent(new CustomEvent("change", { detail: [] }));
    });

    // Button should be disabled again
    expect(markItemsReadButton.hasAttribute("disabled")).toBe(true);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
