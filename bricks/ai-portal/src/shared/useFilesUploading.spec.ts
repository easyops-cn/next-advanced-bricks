import { renderHook, act, waitFor } from "@testing-library/react";
import { http } from "@next-core/http";
import { handleHttpError } from "@next-core/runtime";
import { useFilesUploading } from "./useFilesUploading";

jest.mock("@next-core/http");
jest.mock("@next-core/runtime");

const mockRequest = http.request as jest.MockedFunction<typeof http.request>;
mockRequest.mockImplementation(async (url, init) => {
  const formData = init!.body as FormData;
  const file = formData.get("file") as File;
  if (file.name.includes("fail")) {
    throw new Error("Upload failed");
  }
  return {
    data: {
      fileId: `file-${file.name}`,
    },
  };
});
const mockHandleHttpError = handleHttpError as jest.MockedFunction<
  typeof handleHttpError
>;

describe("useFilesUploading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useFilesUploading());

    expect(result.current.files).toBeUndefined();
    expect(result.current.hasFiles).toBe(false);
    expect(result.current.allFilesDone).toBe(true);
    expect(result.current.fileInfos).toBeUndefined();
    expect(result.current.exceeded).toBe(false);
  });

  it("should append files correctly", async () => {
    const { result } = renderHook(() => useFilesUploading({ enabled: true }));

    const newFiles: File[] = [
      new File(["test"], "test.txt"),
      new File(["test2"], "test2.txt"),
    ];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    expect(result.current.files?.length).toBe(2);
    expect(result.current.hasFiles).toBe(true);

    await act(async () => {
      await (global as any).flushPromises();
    });
  });

  it("should handle maxFiles limit when appending", async () => {
    const { result } = renderHook(() => useFilesUploading({ maxFiles: 2 }));

    const newFiles: File[] = [
      new File(["test1"], "test1.txt"),
      new File(["test2"], "test2.txt"),
      new File(["test3"], "test3.txt"),
    ];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    expect(result.current.files).toBe(undefined);
    expect(result.current.exceeded).toBe(false);

    await act(async () => {
      await (global as any).flushPromises();
    });
  });

  it("should reset files", async () => {
    const { result } = renderHook(() => useFilesUploading({ enabled: true }));

    const newFiles: File[] = [new File(["test"], "test.txt")];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    act(() => {
      result.current.resetFiles();
    });

    expect(result.current.files).toBeUndefined();
    expect(result.current.hasFiles).toBe(false);

    await act(async () => {
      await (global as any).flushPromises();
    });
  });

  it("should remove file by uid", async () => {
    const { result } = renderHook(() => useFilesUploading({ enabled: true }));

    const newFiles: File[] = [
      new File(["test1"], "test1.txt"),
      new File(["test2"], "test2.txt"),
    ];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    act(() => {
      result.current.removeFile(result.current.files![0].uid);
    });

    expect(result.current.files).toHaveLength(1);

    await act(async () => {
      await (global as any).flushPromises();
    });
  });

  it("should upload files successfully", async () => {
    const { result } = renderHook(() => useFilesUploading({ enabled: true }));

    const newFiles: File[] = [new File(["test"], "test.txt")];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    await waitFor(() => {
      expect(result.current.files?.[0].status).toBe("done");
    });

    expect(result.current.files?.[0].fileInfo).toEqual({
      fileId: "file-test.txt",
    });
    expect(result.current.allFilesDone).toBe(true);
    expect(result.current.fileInfos).toEqual([{ fileId: "file-test.txt" }]);
  });

  it("should handle upload failure", async () => {
    const { result } = renderHook(() => useFilesUploading({ enabled: true }));

    const newFiles: File[] = [new File(["test"], "fail.txt")];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    await waitFor(() => {
      expect(result.current.files?.[0].status).toBe("failed");
    });

    expect(mockHandleHttpError).toHaveBeenCalledWith(
      new Error("Upload failed")
    );
  });

  it("should set allFilesDone to false when files are uploading", async () => {
    mockRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useFilesUploading({ enabled: true }));

    const newFiles: File[] = [new File(["test"], "test.txt")];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    await waitFor(() => {
      expect(result.current.files?.[0].status).toBe("uploading");
    });

    expect(result.current.allFilesDone).toBe(false);
  });

  describe("paste", () => {
    const createPasteEvent = (files: File[]) => {
      const dataTransfer = {
        files: files as unknown as FileList,
      };
      return {
        clipboardData: dataTransfer,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown as React.ClipboardEvent<HTMLTextAreaElement>;
    };

    it("should do nothing when not enabled", async () => {
      const { result } = renderHook(() =>
        useFilesUploading({ enabled: false })
      );

      const pasteEvent = createPasteEvent([new File(["test"], "test.txt")]);

      act(() => {
        result.current.paste(pasteEvent);
      });

      expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
      expect(result.current.files).toBeUndefined();
    });

    it("should do nothing when no files in clipboard", async () => {
      const { result } = renderHook(() => useFilesUploading({ enabled: true }));

      const pasteEvent = createPasteEvent([]);

      act(() => {
        result.current.paste(pasteEvent);
      });

      expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
      expect(result.current.files).toBeUndefined();
    });

    it("should handle pasted files", async () => {
      const { result } = renderHook(() => useFilesUploading({ enabled: true }));

      const pasteEvent = createPasteEvent([new File(["test"], "test.txt")]);

      act(() => {
        result.current.paste(pasteEvent);
      });

      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(pasteEvent.stopPropagation).toHaveBeenCalled();
      expect(result.current.files?.length).toBe(1);
      expect(result.current.files?.[0].file.name).toBe("test.txt");

      await act(async () => {
        await (global as any).flushPromises();
      });
    });

    it("should rename pasted image.png to unique name", async () => {
      const { result } = renderHook(() => useFilesUploading({ enabled: true }));

      const pasteEvent = createPasteEvent([
        new File(["image data"], "image.png", { type: "image/png" }),
      ]);

      act(() => {
        result.current.paste(pasteEvent);
      });

      expect(result.current.files?.length).toBe(1);
      expect(result.current.files?.[0].file.name).toMatch(
        /^pasted-image-\d+-\d+\.png$/
      );
      expect(result.current.files?.[0].file.type).toBe("image/png");

      await act(async () => {
        await (global as any).flushPromises();
      });
    });

    it("should not rename non-image.png files", async () => {
      const { result } = renderHook(() => useFilesUploading({ enabled: true }));

      const pasteEvent = createPasteEvent([
        new File(["image data"], "screenshot.png", { type: "image/png" }),
      ]);

      act(() => {
        result.current.paste(pasteEvent);
      });

      expect(result.current.files?.length).toBe(1);
      expect(result.current.files?.[0].file.name).toBe("screenshot.png");

      await act(async () => {
        await (global as any).flushPromises();
      });
    });

    it("should handle multiple pasted files", async () => {
      const { result } = renderHook(() => useFilesUploading({ enabled: true }));

      const pasteEvent = createPasteEvent([
        new File(["test1"], "file1.txt"),
        new File(["image data"], "image.png", { type: "image/png" }),
      ]);

      act(() => {
        result.current.paste(pasteEvent);
      });

      expect(result.current.files?.length).toBe(2);
      expect(result.current.files?.[0].file.name).toBe("file1.txt");
      expect(result.current.files?.[1].file.name).toMatch(
        /^pasted-image-\d+-\d+\.png$/
      );

      await act(async () => {
        await (global as any).flushPromises();
      });
    });
  });
});
