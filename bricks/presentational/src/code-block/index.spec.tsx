import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import { waitFor } from "@testing-library/react";
import "./";
import "../code-wrapper";
import type { CodeBlock } from "./index.js";

jest.mock("@next-core/theme", () => ({}));

describe("presentational.code-block", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "presentational.code-block"
    ) as CodeBlock;
    element.language = "js";
    element.source = "console.log('Hello');";

    act(() => {
      document.body.appendChild(element);
    });
    expect(element.shadowRoot?.childNodes).toMatchInlineSnapshot(`
      NodeList [
        <style>
          styles.shadow.css
        </style>,
        <eo-icon
          class="loading"
          icon="loader-circle"
          lib="lucide"
          spinning=""
        />,
      ]
    `);

    await waitFor(
      () => {
        expect(
          element.shadowRoot?.querySelector("presentational\\.code-wrapper")
        ).toBeTruthy();
      },
      {
        timeout: 3000,
      }
    );

    expect(
      element.shadowRoot?.querySelector("presentational\\.code-wrapper")
        ?.shadowRoot.childNodes
    ).toMatchSnapshot();

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("mermaid in markdown", async () => {
    const element = document.createElement(
      "presentational.code-block"
    ) as CodeBlock;
    element.language = "md";
    element.source =
      "```mermaid\nsequenceDiagram\n    Alice->>John: Hello John, how are you?\n    John-->>Alice: Great!\n```";
    element.theme = "dark-plus";
    element.themeVariant = "elevo";
    element.showCopyButton = false;

    expect(element.shadowRoot).toBeFalsy();

    act(() => {
      document.body.appendChild(element);
    });

    await waitFor(
      () => {
        expect(
          element.shadowRoot?.querySelector("presentational\\.code-wrapper")
        ).toBeTruthy();
      },
      {
        timeout: 3000,
      }
    );

    expect(
      element.shadowRoot?.querySelector("presentational\\.code-wrapper")
        ?.shadowRoot.childNodes
    ).toMatchSnapshot();

    act(() => {
      document.body.removeChild(element);
    });
  });
});
