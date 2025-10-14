import { describe, test, expect, jest } from "@jest/globals";
import { act } from "react-dom/test-utils";
import type { EoPageTitle } from "@next-bricks/basic/page-title";
import type { ModulePartOfComponent, ParsedApp } from "@next-shared/tsx-parser";
import "./";
import type { PreviewContainer } from "./index.js";

jest.mock("@next-core/theme", () => ({}));
jest.mock("../shared/workers/tsxParser.js", () => ({
  getRemoteTsxParserWorker: jest.fn(() =>
    Promise.resolve({
      async parseView(source: string) {
        if (source.includes("parse-error")) {
          throw new Error("Parse error");
        }
        return {
          entry: {
            defaultExport: {
              title: source.match(/title="([^"]+)"/)?.[1],
            },
          },
        };
      },
    })
  ),
}));
jest.mock("@next-shared/tsx-converter", () => ({
  convertView: jest.fn((parsedResult: ParsedApp) =>
    (
      (parsedResult.entry?.defaultExport as ModulePartOfComponent)
        ?.title as string
    )?.includes("convert-error")
      ? Promise.reject(new Error("Convert error"))
      : Promise.resolve(null)
  ),
}));
jest.mock("@next-core/runtime", () => ({
  unstable_createRoot: jest.fn(() => {
    return {
      render: jest.fn(),
      unmount: jest.fn(),
    };
  }),
}));

const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

jest.useFakeTimers();

customElements.define("eo-narrow-view", class extends HTMLElement {});
customElements.define("eo-main-view", class extends HTMLElement {});
customElements.define(
  "eo-page-title",
  class extends HTMLElement {
    pageTitle?: string;
  }
);
customElements.define("eo-icon", class extends HTMLElement {});
// customElements.define("eo-content-layout", class extends HTMLElement {});
// customElements.define("eo-card", class extends HTMLElement {});

describe("ai-portal.preview-container", () => {
  test("basic usage", async () => {
    const element = document.createElement(
      "ai-portal.preview-container"
    ) as PreviewContainer;
    element.source = `
      export default (
        <View title="Testing">
          <Card />
        </View>
      );
    `;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as HTMLElement).tagName.toLowerCase()).toBe(
      "eo-icon"
    );

    await waitForSuspense();
    await waitForSuspense();
    await waitForSuspense();
    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as HTMLElement).tagName.toLowerCase()).toBe(
      "eo-narrow-view"
    );
    expect(
      (element.querySelector("eo-page-title") as EoPageTitle)?.pageTitle
    ).toBe("Testing");

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("parse error", async () => {
    const element = document.createElement(
      "ai-portal.preview-container"
    ) as PreviewContainer;
    element.source = `
      export default (
        <View title="parse-error">
          <Card />
        </View>
      );
    `;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as HTMLElement).tagName.toLowerCase()).toBe(
      "eo-icon"
    );

    await waitForSuspense();
    await waitForSuspense();
    await waitForSuspense();
    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as HTMLElement).tagName.toLowerCase()).toBe(
      "eo-narrow-view"
    );
    expect(
      (element.querySelector("eo-page-title") as EoPageTitle)?.pageTitle
    ).toBe("Untitled");

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to parse view:",
      new Error("Parse error")
    );

    act(() => {
      document.body.removeChild(element);
    });
  });

  test("convert error", async () => {
    const element = document.createElement(
      "ai-portal.preview-container"
    ) as PreviewContainer;
    element.source = `
      export default (
        <View title="convert-error">
          <Card />
        </View>
      );
    `;

    act(() => {
      document.body.appendChild(element);
    });

    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as HTMLElement).tagName.toLowerCase()).toBe(
      "eo-icon"
    );

    await waitForSuspense();
    await waitForSuspense();
    await waitForSuspense();
    expect(element.childNodes.length).toBe(1);
    expect((element.childNodes[0] as HTMLElement).tagName.toLowerCase()).toBe(
      "eo-narrow-view"
    );
    expect(
      (element.querySelector("eo-page-title") as EoPageTitle)?.pageTitle
    ).toBe("convert-error");

    expect(consoleError).toHaveBeenCalledWith(
      "Failed to convert view:",
      new Error("Convert error")
    );

    act(() => {
      document.body.removeChild(element);
    });
  });
});

// https://github.com/testing-library/react-testing-library/issues/1375#issuecomment-2582070055
async function waitForSuspense() {
  (global as any).IS_REACT_ACT_ENVIRONMENT = false;
  await jest.advanceTimersToNextTimerAsync();
  (global as any).IS_REACT_ACT_ENVIRONMENT = true;
}
