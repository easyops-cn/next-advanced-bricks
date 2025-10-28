import React from "react";
import { act } from "react-dom/test-utils";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { handleHttpError } from "@next-core/runtime";
import GlobalDragOverlay from "./GlobalDragOverlay";

jest.mock("@next-core/runtime", () => ({
  handleHttpError: jest.fn(),
}));

// Mock DataTransfer for Jest environment
global.DataTransfer = class DataTransfer {
  items: any[] = [];
  files: File[] = [];
  types: string[] = [];
} as any;

// Mock DragEvent for Jest environment
global.DragEvent = class DragEvent extends Event {
  dataTransfer: DataTransfer;

  constructor(type: string, eventInitDict?: DragEventInit) {
    super(type, eventInitDict);
    this.dataTransfer = eventInitDict?.dataTransfer || new DataTransfer();
  }
} as any;

describe("GlobalDragOverlay", () => {
  const mockOnFilesDropped = jest.fn();

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should not show overlay initially", () => {
    const { unmount } = render(<GlobalDragOverlay />);
    expect(document.querySelector(".overlay")).not.toBeInTheDocument();
    unmount();
  });

  it("should show overlay when dragging files", async () => {
    const { unmount } = render(<GlobalDragOverlay />);

    const dragEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEvent.dataTransfer, "items", {
      value: [{ kind: "file" }],
    });

    act(() => {
      fireEvent(window, dragEvent);
    });

    await waitFor(() => {
      expect(document.querySelector(".overlay")).toBeInTheDocument();
    });
    unmount();
  });

  it("should not show overlay when disabled", () => {
    const { unmount } = render(<GlobalDragOverlay disabled />);

    const dragEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEvent.dataTransfer, "items", {
      value: [{ kind: "file" }],
    });

    fireEvent(window, dragEvent);

    expect(document.querySelector(".overlay")).not.toBeInTheDocument();
    unmount();
  });

  it("should not show overlay when dragging non-files", () => {
    const { unmount } = render(<GlobalDragOverlay />);

    const dragEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEvent.dataTransfer, "items", {
      value: [{ kind: "string" }],
    });

    fireEvent(window, dragEvent);

    expect(document.querySelector(".overlay")).not.toBeInTheDocument();
    unmount();
  });

  it("should hide overlay on drag leave", async () => {
    const { unmount } = render(<GlobalDragOverlay />);

    const dragEnterEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEnterEvent.dataTransfer, "items", {
      value: [{ kind: "file" }],
    });

    fireEvent(window, dragEnterEvent);

    await waitFor(() => {
      expect(document.querySelector(".overlay")).toBeInTheDocument();
    });

    const dragLeaveEvent = new DragEvent("dragleave", {
      bubbles: true,
    });

    fireEvent(window, dragLeaveEvent);

    await waitFor(() => {
      expect(document.querySelector(".overlay")).not.toBeInTheDocument();
    });
    unmount();
  });

  it("should call onFilesDropped when files are dropped", () => {
    const { unmount } = render(
      <GlobalDragOverlay onFilesDropped={mockOnFilesDropped} />
    );

    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const dropEvent = new DragEvent("drop", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dropEvent.dataTransfer, "files", {
      value: [file],
    });

    fireEvent(window, dropEvent);

    expect(mockOnFilesDropped).toHaveBeenCalledWith([file]);
    unmount();
  });

  it("should validate files with accept prop", () => {
    const { unmount } = render(
      <GlobalDragOverlay
        accept=".txt"
        dragTips="Only txt files"
        onFilesDropped={mockOnFilesDropped}
      />
    );

    const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
    const dropEvent = new DragEvent("drop", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dropEvent.dataTransfer, "files", {
      value: [file],
    });

    fireEvent(window, dropEvent);

    expect(handleHttpError).toHaveBeenCalledWith("Only txt files");
    expect(mockOnFilesDropped).not.toHaveBeenCalled();
    unmount();
  });

  it("should not trigger drag events from EO-DRAWER elements", () => {
    const { unmount } = render(<GlobalDragOverlay />);

    const drawer = document.createElement("EO-DRAWER");
    document.body.appendChild(drawer);

    const dragEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEvent.dataTransfer, "items", {
      value: [{ kind: "file" }],
    });

    Object.defineProperty(dragEvent, "composedPath", {
      value: () => [drawer, document.body],
    });

    fireEvent(drawer, dragEvent);

    expect(document.querySelector(".overlay")).not.toBeInTheDocument();
    unmount();
  });

  it("should not trigger drag events from EO-MODAL elements", () => {
    const { unmount } = render(<GlobalDragOverlay />);

    const modal = document.createElement("EO-MODAL");
    document.body.appendChild(modal);

    const dragEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEvent.dataTransfer, "items", {
      value: [{ kind: "file" }],
    });

    Object.defineProperty(dragEvent, "composedPath", {
      value: () => [modal, document.body],
    });

    fireEvent(modal, dragEvent);

    expect(document.querySelector(".overlay")).not.toBeInTheDocument();
    unmount();
  });

  it("should display drag tips in overlay", async () => {
    const { unmount } = render(
      <GlobalDragOverlay dragTips="Drop your files here" />
    );

    const dragEvent = new DragEvent("dragenter", {
      bubbles: true,
      dataTransfer: new DataTransfer(),
    });

    Object.defineProperty(dragEvent.dataTransfer, "items", {
      value: [{ kind: "file" }],
    });

    fireEvent(window, dragEvent);

    await waitFor(() => {
      expect(screen.getByText("Drop your files here")).toBeInTheDocument();
    });
    unmount();
  });

  it("should prevent default behavior on drag events", () => {
    const { unmount } = render(<GlobalDragOverlay />);

    const dragOverEvent = new DragEvent("dragover", {
      bubbles: true,
    });
    const preventDefaultSpy = jest.spyOn(dragOverEvent, "preventDefault");
    const stopPropagationSpy = jest.spyOn(dragOverEvent, "stopPropagation");

    fireEvent(window, dragOverEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(stopPropagationSpy).toHaveBeenCalled();
    unmount();
  });
});
