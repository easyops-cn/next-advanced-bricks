import { renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useHasAssignedNodes } from "./useHasAssignedNodes";
import { act } from "react-dom/test-utils";

describe("useHasAssignedNodes", () => {
  let mockSlotElement: HTMLSlotElement;
  let mockAssignedNodes: Node[];

  beforeEach(() => {
    mockAssignedNodes = [];
    mockSlotElement = {
      assignedNodes: jest.fn(() => mockAssignedNodes),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as any;
  });

  it("should return false initially when slot has no assigned nodes", () => {
    const { result } = renderHook(() => {
      const slotRef = useRef<HTMLSlotElement>(mockSlotElement);
      return useHasAssignedNodes(slotRef);
    });

    expect(result.current).toBe(false);
  });

  it("should return true when slot has assigned nodes", () => {
    mockAssignedNodes = [document.createTextNode("test")];

    const { result } = renderHook(() => {
      const slotRef = useRef<HTMLSlotElement>(mockSlotElement);
      return useHasAssignedNodes(slotRef);
    });

    expect(result.current).toBe(true);
  });

  it("should add slotchange event listener", () => {
    renderHook(() => {
      const slotRef = useRef<HTMLSlotElement>(mockSlotElement);
      return useHasAssignedNodes(slotRef);
    });

    expect(mockSlotElement.addEventListener).toHaveBeenCalledWith(
      "slotchange",
      expect.any(Function)
    );
  });

  it("should remove slotchange event listener on cleanup", () => {
    const { unmount } = renderHook(() => {
      const slotRef = useRef<HTMLSlotElement>(mockSlotElement);
      return useHasAssignedNodes(slotRef);
    });

    unmount();

    expect(mockSlotElement.removeEventListener).toHaveBeenCalledWith(
      "slotchange",
      expect.any(Function)
    );
  });

  it("should update hasAssignedNodes when slotchange event fires", () => {
    let slotChangeListener: () => void;

    mockSlotElement.addEventListener = jest.fn((event, listener) => {
      if (event === "slotchange") {
        slotChangeListener = listener as () => void;
      }
    });

    const { result, rerender } = renderHook(() => {
      const slotRef = useRef<HTMLSlotElement>(mockSlotElement);
      return useHasAssignedNodes(slotRef);
    });

    expect(result.current).toBe(false);

    // Simulate nodes being assigned
    mockAssignedNodes = [document.createTextNode("test")];
    act(() => {
      slotChangeListener!();
    });

    rerender();

    expect(result.current).toBe(true);
  });

  it("should not crash when slotRef.current is null", () => {
    const { result } = renderHook(() => {
      const slotRef = useRef<HTMLSlotElement>(null);
      return useHasAssignedNodes(slotRef);
    });

    expect(result.current).toBe(false);
  });
});
