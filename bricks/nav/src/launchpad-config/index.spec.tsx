import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import type { Action } from "@next-bricks/basic/actions";
import "./";
import type { LaunchpadConfig } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

jest.mock("@next-core/easyops-runtime", () => ({
  auth: {
    isBlockedPath(path: string) {
      return path.includes("blocked");
    },
    isBlockedHref(href: string) {
      return href.includes("blocked");
    },
  },
}));

class WithShadowElement extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    const slot = document.createElement("slot");
    shadow.append(slot);
  }
}

customElements.define(
  "eo-icon",
  class extends HTMLElement {
    lib: any;
    icon: any;
    theme: any;
    prefix: any;
    category: any;
  }
);

customElements.define(
  "eo-link",
  class extends WithShadowElement {
    url: any;
  }
);

customElements.define(
  "eo-dropdown-actions",
  class extends WithShadowElement {
    actions: any[] = [];
  }
);

describe("nav.launchpad-config", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "nav.launchpad-config"
    ) as LaunchpadConfig;
    element.menuGroups = [
      {
        instanceId: "g-1",
        name: "My Group",
        items: [
          {
            instanceId: "i-2",
            type: "app",
            name: "My App",
          },
        ],
      },
    ] as any;
    element.actions = [
      {
        event: "add-menu-item",
        text: "Add Menu Item",
      },
    ];
    const onActionClick = jest.fn();
    element.addEventListener("action.click", onActionClick);

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    fireEvent(
      element.shadowRoot?.querySelector("eo-dropdown-actions") as HTMLElement,
      new CustomEvent("visible.change", { detail: true })
    );
    expect(onActionClick).toHaveBeenCalledTimes(0);
    fireEvent(
      element.shadowRoot?.querySelector("eo-dropdown-actions") as HTMLElement,
      new CustomEvent("action.click")
    );
    expect(onActionClick).toHaveBeenCalledTimes(1);

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("launchpad config with license blocking", async () => {
    const element = document.createElement(
      "nav.launchpad-config"
    ) as LaunchpadConfig;
    element.menuGroups = [
      {
        instanceId: "g-1",
        name: "My Group 1",
        items: [
          {
            instanceId: "i-2",
            id: "my-app-2",
            type: "app",
            name: "My App 2",
          },
          {
            instanceId: "i-3",
            id: "my-app-3",
            type: "app",
            name: "My App 3",
            url: "/my-app",
          },
          {
            instanceId: "i-4",
            id: "my-app-4",
            type: "app",
            name: "My App 4",
            url: "/blocked-url",
          },
          {
            instanceId: "i-5",
            type: "dir",
            items: [
              {
                instanceId: "i-2",
                id: "my-custom-2",
                type: "custom",
                name: "My Custom 2",
              },
              {
                instanceId: "i-3",
                id: "my-custom-3",
                type: "custom",
                name: "My Custom 3",
                url: "/my-custom",
              },
              {
                instanceId: "i-4",
                id: "my-custom-4",
                type: "custom",
                name: "My Custom 4",
                url: "/blocked-url",
              },
            ],
          },
        ],
      },
      {
        instanceId: "g-2",
        name: "My Group 2",
        items: [
          {
            instanceId: "i-3",
            id: "my-custom-3",
            type: "custom",
            name: "My Custom 3",
            url: "/blocked-url",
          },
          {
            instanceId: "i-4",
            id: "my-app-4",
            type: "app",
            name: "My App 4",
            url: "/blocked-url-2",
          },
          {
            instanceId: "i-5",
            type: "dir",
            items: [
              {
                instanceId: "i-3",
                id: "my-custom-3",
                type: "custom",
                name: "My Custom 3",
                url: "/blocked-url",
              },
              {
                instanceId: "i-4",
                id: "my-app-4",
                type: "app",
                name: "My App 4",
                url: "/blocked-url-2",
              },
            ],
          },
        ],
      },
    ] as any;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".menu-group").length).toBe(1);
    expect(
      element.shadowRoot?.querySelectorAll(".menu-item.folder").length
    ).toBe(1);
    expect(element.shadowRoot?.querySelectorAll(".menu-item").length).toBe(5);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("menu config", async () => {
    const element = document.createElement(
      "nav.launchpad-config"
    ) as LaunchpadConfig;
    element.menuGroups = [
      {
        instanceId: "g-1",
        name: "My Group",
        items: [
          {
            instanceId: "i-2",
            id: "my-app",
            type: "app",
            name: "My App",
          },
          {
            instanceId: "i-3",
            id: "my-custom",
            type: "custom",
            name: "My Custom",
            url: "http://localhost/next/my-custom",
          },
          {
            instanceId: "i-4",
            id: "my-custom-2",
            type: "custom",
            name: "My External Custom",
            url: "http://example.com/next/external-custom",
          },
        ],
      },
    ] as any;
    element.variant = "menu-config";
    element.urlTemplate = "/test/{{ id }}";
    element.customUrlTemplate = "/custom?url={{ __pathname }}";
    act(() => {
      document.body.appendChild(element);
    });

    expect(
      element.shadowRoot?.querySelectorAll("eo-dropdown-actions").length
    ).toBe(0);
    expect(
      element.shadowRoot
        ?.querySelectorAll(".menu-item")[0]
        .classList.contains("disabled")
    ).toBe(false);
    expect(
      element.shadowRoot
        ?.querySelectorAll(".menu-item")[1]
        .classList.contains("disabled")
    ).toBe(false);
    expect(
      element.shadowRoot
        ?.querySelectorAll(".menu-item")[2]
        .classList.contains("disabled")
    ).toBe(true);
    expect(
      element.shadowRoot?.querySelectorAll(".menu-item eo-link")[0]
    ).toHaveProperty("url", "/test/my-app");
    expect(
      element.shadowRoot?.querySelectorAll(".menu-item eo-link")[1]
    ).toHaveProperty("url", "/custom?url=%2Fnext%2Fmy-custom");
    expect(
      element.shadowRoot?.querySelectorAll(".menu-item eo-link")[2]
    ).toHaveProperty("url", "");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("blacklist config", async () => {
    const element = document.createElement(
      "nav.launchpad-config"
    ) as LaunchpadConfig;
    element.menuGroups = [
      {
        instanceId: "g-0",
        name: "My Empty Group",
        items: [],
      },
      {
        instanceId: "g-1",
        name: "My Partial Blocked Group",
        items: [
          {
            instanceId: "i-0",
            id: "my-app-0",
            type: "app",
            name: "My App 0",
            // No url
          },
          {
            instanceId: "i-1",
            id: "my-app-1",
            type: "app",
            name: "My App 1",
            url: "/my-app-1",
          },
          {
            instanceId: "i-2",
            id: "my-custom-2",
            type: "custom",
            name: "My Custom 2",
            url: "http://localhost/next/blocked-url",
          },
          {
            instanceId: "i-3",
            id: "blocked-app",
            type: "app",
            name: "Blocked App",
            url: "/blocked-app",
          },
          {
            instanceId: "i-4",
            id: "my-custom-4",
            type: "custom",
            name: "My Custom 4",
            url: "/next/blocked-url?tab=abc",
          },
          {
            instanceId: "i-5",
            id: "my-dir-5",
            type: "dir",
            items: [
              {
                instanceId: "i-0",
                id: "my-app-0",
                type: "app",
                name: "My App 0",
                // No url
              },
              {
                instanceId: "i-1",
                id: "my-app-1",
                type: "app",
                name: "My App 1",
                url: "/my-app-1",
              },
              {
                instanceId: "i-2",
                id: "my-custom-2",
                type: "custom",
                name: "My Custom 2",
                url: "http://localhost/next/blocked-url",
              },
              {
                instanceId: "i-3",
                id: "blocked-app",
                type: "app",
                name: "Blocked App",
                url: "/blocked-app",
              },
              {
                instanceId: "i-4",
                id: "my-custom-4",
                type: "custom",
                name: "My Custom 4",
                url: "/next/blocked-url",
              },
            ],
          },
        ],
      },
      {
        instanceId: "g-2",
        name: "My All Blocked Group",
        items: [
          {
            instanceId: "i-3",
            id: "blocked-app",
            type: "app",
            name: "Blocked App",
            url: "/blocked-app",
          },
          {
            instanceId: "i-4",
            id: "my-custom-4",
            type: "custom",
            name: "My Custom 4",
            url: "/next/blocked-url",
          },
          {
            instanceId: "i-5",
            id: "my-dir-5",
            type: "dir",
            items: [
              {
                instanceId: "i-3",
                id: "blocked-app",
                type: "app",
                name: "Blocked App",
                url: "/blocked-app",
              },
              {
                instanceId: "i-4",
                id: "my-custom-4",
                type: "custom",
                name: "My Custom 4",
                url: "/next/blocked-url",
              },
            ],
          },
        ],
      },
    ] as any;
    element.variant = "blacklist-config";
    element.blacklist = [
      "/blocked-app",
      "/blocked-url" /* , "/blocked-sub-app", "/blocked-sub-url" */,
    ];
    element.actions = [
      {
        text: "屏蔽产品功能",
        event: "block",
        if: "<% DATA.blockable %>",
        disabled: "<% !DATA.hasUnblocked %>",
      },
      {
        text: "恢复产品功能",
        event: "unblock",
        if: "<% DATA.blockable %>",
        disabled: "<% !DATA.hasBlocked %>",
      },
    ] as unknown as Action[];
    act(() => {
      document.body.appendChild(element);
    });

    expect(
      [...element.shadowRoot!.querySelectorAll(".menu-group")].map((group) =>
        group.classList.contains("blocked")
      )
    ).toEqual([false, false, true]);

    expect(
      [
        ...element.shadowRoot!.querySelectorAll(
          ".menu-group:nth-child(2) > .menu > .menu-item"
        ),
      ].map(
        (item) =>
          item.classList.contains("disabled") ||
          item.classList.contains("blocked")
      )
    ).toEqual([false, false, false, true, true, false]);

    expect(
      [
        ...element.shadowRoot!.querySelectorAll(
          ".menu-group:nth-child(3) > .menu > .menu-item"
        ),
      ].map(
        (item) =>
          item.classList.contains("disabled") ||
          item.classList.contains("blocked")
      )
    ).toEqual([true, true, true]);

    expect(
      [...element.shadowRoot!.querySelectorAll(".menu-group")].map(
        (group) => !!group.querySelector("eo-dropdown-actions")
      )
    ).toEqual([false, true, true]);

    expect(
      [
        ...element.shadowRoot!.querySelectorAll(
          ".menu-group:nth-child(2) > .menu > .menu-item, .menu-group:nth-child(2) > .menu > .menu-item > .menu-folder-label-wrapper"
        ),
      ].map((item) => !!item.querySelector("eo-dropdown-actions"))
    ).toEqual([false, true, false, true, true, true, true]);

    expect(
      [
        ...element.shadowRoot!.querySelectorAll(
          ".menu-group:nth-child(3) > .menu > .menu-item, .menu-group:nth-child(2) > .menu > .menu-item > .menu-folder-label-wrapper"
        ),
      ].map((item) => !!item.querySelector("eo-dropdown-actions"))
    ).toEqual([true, true, true, true]);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
