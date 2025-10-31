import { renderHook } from "@testing-library/react";
import { useHandleEscape } from "./useHandleEscape";
import type { TaskContextValue } from "./TaskContext";

describe("useHandleEscape", () => {
  let mockSetActiveFile: jest.Mock;
  let mockSetActiveImages: jest.Mock;
  let mockSetActiveExpandedViewJobId: jest.Mock;
  let mockSetActiveDetail: jest.Mock;
  let mockSetSubActiveDetail: jest.Mock;
  let mockTaskContextValue: TaskContextValue;

  beforeEach(() => {
    mockSetActiveFile = jest.fn();
    mockSetActiveImages = jest.fn();
    mockSetActiveExpandedViewJobId = jest.fn();
    mockSetActiveDetail = jest.fn();
    mockSetSubActiveDetail = jest.fn();

    mockTaskContextValue = {
      activeDetail: null,
      activeExpandedViewJobId: null,
      activeFile: null,
      activeImages: null,
      subActiveDetail: null,
      setActiveFile: mockSetActiveFile,
      setActiveImages: mockSetActiveImages,
      setActiveExpandedViewJobId: mockSetActiveExpandedViewJobId,
      setActiveDetail: mockSetActiveDetail,
      setSubActiveDetail: mockSetSubActiveDetail,
    } as unknown as TaskContextValue;

    jest.clearAllMocks();
  });

  it("should close activeFile first when Escape is pressed", () => {
    const taskContext = {
      ...mockTaskContextValue,
      activeFile: "test-file",
      activeImages: "test-images",
      activeExpandedViewJobId: "test-job",
      subActiveDetail: "test-sub",
      activeDetail: "test-detail",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveFile).toHaveBeenCalledWith(null);
    expect(mockSetActiveImages).not.toHaveBeenCalled();
    expect(mockSetActiveExpandedViewJobId).not.toHaveBeenCalled();
    expect(mockSetSubActiveDetail).not.toHaveBeenCalled();
    expect(mockSetActiveDetail).not.toHaveBeenCalled();
  });

  it("should close activeImages when no activeFile and Escape is pressed", () => {
    const taskContext = {
      ...mockTaskContextValue,
      activeImages: "test-images",
      activeExpandedViewJobId: "test-job",
      subActiveDetail: "test-sub",
      activeDetail: "test-detail",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveImages).toHaveBeenCalledWith(null);
    expect(mockSetActiveExpandedViewJobId).not.toHaveBeenCalled();
    expect(mockSetSubActiveDetail).not.toHaveBeenCalled();
    expect(mockSetActiveDetail).not.toHaveBeenCalled();
  });

  it("should close activeExpandedViewJobId when no activeFile or activeImages and Escape is pressed", () => {
    const taskContext = {
      ...mockTaskContextValue,
      activeExpandedViewJobId: "test-job",
      subActiveDetail: "test-sub",
      activeDetail: "test-detail",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveExpandedViewJobId).toHaveBeenCalledWith(null);
    expect(mockSetSubActiveDetail).not.toHaveBeenCalled();
    expect(mockSetActiveDetail).not.toHaveBeenCalled();
  });

  it("should close subActiveDetail when only subActiveDetail and activeDetail are active", () => {
    const taskContext = {
      ...mockTaskContextValue,
      subActiveDetail: "test-sub",
      activeDetail: "test-detail",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetSubActiveDetail).toHaveBeenCalledWith(null);
    expect(mockSetActiveDetail).not.toHaveBeenCalled();
  });

  it("should close activeDetail when only activeDetail is active", () => {
    const taskContext = {
      ...mockTaskContextValue,
      activeDetail: "test-detail",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveDetail).toHaveBeenCalledWith(null);
  });

  it("should not trigger any setter when nothing is active", () => {
    renderHook(() => useHandleEscape(mockTaskContextValue));

    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveFile).not.toHaveBeenCalled();
    expect(mockSetActiveImages).not.toHaveBeenCalled();
    expect(mockSetActiveExpandedViewJobId).not.toHaveBeenCalled();
    expect(mockSetSubActiveDetail).not.toHaveBeenCalled();
    expect(mockSetActiveDetail).not.toHaveBeenCalled();
  });

  it("should ignore non-Escape key presses", () => {
    const taskContext = {
      ...mockTaskContextValue,
      activeFile: "test-file",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(enterEvent);

    expect(mockSetActiveFile).not.toHaveBeenCalled();
  });

  it("should ignore Escape key during composition", () => {
    const taskContext = {
      ...mockTaskContextValue,
      activeFile: "test-file",
    } as unknown as TaskContextValue;

    renderHook(() => useHandleEscape(taskContext));

    // Start composition
    const compositionStart = new CompositionEvent("compositionstart");
    document.dispatchEvent(compositionStart);

    // Press Escape during composition
    const escapeEvent = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveFile).not.toHaveBeenCalled();

    // End composition
    const compositionEnd = new CompositionEvent("compositionend");
    document.dispatchEvent(compositionEnd);

    // Press Escape after composition ends
    document.dispatchEvent(escapeEvent);

    expect(mockSetActiveFile).toHaveBeenCalledWith(null);
  });
});
