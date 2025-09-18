import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";
import "./";
import type { ProjectKnowledges } from "./index.js";
import type { ActionType } from "@next-bricks/basic/mini-actions";
jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.project-knowledges", () => {
  test("loading", async () => {
    const element = document.createElement(
      "ai-portal.project-knowledges"
    ) as ProjectKnowledges;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.querySelector(".loading")).toBeTruthy();

    act(() => {
      document.body.removeChild(element);
    });
    expect(element.shadowRoot?.childNodes.length).toBe(0);
  });

  test("basic usage with actions", async () => {
    const element = document.createElement(
      "ai-portal.project-knowledges"
    ) as ProjectKnowledges;
    element.list = [
      {
        instanceId: "1",
        name: "Knowledge 1",
        time: 1757904096,
        user: "user1",
      },
      {
        instanceId: "2",
        name: "Knowledge 2",
        time: 1757863597,
        description: "This is a description",
        user: "user2",
      },
    ];
    element.actions = [
      { text: "Delete", event: "delete.click" },
    ] as ActionType[];
    element.urlTemplate = "/knowledge/#{instanceId}";

    const onActionClick = jest.fn();
    const onItemClick = jest.fn();

    element.addEventListener("action.click", (event) => {
      onActionClick((event as CustomEvent).detail);
    });

    element.addEventListener("item.click", (event) => {
      onItemClick((event as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".item").length).toBe(2);
    expect(element.shadowRoot?.querySelector(".title")?.textContent).toBe(
      "Knowledge 1"
    );
    expect(element.shadowRoot?.querySelector(".description")?.textContent).toBe(
      "This is a description"
    );

    fireEvent(
      element.shadowRoot!.querySelectorAll(".actions")[0],
      new CustomEvent("action.click", {
        detail: { text: "Delete", event: "delete.click" },
      })
    );

    expect(onActionClick).toHaveBeenCalledWith({
      action: { text: "Delete", event: "delete.click" },
      item: element.list![0],
    });

    fireEvent.click(element.shadowRoot!.querySelectorAll(".link")[0]);
    expect(onItemClick).toHaveBeenCalledWith(element.list![0]);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("actions visibility change", async () => {
    const element = document.createElement(
      "ai-portal.project-knowledges"
    ) as ProjectKnowledges;
    element.list = [
      {
        instanceId: "1",
        name: "Knowledge 1",
        time: 1757904096,
      },
    ];
    element.actions = [{ text: "Edit", event: "edit.click" }] as any;

    act(() => {
      document.body.appendChild(element);
    });

    const linkElement = element.shadowRoot?.querySelector(".link");
    expect(linkElement).toBeTruthy();

    act(() => {
      fireEvent(
        element.shadowRoot!.querySelector(".actions")!,
        new CustomEvent("visible.change", {
          detail: true,
        })
      );
    });

    expect(linkElement?.classList.contains("actions-active")).toBeTruthy();

    act(() => {
      fireEvent(
        element.shadowRoot!.querySelector(".actions")!,
        new CustomEvent("visible.change", {
          detail: false,
        })
      );
    });

    expect(linkElement?.classList.contains("actions-active")).toBeFalsy();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
