import React from "react";
import { render } from "@testing-library/react";
import { GanttBar } from "./GanttBar";

jest.mock(
  "resize-observer-polyfill",
  () =>
    class MockResizeObserver {
      private callback: ResizeObserverCallback;

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
      }

      observe(target: Element) {
        // Simulate initial observation
        const mockEntry = {
          target,
          contentRect: { width: 300 },
          contentBoxSize: [{ inlineSize: 300 }],
        } as unknown as ResizeObserverEntry;

        this.callback([mockEntry], this as unknown as ResizeObserver);
      }

      disconnect() {}
    }
);

describe("GanttBar", () => {
  it("renders an SVG element", () => {
    const { container, unmount } = render(
      <div>
        <GanttBar />
      </div>
    );
    expect(container.querySelector("svg")).toMatchInlineSnapshot(`
      <svg
        height="18"
        width="300"
      >
        <path
          d="M0,8
            A8,8 0 0 1 8,0
            L292,0
            A8,8 0 0 1 300,8
            L300,18
            A8,8 0 0 0 292,10
            L8,10
            A8,8 0 0 0 0,18
            Z"
        />
      </svg>
    `);
    unmount();
  });
});
