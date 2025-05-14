import { describe, test, expect, jest } from "@jest/globals";
import { fireEvent } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import "./";
import type { QuerySearch } from "./index.js";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-api-sdk/cmdb-sdk");
jest.mock("@next-core/react-runtime", () => ({
  useCurrentTheme: () => "dark-v2",
}));

const postSearchV3 = InstanceApi_postSearchV3 as jest.Mock<any>;
jest.mock("@next-core/runtime", () => ({
  getRuntime() {
    return {
      getCurrentApp: () => {
        return {
          id: "App",
        };
      },
    };
  },
  getHistory: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
jest.mock("@next-core/easyops-runtime", () => ({
  auth: {
    getAuth: () => {
      return {
        org: "8888",
      };
    },
  },
}));
jest.mock("@next-core/theme", () => ({}));

describe("nav.query-search", () => {
  test("basic usage", async () => {
    const element = document.createElement("nav.query-search") as QuerySearch;
    postSearchV3.mockResolvedValue({
      list: [
        {
          config: null,
          creator: "easyops",
          ctime: "2025-05-14 09:11:03",
          disabled: true,
          instanceId: "6350e390ee409",
          modifier: "easyops",
          name: "全文搜索",
          showInApps: ["HOST", "App"],
          type: "fullText",
        },
        {
          config: null,
          creator: "easyops",
          ctime: "2025-05-14 09:11:26",
          instanceId: "6350e3a6b000d",
          name: "ip搜索",
          showInApps: [],
          type: "ipSearch",
        },
        {
          config: null,
          creator: "easyops",
          ctime: "2025-05-14 09:11:54",
          instanceId: "6350e3c1a4715",
          name: "链接跳转测试",
          showInApps: [],
          type: "link",
        },
      ],
    });

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);
    const btn = element.shadowRoot?.querySelector("eo-button");
    expect(btn).toBeTruthy();

    jest
      .spyOn(document.documentElement, "clientWidth", "get")
      .mockImplementation(() => 2000);

    act(() => {
      fireEvent.click(btn as HTMLElement);
    });

    await act(async () => {
      await (global as any).flushPromises();
    });

    const input = element.shadowRoot?.querySelector(
      "input"
    ) as HTMLInputElement;
    expect(input).toBeTruthy();

    act(() => {
      fireEvent.change(input, { target: { value: "Hello" } });
      fireEvent.keyDown(input);
    });

    expect(input.value).toBe("Hello");

    await act(async () => {
      await (global as any).flushPromises();
    });

    jest
      .spyOn(document.documentElement, "clientWidth", "get")
      .mockImplementation(() => 100);
    act(() => {
      fireEvent.click(document.body);
    });

    expect(element.shadowRoot?.querySelector("input")).toBeFalsy();
    expect(element.shadowRoot?.querySelector("eo-button")).toBeTruthy();

    act(() => {
      fireEvent.keyDown(document.body, { key: "K" });
    });

    jest
      .spyOn(document.documentElement, "clientWidth", "get")
      .mockImplementation(() => 1000);
    act(() => {
      fireEvent.click(document.body);
    });

    act(() => {
      fireEvent.keyDown(document.body, { key: "K" });
    });

    jest
      .spyOn(document.documentElement, "clientWidth", "get")
      .mockImplementation(() => 100);
    act(() => {
      fireEvent.click(
        element.shadowRoot?.querySelector("eo-button") as HTMLElement
      );
    });
  });
});
