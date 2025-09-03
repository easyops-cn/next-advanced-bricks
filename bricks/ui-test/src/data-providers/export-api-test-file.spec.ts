import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { exportApiTestFile } from "./export-api-test-file.js";
import { getDirHandleByPath } from "./shared/fileAccess.js";
import { get } from "idb-keyval";

jest.mock("./shared/fileAccess.js");
jest.mock("idb-keyval");

describe("exportApiTestFile", () => {
  const mockGet = get as jest.MockedFunction<typeof get>;
  const mockGetDirHandleByPath = getDirHandleByPath as jest.MockedFunction<
    typeof getDirHandleByPath
  >;

  let mockWritable: any;
  let mockFileHandle: any;
  let mockTargetDirHandle: any;
  let mockDirHandle: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockWritable = {
      write: jest.fn(),
      close: jest.fn(),
    };

    mockFileHandle = {
      createWritable: jest.fn().mockReturnValue(mockWritable),
    };

    mockTargetDirHandle = {
      getFileHandle: jest.fn().mockReturnValue(mockFileHandle),
    };

    mockDirHandle = {
      name: "project-root",
      kind: "directory",
    };
  });

  test("should export api test file successfully", async () => {
    const params = {
      projectDirectoryKey: "test-project-key",
      name: "api-test.js",
      path: "tests/api",
      source: 'describe("API test", () => { test("should work", () => {}); });',
    };

    mockGet.mockResolvedValue(mockDirHandle);
    mockGetDirHandleByPath.mockResolvedValue(mockTargetDirHandle);

    await exportApiTestFile(params);

    // Verify all function calls
    // @ts-ignore TypeScript type inference issue with Jest mocks
    expect(mockGet).toHaveBeenCalledWith("test-project-key");
    expect(mockGetDirHandleByPath).toHaveBeenCalledWith(
      mockDirHandle,
      "tests/api"
    );
    expect(mockTargetDirHandle.getFileHandle).toHaveBeenCalledWith(
      "api-test.js",
      {
        create: true,
      }
    );
    expect(mockFileHandle.createWritable).toHaveBeenCalled();
    expect(mockWritable.write).toHaveBeenCalledWith(
      'describe("API test", () => { test("should work", () => {}); });'
    );
    expect(mockWritable.close).toHaveBeenCalled();
  });

  test("should handle when directory handle is null", async () => {
    const params = {
      projectDirectoryKey: "test-project-key",
      name: "test.js",
      path: "tests",
      source: "test content",
    };

    mockGet.mockResolvedValue(null);
    mockGetDirHandleByPath.mockResolvedValue(null);

    await expect(exportApiTestFile(params)).rejects.toThrow();
  });

  test("should handle file creation error", async () => {
    const params = {
      projectDirectoryKey: "test-project-key",
      name: "test.js",
      path: "tests",
      source: "test content",
    };

    const errorTargetDirHandle = {
      getFileHandle: jest.fn().mockImplementation(() => {
        throw new Error("File creation failed");
      }),
    };

    mockGet.mockResolvedValue(mockDirHandle);
    mockGetDirHandleByPath.mockResolvedValue(errorTargetDirHandle);

    await expect(exportApiTestFile(params)).rejects.toThrow(
      "File creation failed"
    );
  });

  test("should handle write error", async () => {
    const params = {
      projectDirectoryKey: "test-project-key",
      name: "test.js",
      path: "tests",
      source: "test content",
    };

    const errorWritable = {
      write: jest.fn().mockImplementation(() => {
        throw new Error("Write failed");
      }),
      close: jest.fn(),
    };

    const errorFileHandle = {
      createWritable: jest.fn().mockReturnValue(errorWritable),
    };

    const errorTargetDirHandle = {
      getFileHandle: jest.fn().mockReturnValue(errorFileHandle),
    };

    mockGet.mockResolvedValue(mockDirHandle);
    mockGetDirHandleByPath.mockResolvedValue(errorTargetDirHandle);

    await expect(exportApiTestFile(params)).rejects.toThrow("Write failed");
  });
});
