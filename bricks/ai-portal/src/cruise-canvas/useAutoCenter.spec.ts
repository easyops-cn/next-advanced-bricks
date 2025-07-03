import { renderHook, act } from "@testing-library/react";
import { useAutoCenter } from "./useAutoCenter";
import { ZoomBehavior, ZoomTransform } from "d3-zoom";
import { select } from "d3-selection";
import { CANVAS_PADDING_BOTTOM } from "./constants";
import type { GraphNode } from "./interfaces";
import { identity } from "lodash";

describe("useAutoCenter", () => {
  let mockZoomer: ZoomBehavior<HTMLDivElement, unknown>;
  let mockRootRef: { current: HTMLDivElement | null };
  let mockNodes: any[];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock zoomer
    mockZoomer = {
      transform: jest.fn(),
    } as unknown as ZoomBehavior<HTMLDivElement, unknown>;

    // Setup mock root ref
    mockRootRef = {
      current: {
        clientWidth: 1000,
        clientHeight: 800,
      } as HTMLDivElement,
    };

    // Setup mock nodes
    mockNodes = [
      { view: { x: 100, y: 100, width: 200, height: 150 } },
      { view: { x: 400, y: 300, width: 250, height: 180 } },
    ];
  });

  it("should not center when sizeReady is false", () => {
    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: mockNodes,
        sizeReady: false,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    expect(result.current.centered).toBe(false);
    expect(mockZoomer.transform).not.toHaveBeenCalled();
  });

  it("should not center when there are no nodes", () => {
    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: [],
        sizeReady: true,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    expect(result.current.centered).toBe(false);
    expect(mockZoomer.transform).not.toHaveBeenCalled();
  });

  it("should not center when root is null", () => {
    mockRootRef.current = null;

    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: mockNodes,
        sizeReady: true,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    expect(result.current.centered).toBe(false);
    expect(mockZoomer.transform).not.toHaveBeenCalled();
  });

  it("should center when all conditions are met", () => {
    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: mockNodes,
        sizeReady: true,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    // Calculate expected values
    const left = 100;
    const right = 650; // 400 + 250
    // const top = 100;
    // const bottom = 480; // 300 + 180
    const expectedX = (1000 - (right + left)) / 2;
    const expectedY = 30;

    expect(result.current.centered).toBe(true);
    expect(mockZoomer.transform).toHaveBeenCalledTimes(1);
    expect(mockZoomer.transform).toHaveBeenCalledWith(
      select(mockRootRef.current),
      expect.any(ZoomTransform)
    );
    expect((mockZoomer.transform as jest.Mock).mock.calls[0][1].x).toBeCloseTo(
      expectedX
    );
    expect((mockZoomer.transform as jest.Mock).mock.calls[0][1].y).toBeCloseTo(
      expectedY
    );
  });

  it("should handle oversize", () => {
    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: [
          { view: { x: 400, y: 540, width: 300, height: 480 } },
          { view: { x: 100, y: 100, width: 200, height: 150 } },
          { view: { x: 400, y: 300, width: 250, height: 180 } },
        ] as GraphNode[],
        sizeReady: true,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    // Set reCenterRef to true
    act(() => {
      result.current.reCenterRef.current = true;
      result.current.setCentered(false);
    });

    expect(result.current.centered).toBe(true);
    expect(mockZoomer.transform).toHaveBeenCalledTimes(2);
    expect((mockZoomer.transform as jest.Mock).mock.calls[1][1].x).toBeCloseTo(
      100
    );
    expect((mockZoomer.transform as jest.Mock).mock.calls[1][1].y).toBeCloseTo(
      -342
    );
  });

  it("should handle reCenterRef being true", () => {
    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: mockNodes,
        sizeReady: true,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    // Set reCenterRef to true
    act(() => {
      result.current.reCenterRef.current = true;
      result.current.setCentered(false);
    });

    // Calculate expected values
    // const left = 100;
    // const right = 650;
    const top = 100;
    const bottom = 480;
    const height = bottom - top + CANVAS_PADDING_BOTTOM;

    let expectedY;
    if (height - mockRootRef.current!.clientHeight > 0) {
      expectedY = -(height - mockRootRef.current!.clientHeight) - top;
    } else {
      expectedY = (mockRootRef.current!.clientHeight - (bottom + top)) / 2;
    }

    expect(result.current.centered).toBe(true);
    expect(mockZoomer.transform).toHaveBeenCalledTimes(2);
    expect((mockZoomer.transform as jest.Mock).mock.calls[0][1].y).toBeCloseTo(
      30
    );
    expect((mockZoomer.transform as jest.Mock).mock.calls[1][1].y).toBeCloseTo(
      expectedY
    );
  });

  it("should reset reCenterRef to false after centering", () => {
    const { result } = renderHook(() =>
      useAutoCenter({
        nodes: mockNodes,
        sizeReady: true,
        zoomer: mockZoomer,
        rootRef: mockRootRef,
        selectTransition: identity,
      })
    );

    // Set reCenterRef to true then trigger a re-render
    act(() => {
      result.current.reCenterRef.current = true;
      result.current.setCentered(false);
    });

    expect(result.current.reCenterRef.current).toBe(false);
    expect(mockZoomer.transform).toHaveBeenCalledTimes(2);
  });
});
