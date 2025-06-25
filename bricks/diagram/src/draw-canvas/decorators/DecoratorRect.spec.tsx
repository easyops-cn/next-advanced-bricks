import React from "react";
import { describe, test, expect } from "@jest/globals";
import { render, fireEvent } from "@testing-library/react";
import { DecoratorRect } from "./DecoratorRect";
import { act } from "react-dom/test-utils";
import { handleMouseDown } from "../processors/handleMouseDown";

jest.mock("../processors/handleMouseDown");

const mockHandleMouseDown = handleMouseDown as jest.Mock;

describe("DecoratorRect", () => {
  test("basic usage", () => {
    const { container } = render(
      <svg>
        <DecoratorRect
          activeTarget={null}
          cell={{
            type: "decorator",
            decorator: "rect",
            id: "1",
            view: {
              x: 1,
              y: 2,
              width: 3,
              height: 4,
              text: "Text",
            },
          }}
          view={{
            x: 1,
            y: 2,
            width: 3,
            height: 4,
            text: "Text",
          }}
          cells={[]}
          transform={{
            k: 0,
            x: 1,
            y: 1,
          }}
        />
      </svg>
    );
    expect(
      container.querySelector(".decorator-rect-container")?.children.length
    ).toBe(2);

    act(() => {
      fireEvent.mouseDown(container.querySelector(".resize-handle")!);
    });

    expect(mockHandleMouseDown).toHaveBeenCalled();
  });
  test("readOnly", () => {
    const { container } = render(
      <svg>
        <DecoratorRect
          activeTarget={null}
          cell={{
            type: "decorator",
            decorator: "rect",
            id: "1",
            view: {
              x: 1,
              y: 2,
              width: 3,
              height: 4,
              text: "Text",
            },
          }}
          readOnly
          view={{
            x: 1,
            y: 2,
            width: 3,
            height: 4,
            text: "Text",
          }}
          cells={[]}
          transform={{
            k: 0,
            x: 1,
            y: 1,
          }}
        />
      </svg>
    );
    expect(
      container.querySelector(".decorator-rect-container")?.children.length
    ).toBe(1);
  });
});
