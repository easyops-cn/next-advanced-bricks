import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";
import "./";
import type { ChatBox } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

customElements.define(
  "eo-icon",
  class extends HTMLElement {
    lib: string | undefined;
    prefix: any;
    icon: string | undefined;
  }
);

describe("ai-portal.chat-box", () => {
  test("basic usage", async () => {
    const element = document.createElement("ai-portal.chat-box") as ChatBox;

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

  test("auto focus", async () => {
    const element = document.createElement("ai-portal.chat-box") as ChatBox;
    element.autoFocus = true;
    element.placeholder = "Please enter your message";

    act(() => {
      document.body.appendChild(element);
    });

    const textarea = element.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();
    expect(textarea.placeholder).toBe("Please enter your message");
    const focus = jest.spyOn(textarea, "focus");

    await act(async () => {
      await Promise.resolve();
    });
    expect(focus).toHaveBeenCalled();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("submit by click", () => {
    const element = document.createElement("ai-portal.chat-box") as ChatBox;

    const onSubmit = jest.fn();
    element.addEventListener("message.submit", (e: Event) => {
      onSubmit((e as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    const textarea = element.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    act(() => {
      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.click(element.shadowRoot!.querySelector("button")!);
    });
    expect(onSubmit).toHaveBeenCalledWith("Hello");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("submit by enter", () => {
    const element = document.createElement("ai-portal.chat-box") as ChatBox;

    const onSubmit = jest.fn();
    element.addEventListener("message.submit", (e: Event) => {
      onSubmit((e as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    const textarea = element.shadowRoot?.querySelector(
      "textarea"
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    act(() => {
      fireEvent.change(textarea, { target: { value: "Hello" } });
      fireEvent.keyDown(textarea, { key: "Enter" });
    });
    expect(onSubmit).toHaveBeenCalledWith("Hello");

    act(() => {
      document.body.removeChild(element);
    });
  });
});
