import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";
import "./";
import type { ProjectKnowledges } from "./index.js";

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

  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.project-knowledges"
    ) as ProjectKnowledges;
    element.list = [
      {
        knowledgeId: "1",
        title: "Knowledge 1",
        time: 1757904096,
      },
      {
        knowledgeId: "2",
        title: "Knowledge 2",
        time: 1757863597,
        description: "This is a description",
      },
    ];

    const onActionClick = jest.fn();
    element.addEventListener("action.click", (event) => {
      onActionClick((event as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot?.querySelectorAll(".item").length).toBe(2);

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
