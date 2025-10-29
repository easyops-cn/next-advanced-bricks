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
    const { result } = renderHook(() => useFilesUploading());

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

    expect(result.current.files).toHaveLength(2);
    expect(result.current.exceeded).toBe(true);

    await act(async () => {
      await (global as any).flushPromises();
    });
  });

  it("should reset files", async () => {
    const { result } = renderHook(() => useFilesUploading());

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
    const { result } = renderHook(() => useFilesUploading());

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
    const { result } = renderHook(() => useFilesUploading());

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
    const { result } = renderHook(() => useFilesUploading());

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

    const { result } = renderHook(() => useFilesUploading());

    const newFiles: File[] = [new File(["test"], "test.txt")];

    act(() => {
      result.current.appendFiles(newFiles);
    });

    await waitFor(() => {
      expect(result.current.files?.[0].status).toBe("uploading");
    });

    expect(result.current.allFilesDone).toBe(false);
  });
});
