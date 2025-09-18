import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";
import "./";
import type { ProjectConversations } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("ai-portal.project-conversations", () => {
  test("loading", async () => {
    const element = document.createElement(
      "ai-portal.project-conversations"
    ) as ProjectConversations;

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

  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.project-conversations"
    ) as ProjectConversations;
    element.list = [
      {
        conversationId: "1",
        title: "Conversation 1",
        startTime: 1757904096,
        goalInstanceId: "g-05",
      },
      {
        conversationId: "2",
        title: "Conversation 2",
        startTime: 1757863597,
        description: "This is a description",
      },
    ];
    element.goals = [{ instanceId: "g-05", title: "GOAL0005" }];

    const onGoalClick = jest.fn();
    element.addEventListener("goal.click", (event) => {
      onGoalClick((event as CustomEvent).detail);
    });
    const onActionClick = jest.fn();
    element.addEventListener("action.click", (event) => {
      onActionClick((event as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".item").length).toBe(2);

    fireEvent.click(element.shadowRoot!.querySelector(".goal")!);
    expect(onGoalClick).toHaveBeenCalledWith(element.list![0]);

    fireEvent(
      element.shadowRoot!.querySelectorAll(".actions")[0],
      new CustomEvent("action.click", {
        detail: { type: "delete", text: "Delete" },
      })
    );

    expect(onActionClick).toHaveBeenCalledWith({
      action: { type: "delete", text: "Delete" },
      item: element.list![0],
    });

    act(() => {
      document.body.removeChild(element);
    });
  });
});
