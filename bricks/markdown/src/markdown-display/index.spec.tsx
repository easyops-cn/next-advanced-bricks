import { describe, test, expect } from "@jest/globals";
import { act } from "react-dom/test-utils";
import "./";
import type { MarkdownDisplay } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

async function waitForContent(
  element: MarkdownDisplay,
  selector: string,
  timeout = 5000
): Promise<Element> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });
    const found = element.shadowRoot?.querySelector(selector);
    if (found) {
      return found;
    }
  }
  throw new Error(`Timeout waiting for selector: ${selector}`);
}

describe("eo-markdown-display", () => {
  test("should render with content", async () => {
    const element = document.createElement(
      "eo-markdown-display"
    ) as MarkdownDisplay;
    element.content = "# Hello World";

    act(() => {
      document.body.appendChild(element);
    });

    const h1 = await waitForContent(element, "h1");
    expect(h1?.textContent).toBe("Hello World");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render external links with target blank and icon", async () => {
    const element = document.createElement(
      "eo-markdown-display"
    ) as MarkdownDisplay;
    element.content = "[External Link](https://example.com)";

    act(() => {
      document.body.appendChild(element);
    });

    const link = await waitForContent(element, "a");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("nofollow noopener noreferrer");

    // Should have external link icon
    const icon = link.querySelector("eo-icon");
    expect(icon?.getAttribute("lib")).toBe("lucide");
    expect(icon?.getAttribute("icon")).toBe("external-link");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render internal links without target blank", async () => {
    const element = document.createElement(
      "eo-markdown-display"
    ) as MarkdownDisplay;
    element.content = "[Internal Link](/some/path)";

    act(() => {
      document.body.appendChild(element);
    });

    const link = await waitForContent(element, "a");
    expect(link.getAttribute("target")).toBeNull();
    expect(link.getAttribute("rel")).toBeNull();

    // Should not have external link icon
    const icon = link.querySelector("eo-icon");
    expect(icon).toBeNull();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should not add icon to external links with images", async () => {
    const element = document.createElement(
      "eo-markdown-display"
    ) as MarkdownDisplay;
    element.content =
      "[![Image](https://example.com/image.png)](https://example.com)";

    act(() => {
      document.body.appendChild(element);
    });

    const link = await waitForContent(element, "a");
    expect(link.getAttribute("target")).toBe("_blank");

    // Should not have external link icon since it contains an image
    const icon = link.querySelector("eo-icon");
    expect(icon).toBeNull();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should render code blocks with syntax highlighting", async () => {
    const element = document.createElement(
      "eo-markdown-display"
    ) as MarkdownDisplay;
    element.content = "```js\nconst a = 1;\n```";

    act(() => {
      document.body.appendChild(element);
    });

    // Should use presentational.code-wrapper for code blocks
    const codeWrapper = await waitForContent(
      element,
      "presentational\\.code-wrapper"
    );
    expect(codeWrapper).toBeTruthy();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("should pass themeVariant to code wrapper", async () => {
    const element = document.createElement(
      "eo-markdown-display"
    ) as MarkdownDisplay;
    element.content = "```js\nconst a = 1;\n```";
    element.themeVariant = "elevo";

    act(() => {
      document.body.appendChild(element);
    });

    const codeWrapper = await waitForContent(
      element,
      "presentational\\.code-wrapper"
    );
    expect(codeWrapper.getAttribute("themeVariant")).toBe("elevo");

    act(() => {
      document.body.removeChild(element);
    });
  });
});
