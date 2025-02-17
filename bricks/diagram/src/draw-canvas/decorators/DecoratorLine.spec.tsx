import React from "react";
import { render } from "@testing-library/react";
import { DecoratorLine } from "./DecoratorLine";
import type { BasicDecoratorProps, DecoratorCell } from "../interfaces";

describe("DecoratorLine", () => {
  const line1 = {
    type: "decorator",
    decorator: "line",
    id: "line-1",
  } as DecoratorCell;
  const line2 = {
    type: "decorator",
    decorator: "line",
    id: "line-2",
  } as DecoratorCell;

  const lineConfMap = new Map([
    [
      line1,
      {
        strokeColor: "black",
        markers: [{ placement: "start" }, { placement: "end" }],
        $markerEndUrl: "url(#end)",
        $activeMarkerEndUrl: "url(#active-end)",
        overrides: {
          active: {
            strokeColor: "blue",
          },
        },
      },
    ],
    [
      line2,
      {
        type: "curve",
        strokeWidth: 1,
        markers: [{ placement: "start" }, { placement: "end" }],
        $markerStartUrl: "url(#start)",
        $activeMarkerStartUrl: "url(#active-start)",
        overrides: {
          active: {
            strokeWidth: 2,
          },
        },
      },
    ],
  ]) as unknown as BasicDecoratorProps["lineConfMap"];
  const editableLineMap = new Map([
    [
      line1,
      {
        points: [
          { x: 160, y: 200 },
          { x: 160, y: 120 },
          { x: 305, y: 120 },
        ],
      },
    ],
    [
      line2,
      {
        points: [
          { x: 160, y: 200 },
          { x: 160, y: 120 },
          { x: 305, y: 120 },
        ],
      },
    ],
  ]) as BasicDecoratorProps["editableLineMap"];

  it("should render straight line", () => {
    const props = {
      cell: line1,
      active: false,
      lineConfMap,
      editableLineMap,
    } as BasicDecoratorProps;

    const { container } = render(
      <svg>
        <DecoratorLine {...props} />
      </svg>
    );
    expect(
      container.querySelector("path")?.getAttribute("d")
    ).toMatchInlineSnapshot(`"M160,200L160,120L304,120"`);
    expect(
      container.querySelector("path:last-child")?.getAttribute("stroke")
    ).toBe("black");
    expect(
      container.querySelector("path:last-child")?.getAttribute("marker-end")
    ).toBe("url(#end)");
  });

  it("should render straight line and apply active overrides", () => {
    const props = {
      cell: line1,
      active: true,
      lineConfMap,
      editableLineMap,
    } as BasicDecoratorProps;

    const { container } = render(
      <svg>
        <DecoratorLine {...props} />
      </svg>
    );
    expect(
      container.querySelector("path:last-child")?.getAttribute("d")
    ).toMatchInlineSnapshot(`"M160,200L160,120L304,120"`);
    expect(
      container.querySelector("path:last-child")?.getAttribute("stroke")
    ).toBe("blue");
    expect(
      container.querySelector("path:last-child")?.getAttribute("marker-end")
    ).toBe("url(#active-end)");
  });

  it("should render curve line", () => {
    const props = {
      cell: line2,
      active: false,
      lineConfMap,
      editableLineMap,
    } as BasicDecoratorProps;

    const { container } = render(
      <svg>
        <DecoratorLine {...props} />
      </svg>
    );
    expect(
      container.querySelector("path")?.getAttribute("d")
    ).toMatchInlineSnapshot(
      `"M160,200L160,186.667C160,173.333,160,146.667,184,133.333C208,120,256,120,280,120L304,120"`
    );
    expect(
      container.querySelector("path:last-child")?.getAttribute("stroke-width")
    ).toBe("1");
    expect(
      container.querySelector("path:last-child")?.getAttribute("marker-start")
    ).toBe("url(#start)");
  });

  it("should render curve line and apply active overrides", () => {
    const props = {
      cell: line2,
      active: true,
      lineConfMap,
      editableLineMap,
    } as BasicDecoratorProps;

    const { container } = render(
      <svg>
        <DecoratorLine {...props} />
      </svg>
    );
    expect(
      container.querySelector("path:last-child")?.getAttribute("d")
    ).toMatchInlineSnapshot(
      `"M160,200L160,186.667C160,173.333,160,146.667,184,133.333C208,120,256,120,280,120L304,120"`
    );
    expect(
      container.querySelector("path:last-child")?.getAttribute("stroke-width")
    ).toBe("2");
    expect(
      container.querySelector("path:last-child")?.getAttribute("marker-start")
    ).toBe("url(#active-start)");
  });

  it("should render null if no line points", () => {
    const props = {
      cell: line1,
      active: false,
      lineConfMap,
      editableLineMap: new Map(),
    } as unknown as BasicDecoratorProps;

    const { container } = render(
      <svg>
        <DecoratorLine {...props} />
      </svg>
    );
    expect(container.querySelector("path")).toBeNull();
  });
});
