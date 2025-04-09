import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  TextareaAutoResize,
  TextareaAutoResizeRef,
} from "./TextareaAutoResize";
import calculateAutoSizeStyle from "./utils/calculateAutoSizeStyle.js";

// Mock the resize-observer-polyfill
jest.mock("resize-observer-polyfill", () => {
  return class MockResizeObserver {
    observe = jest.fn();
    disconnect = jest.fn();
  };
});

// Mock the calculateAutoSizeStyle utility
jest.mock("./utils/calculateAutoSizeStyle.js", () => {
  return jest.fn().mockReturnValue({ height: "60px" });
});

describe("TextareaAutoResize", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<TextareaAutoResize data-testid="textarea" />);
    expect(screen.getByTestId("textarea")).toBeTruthy();
  });

  it("applies auto resize styles when autoResize is true", () => {
    render(<TextareaAutoResize data-testid="textarea" />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.change(textarea, { target: { value: "test input" } });
    expect(calculateAutoSizeStyle).toHaveBeenCalled();
  });

  it("does not apply auto resize styles when autoResize is false", () => {
    render(<TextareaAutoResize data-testid="textarea" autoResize={false} />);
    const textarea = screen.getByTestId("textarea");

    fireEvent.change(textarea, { target: { value: "test input" } });
    expect(calculateAutoSizeStyle).not.toHaveBeenCalled();
  });

  it("updates value when props value changes", () => {
    const { rerender } = render(
      <TextareaAutoResize data-testid="textarea" value="initial" />
    );
    expect((screen.getByTestId("textarea") as HTMLTextAreaElement).value).toBe(
      "initial"
    );

    rerender(<TextareaAutoResize data-testid="textarea" value="updated" />);
    expect((screen.getByTestId("textarea") as HTMLTextAreaElement).value).toBe(
      "updated"
    );
  });

  it("calls onChange when textarea value changes", () => {
    const handleChange = jest.fn();
    render(
      <TextareaAutoResize data-testid="textarea" onChange={handleChange} />
    );

    fireEvent.change(screen.getByTestId("textarea"), {
      target: { value: "new value" },
    });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when Enter is pressed with enter-without-shift config", () => {
    const handleSubmit = jest.fn();
    render(
      <TextareaAutoResize
        data-testid="textarea"
        submitWhen="enter-without-shift"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.keyDown(screen.getByTestId("textarea"), { key: "Enter" });
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when Enter and mod is pressed with enter-with-mod config", () => {
    const handleSubmit = jest.fn();
    render(
      <TextareaAutoResize
        data-testid="textarea"
        submitWhen="enter-with-mod"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.keyDown(screen.getByTestId("textarea"), {
      key: "Enter",
      ctrlKey: true,
    });
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not call onSubmit when Enter is pressed with Shift and enter-without-shift config", () => {
    const handleSubmit = jest.fn();
    render(
      <TextareaAutoResize
        data-testid="textarea"
        submitWhen="enter-without-shift"
        onSubmit={handleSubmit}
      />
    );

    fireEvent.keyDown(screen.getByTestId("textarea"), {
      key: "Enter",
      shiftKey: true,
    });
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("focuses textarea when focus method is called on ref", () => {
    const ref = React.createRef<TextareaAutoResizeRef>();
    render(<TextareaAutoResize data-testid="textarea" ref={ref} />);

    const textarea = screen.getByTestId("textarea");
    jest.spyOn(textarea, "focus");

    ref.current?.focus();
    expect(textarea.focus).toHaveBeenCalled();
  });

  it("handles composition events correctly", () => {
    const handleKeyDown = jest.fn();
    const handleSubmit = jest.fn();

    render(
      <TextareaAutoResize
        data-testid="textarea"
        submitWhen="enter-without-shift"
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
      />
    );

    const textarea = screen.getByTestId("textarea");

    // Start composition
    fireEvent.compositionStart(textarea);

    // Should ignore Enter during composition
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(handleSubmit).not.toHaveBeenCalled();

    // End composition
    fireEvent.compositionEnd(textarea);

    // Should now respond to Enter
    fireEvent.keyDown(textarea, { key: "Enter" });
    expect(handleSubmit).toHaveBeenCalled();
  });

  // it('handles auto resize', () => {
  //   const div = document.createElement('div');
  //   const containerRef = { current: div };
  //   document.body.appendChild(div);
  //   const { container } = render(
  //     <TextareaAutoResize
  //       data-testid="textarea"
  //       autoResize
  //       minRows={2}
  //       maxRows={5}
  //       paddingSize={8}
  //       containerRef={containerRef}
  //     />
  //   );

  //   const textarea = screen.getByTestId('textarea');
  //   fireEvent.change(textarea, { target: { value: 'test input' } });

  //   expect(calculateAutoSizeStyle).toHaveBeenCalledWith(
  //     textarea,
  //     expect.objectContaining({
  //       minRows: 2,
  //       maxRows: 5,
  //       paddingSize: 8,
  //     })
  //   );
  // })
});
