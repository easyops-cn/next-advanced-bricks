import React from "react";
import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { fireEvent } from "@testing-library/react";
import "./";
import type { CodeWrapper } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

customElements.define(
  "eo-button",
  class extends HTMLElement {
    icon: unknown;
  }
);

const copyToClipboard = jest.fn(
  () => new Promise((resolve) => setTimeout(resolve, 1))
);
customElements.define(
  "basic.copy-to-clipboard",
  class extends HTMLElement {
    resolve = copyToClipboard;
  }
);

describe("presentational.code-wrapper", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test("basic usage", async () => {
    const element = document.createElement(
      "presentational.code-wrapper"
    ) as CodeWrapper;

    element.preProps = {
      className: "shiki",
      children: <code>{'console.log("Hello");'}</code>,
    };

    act(() => {
      document.body.appendChild(element);
    });

    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector("eo-button")!);
    });

    act(() => {
      jest.advanceTimersByTime(1);
    });
    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(element.shadowRoot!.querySelector("eo-button")!).toHaveProperty(
      "icon",
      {
        lib: "fa",
        prefix: "fas",
        icon: "check",
      }
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(element.shadowRoot!.querySelector("eo-button")!).toHaveProperty(
      "icon",
      {
        lib: "fa",
        prefix: "far",
        icon: "copy",
      }
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("copy failed", async () => {
    const consoleError = jest.spyOn(console, "error").mockReturnValue();
    const element = document.createElement(
      "presentational.code-wrapper"
    ) as CodeWrapper;

    element.preProps = {
      children: <code>{'console.log("Hello");'}</code>,
    };

    act(() => {
      document.body.appendChild(element);
    });

    copyToClipboard.mockImplementationOnce(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Failed")), 1)
        )
    );
    act(() => {
      fireEvent.click(element.shadowRoot!.querySelector("eo-button")!);
    });

    act(() => {
      jest.advanceTimersByTime(1);
    });
    await act(async () => {
      await (global as any).flushPromises();
    });

    expect(element.shadowRoot!.querySelector("eo-button")!).toHaveProperty(
      "icon",
      {
        lib: "fa",
        prefix: "fas",
        icon: "triangle-exclamation",
      }
    );
    expect(consoleError).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(element.shadowRoot!.querySelector("eo-button")!).toHaveProperty(
      "icon",
      {
        lib: "fa",
        prefix: "far",
        icon: "copy",
      }
    );

    act(() => {
      document.body.removeChild(element);
    });
    consoleError.mockRestore();
  });

  test("disable copy button", async () => {
    const element = document.createElement(
      "presentational.code-wrapper"
    ) as CodeWrapper;

    element.preProps = {
      className: "mermaid",
      children: <code>{'console.log("Hello");'}</code>,
    };
    element.showCopyButton = false;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.shadowRoot!.querySelector("eo-button")!).toBeNull();
    expect(element.shadowRoot!.querySelector("pre")!.getAttribute("part")).toBe(
      "pre mermaid"
    );

    act(() => {
      document.body.removeChild(element);
    });
  });
});
