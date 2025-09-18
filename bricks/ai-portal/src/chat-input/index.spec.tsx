import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/dom";
import "./";
import type { ChatInput } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

customElements.define("eo-icon", class extends HTMLElement {});
customElements.define(
  "ai-portal.icon-button",
  class extends HTMLElement {
    disabled: boolean | undefined;
  }
);

describe("ai-portal.chat-input", () => {
  test("basic usage", async () => {
    const element = document.createElement("ai-portal.chat-input") as ChatInput;

    const onMessageSubmit = jest.fn();
    element.addEventListener("message.submit", (e) => {
      onMessageSubmit((e as CustomEvent).detail);
    });

    act(() => {
      document.body.appendChild(element);
    });

    expect(document.activeElement).toBe(document.body);
    fireEvent.click(element.shadowRoot!.querySelector(".container")!);
    expect(element.shadowRoot!.activeElement).toBe(
      element.shadowRoot!.querySelector("textarea")
    );

    fireEvent.keyDown(element.shadowRoot!.querySelector("textarea")!, {
      key: "Enter",
    });
    expect(onMessageSubmit).toHaveBeenCalledTimes(0);

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("with in canvas", async () => {
    const element = document.createElement("ai-portal.chat-input") as ChatInput;
    element.autoFocus = true;
    element.supportsTerminate = true;

    const onMessageSubmit = jest.fn();
    const onTerminate = jest.fn();
    element.addEventListener("message.submit", (e) => {
      onMessageSubmit((e as CustomEvent).detail);
    });
    element.addEventListener("terminate", () => {
      onTerminate();
    });

    act(() => {
      document.body.appendChild(element);
    });

    // Submit ignored when no value in textarea
    fireEvent.click(element.shadowRoot!.querySelector(".btn-send")!);
    expect(onMessageSubmit).toHaveBeenCalledTimes(0);

    // Submit with value in textarea
    act(() => {
      fireEvent.change(element.shadowRoot!.querySelector("textarea")!, {
        target: { value: "test message" },
      });
      fireEvent.click(element.shadowRoot!.querySelector(".btn-send")!);
    });
    expect(onMessageSubmit).toHaveBeenCalledTimes(1);
    expect(onMessageSubmit).toHaveBeenCalledWith("test message");

    element.submitDisabled = true;
    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(element.shadowRoot?.querySelector(".btn-send")).toBe(null);
    fireEvent.click(
      element.shadowRoot!.querySelector("ai-portal\\.icon-button")!
    );
    expect(onTerminate).toHaveBeenCalledTimes(1);

    element.terminating = true;
    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(
      element.shadowRoot!.querySelector("ai-portal\\.icon-button")!
    ).toHaveProperty("disabled", true);

    act(() => {
      document.body.removeChild(element);
    });
  });
});
