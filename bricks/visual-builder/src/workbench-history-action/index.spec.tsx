import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import "./";
import { WorkbenchHistoryAction } from "./index.js";
import { WorkspaceApi_getChangeHistory } from "@next-api-sdk/next-builder-sdk";

jest.mock("@next-core/theme", () => ({}));
jest.mock("@next-api-sdk/next-builder-sdk");

jest.useFakeTimers();

class MockEoPopover extends HTMLElement {
  changeActive(active: boolean) {
    this.dispatchEvent(
      new CustomEvent("before.visible.change", { detail: active })
    );
  }
}
customElements.define("eo-popover", MockEoPopover);

const mockGetChangeHistory = WorkspaceApi_getChangeHistory as jest.Mock<
  typeof WorkspaceApi_getChangeHistory
>;

describe("visual-builder.workbench-history-action", () => {
  test("load data", async () => {
    const element = document.createElement(
      "visual-builder.workbench-history-action"
    ) as WorkbenchHistoryAction;
    element.appId = "project-a";

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    expect(element.shadowRoot?.querySelector(".item-container")).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".empty").textContent).toBe(
      "NO_DATA"
    );
    expect(element.shadowRoot?.querySelector(".load-more")).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".end-container")).toBeFalsy();

    mockGetChangeHistory.mockImplementationOnce(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            list: Array(20)
              .fill(0)
              .map((v, i) => {
                return {
                  action: "add",
                  category: "brick",
                  abstract: {
                    nodes: ["div"],
                    nodeChanges: ["properties"],
                  },
                  ts: String(i + 1 * 10),
                };
              }) as any,
            ts: "200",
          });
        }, 1000);
      });
    });
    await act(async () => {
      (
        element.shadowRoot?.querySelector("eo-popover") as MockEoPopover
      ).changeActive(true);
    });
    expect(element.shadowRoot?.querySelector(".load-more")).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".end-container")).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".item-container")).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".empty").textContent).toBe(
      "LOADING"
    );

    await act(async () => {
      jest.runAllTimers();
    });
    expect(
      element.shadowRoot?.querySelector(".load-more").hasAttribute("disabled")
    ).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".empty")).toBeFalsy();
    expect(element.shadowRoot?.querySelectorAll(".item-container").length).toBe(
      20
    );

    mockGetChangeHistory.mockImplementationOnce(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            list: Array(5)
              .fill(0)
              .map((v, i) => {
                return {
                  action: "add",
                  category: "brick",
                  abstract: {
                    nodes: ["div"],
                    nodeChanges: ["properties"],
                  },
                  ts: String(i + 1 * 10 + 200),
                };
              }) as any,
            ts: "250",
          });
        }, 1000);
      });
    });
    await act(async () => {
      fireEvent.click(element.shadowRoot?.querySelector(".load-more"));
      jest.runAllTimers();
    });
    expect(element.shadowRoot?.querySelector(".load-more")).toBeFalsy();
    expect(element.shadowRoot?.querySelector(".end-container")).toBeTruthy();
    expect(element.shadowRoot?.querySelectorAll(".item-container").length).toBe(
      25
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("event", async () => {
    const onHistoryItemClick = jest.fn();
    const onRollback = jest.fn();
    const onRollbackAll = jest.fn();
    const element = document.createElement(
      "visual-builder.workbench-history-action"
    ) as WorkbenchHistoryAction;
    element.appId = "project-a";
    element.addEventListener("history.item.click", onHistoryItemClick);
    element.addEventListener("rollback", onRollback);
    element.addEventListener("rollback.all", onRollbackAll);

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBeGreaterThan(1);

    mockGetChangeHistory.mockImplementationOnce(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve({
            list: Array(5)
              .fill(0)
              .map((v, i) => {
                return {
                  action: "add",
                  category: "brick",
                  abstract: {
                    nodes: ["div"],
                    nodeChanges: ["properties"],
                  },
                  ts: String(i + 1 * 10),
                };
              }) as any,
            ts: "50",
          });
        }, 1000);
      });
    });
    await act(async () => {
      (
        element.shadowRoot?.querySelector("eo-popover") as MockEoPopover
      ).changeActive(true);
      jest.runAllTimers();
    });

    await act(async () => {
      fireEvent.click(
        element.shadowRoot?.querySelectorAll(".item-container .title-left")[0]
      );
    });
    expect(onHistoryItemClick).toHaveBeenLastCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          enableRollback: false,
          ts: "10",
        }),
      })
    );

    await act(async () => {
      fireEvent.click(
        element.shadowRoot?.querySelectorAll(".item-container .rollback")[0]
      );
    });
    expect(onRollback).toHaveBeenLastCalledWith(
      expect.objectContaining({
        detail: expect.objectContaining({
          ts: "11",
        }),
      })
    );

    await act(async () => {
      fireEvent.click(element.shadowRoot?.querySelector(".rollback-all"));
    });
    expect(onRollbackAll).toHaveBeenLastCalledWith(
      expect.objectContaining({
        detail: null,
      })
    );

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });
});
