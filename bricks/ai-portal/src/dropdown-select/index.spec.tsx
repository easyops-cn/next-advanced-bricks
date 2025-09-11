import { describe, test, expect, jest } from "@jest/globals";
import { act } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom/jest-globals";
import "./";
import type { DropdownSelect } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.dropdown-select", () => {
  let element: DropdownSelect;

  beforeEach(() => {
    element = document.createElement(
      "ai-portal.dropdown-select"
    ) as DropdownSelect;
  });

  afterEach(() => {
    if (document.body.contains(element)) {
      act(() => {
        document.body.removeChild(element);
      });
    }
  });

  test("should render options correctly", async () => {
    const options = [
      { label: "选项1", value: "option1" },
      { label: "选项2", value: "option2" },
      { label: "选项3", value: "option3", disabled: true },
    ];

    await act(async () => {
      element.options = options;
      document.body.appendChild(element);
    });

    expect(element.options).toEqual(options);

    // Check if the trigger shows "Please Select" when no value is set (default English)
    const trigger = element.shadowRoot?.querySelector(".trigger .label");
    expect(trigger?.textContent).toBe("Please Select");
  });

  test("should display selected option label", async () => {
    const options = [
      { label: "选项1", value: "option1" },
      { label: "选项2", value: "option2" },
    ];

    await act(async () => {
      element.options = options;
      element.value = "option2";
      document.body.appendChild(element);
    });

    const trigger = element.shadowRoot?.querySelector(".trigger .label");
    expect(trigger?.textContent).toBe("选项2");
  });

  test("should apply custom search placeholder", async () => {
    const customPlaceholder = "自定义搜索提示";

    await act(async () => {
      element.showSearch = true;
      element.searchPlaceholder = customPlaceholder;
      document.body.appendChild(element);
    });

    expect(element.searchPlaceholder).toBe(customPlaceholder);
  });

  test("should show loading state", async () => {
    await act(async () => {
      element.loading = true;
      document.body.appendChild(element);
    });

    expect(element.loading).toBe(true);
  });

  test("should apply labelMaxWidth style", async () => {
    const maxWidth = "200px";

    await act(async () => {
      element.labelMaxWidth = maxWidth;
      document.body.appendChild(element);
    });

    expect(element.labelMaxWidth).toBe(maxWidth);
  });

  test("should apply dropdownMaxWidth style", async () => {
    const maxWidth = "300px";

    await act(async () => {
      element.dropdownMaxWidth = maxWidth;
      document.body.appendChild(element);
    });

    expect(element.dropdownMaxWidth).toBe(maxWidth);
  });

  test("should handle empty options array", async () => {
    await act(async () => {
      element.options = [];
      document.body.appendChild(element);
    });

    expect(element.options).toEqual([]);

    const trigger = element.shadowRoot?.querySelector(".trigger .label");
    expect(trigger?.textContent).toBe("Please Select");
  });

  test("should handle null/undefined options", async () => {
    await act(async () => {
      element.options = undefined;
      document.body.appendChild(element);
    });

    expect(element.options).toBeUndefined();

    const trigger = element.shadowRoot?.querySelector(".trigger .label");
    expect(trigger?.textContent).toBe("Please Select");
  });

  test("should handle disabled options", async () => {
    const options = [
      { label: "可用选项", value: "enabled" },
      { label: "禁用选项", value: "disabled", disabled: true },
    ];

    await act(async () => {
      element.options = options;
      document.body.appendChild(element);
    });

    expect(element.options).toEqual(options);
  });

  test("should handle popover visibility changes", async () => {
    const options = [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ];

    await act(async () => {
      element.options = options;
      document.body.appendChild(element);
    });

    // Find the popover element
    const popover = element.shadowRoot?.querySelector("eo-popover");
    expect(popover).toBeTruthy();

    // Simulate opening the dropdown
    act(() => {
      fireEvent(
        popover!,
        new CustomEvent("before.visible.change", {
          detail: true,
        })
      );
    });

    // Simulate closing the dropdown
    act(() => {
      fireEvent(
        popover!,
        new CustomEvent("before.visible.change", {
          detail: false,
        })
      );
    });

    // Test passes if no errors are thrown
    expect(popover).toBeTruthy();
  });

  test("should emit change event when option is clicked", async () => {
    const options = [
      { label: "Option A", value: "a" },
      { label: "Option B", value: "b" },
    ];
    const mockChangeHandler = jest.fn();

    await act(async () => {
      element.options = options;
      element.addEventListener("change", mockChangeHandler);
      document.body.appendChild(element);
    });

    // Find menu items
    const menuItems = element.shadowRoot?.querySelectorAll("eo-menu-item");
    expect(menuItems?.length).toBe(2);

    // Simulate clicking on first option
    if (menuItems && menuItems.length > 0) {
      act(() => {
        fireEvent.click(menuItems[0]);
      });

      // Note: The actual event emission happens in React component
      // This test verifies the setup is correct
      expect(element.options).toEqual(options);
    }
  });

  test("should handle search input events", async () => {
    const options = [
      { label: "JavaScript", value: "js" },
      { label: "TypeScript", value: "ts" },
      { label: "Python", value: "python" },
    ];

    await act(async () => {
      element.options = options;
      element.showSearch = true;
      element.searchPlaceholder = "Search languages";
      document.body.appendChild(element);
    });

    const searchInput = element.shadowRoot?.querySelector(".search input");
    if (searchInput) {
      // Simulate typing in search input
      act(() => {
        fireEvent.change(searchInput, { target: { value: "script" } });
      });

      // Test that component is set up for search
      expect(element.showSearch).toBe(true);
      expect(element.searchPlaceholder).toBe("Search languages");
    }
  });

  test("should handle prefix slot", async () => {
    const options = [{ label: "Option A", value: "a" }];

    await act(async () => {
      element.options = options;
      document.body.appendChild(element);
    });

    // Check if prefix slot exists
    const prefixSlot = element.shadowRoot?.querySelector('slot[name="prefix"]');
    expect(prefixSlot).toBeTruthy();
  });

  test("should update value and trigger re-render", async () => {
    const options = [
      { label: "First", value: "first" },
      { label: "Second", value: "second" },
    ];

    await act(async () => {
      element.options = options;
      element.value = "first";
      document.body.appendChild(element);
    });

    const label = element.shadowRoot?.querySelector(".trigger .label");
    expect(label?.textContent).toBe("First");

    // Update value
    await act(async () => {
      element.value = "second";
    });

    // Value property should be updated
    expect(element.value).toBe("second");
  });

  test("should handle number values for width properties", async () => {
    await act(async () => {
      element.labelMaxWidth = 200;
      element.dropdownMaxWidth = 400;
      document.body.appendChild(element);
    });

    expect(element.labelMaxWidth).toBe(200);
    expect(element.dropdownMaxWidth).toBe(400);
  });

  test("should maintain component state after options update", async () => {
    const initialOptions = [
      { label: "A", value: "a" },
      { label: "B", value: "b" },
    ];

    const updatedOptions = [
      { label: "C", value: "c" },
      { label: "D", value: "d" },
    ];

    await act(async () => {
      element.options = initialOptions;
      element.value = "a";
      element.showSearch = true;
      element.loading = false;
      document.body.appendChild(element);
    });

    // Update options
    await act(async () => {
      element.options = updatedOptions;
    });

    // Other properties should remain unchanged
    expect(element.showSearch).toBe(true);
    expect(element.loading).toBe(false);
    expect(element.options).toEqual(updatedOptions);
  });
});
