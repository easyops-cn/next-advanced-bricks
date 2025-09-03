import {
  getTestDirHandle,
  getCaseFileHandle,
  getDirHandleByPath,
} from "./fileAccess.js";

import { get } from "idb-keyval";

jest.mock("idb-keyval");

describe("fileAccess", () => {
  describe("getTestDirHandle", () => {
    it("should return a directory handle", async () => {
      (get as jest.Mock).mockReturnValueOnce(undefined);

      const mockGetCypressDir = jest.fn(() => ({
        name: "ui-test",
        kind: "directory",
        getDirectoryHandle: jest.fn(),
      }));

      window.showDirectoryPicker = jest.fn().mockResolvedValue({
        name: "ui-test",
        kind: "directory",
        getDirectoryHandle: mockGetCypressDir,
      } as any);

      const dirHandle = await getTestDirHandle();

      expect(dirHandle.name).toBe("ui-test");

      (get as jest.Mock).mockReturnValueOnce({
        name: "cypress",
        kind: "directory",
        getDirectoryHandle: jest.fn(),
      });

      const cacheDirHandle = await getTestDirHandle();

      expect(cacheDirHandle.name).toBe("cypress");
    });
  });

  describe("getDirHandleByPath", () => {
    it("should return the current directory handle when path is empty", async () => {
      const mockDirHandle = {
        name: "root",
        kind: "directory",
      };

      const result = await getDirHandleByPath(mockDirHandle, "");
      expect(result).toBe(mockDirHandle);
    });

    it("should return the current directory handle when path only contains whitespace", async () => {
      const mockDirHandle = {
        name: "root",
        kind: "directory",
      };

      const result = await getDirHandleByPath(mockDirHandle, "   ");
      expect(result).toBe(mockDirHandle);
    });

    it("should create and return directory handle for single path", async () => {
      const mockSubDirHandle = {
        name: "cypress",
        kind: "directory",
      };

      const mockDirHandle = {
        name: "root",
        kind: "directory",
        getDirectoryHandle: jest.fn().mockResolvedValue(mockSubDirHandle),
      };

      const result = await getDirHandleByPath(mockDirHandle, "cypress");

      expect(mockDirHandle.getDirectoryHandle).toHaveBeenCalledWith("cypress", {
        create: true,
      });
      expect(result).toBe(mockSubDirHandle);
    });

    it("should create and return directory handle for nested path", async () => {
      const mockAppIdDirHandle = {
        name: "myAppId",
        kind: "directory",
      };

      const mockE2eDirHandle = {
        name: "e2e",
        kind: "directory",
        getDirectoryHandle: jest.fn().mockResolvedValue(mockAppIdDirHandle),
      };

      const mockCypressDirHandle = {
        name: "cypress",
        kind: "directory",
        getDirectoryHandle: jest.fn().mockResolvedValue(mockE2eDirHandle),
      };

      const mockRootDirHandle = {
        name: "root",
        kind: "directory",
        getDirectoryHandle: jest.fn().mockResolvedValue(mockCypressDirHandle),
      };

      const result = await getDirHandleByPath(
        mockRootDirHandle,
        "cypress/e2e/myAppId"
      );

      expect(mockRootDirHandle.getDirectoryHandle).toHaveBeenCalledWith(
        "cypress",
        { create: true }
      );
      expect(mockCypressDirHandle.getDirectoryHandle).toHaveBeenCalledWith(
        "e2e",
        { create: true }
      );
      expect(mockE2eDirHandle.getDirectoryHandle).toHaveBeenCalledWith(
        "myAppId",
        { create: true }
      );
      expect(result).toBe(mockAppIdDirHandle);
    });

    it("should handle path with trailing slashes", async () => {
      const mockSubDirHandle = {
        name: "cypress",
        kind: "directory",
      };

      const mockDirHandle = {
        name: "root",
        kind: "directory",
        getDirectoryHandle: jest.fn().mockResolvedValue(mockSubDirHandle),
      };

      const result = await getDirHandleByPath(mockDirHandle, "cypress/");

      expect(mockDirHandle.getDirectoryHandle).toHaveBeenCalledWith("cypress", {
        create: true,
      });
      expect(result).toBe(mockSubDirHandle);
    });

    it("should handle path with leading slashes", async () => {
      const mockSubDirHandle = {
        name: "cypress",
        kind: "directory",
      };

      const mockDirHandle = {
        name: "root",
        kind: "directory",
        getDirectoryHandle: jest.fn().mockResolvedValue(mockSubDirHandle),
      };

      const result = await getDirHandleByPath(mockDirHandle, "/cypress");

      expect(mockDirHandle.getDirectoryHandle).toHaveBeenCalledWith("cypress", {
        create: true,
      });
      expect(result).toBe(mockSubDirHandle);
    });
  });

  describe("getCaseFileHandle", () => {
    it("should return a file handle", async () => {
      (get as jest.Mock).mockResolvedValue(undefined);

      const mockGetFile = jest.fn((name) => ({
        name: name,
        kind: "file",
      }));

      const mockAppIdDirectory = jest.fn((name) => ({
        name: name,
        kind: "directory",
        getFileHandle: mockGetFile,
      }));

      const mockE2eDirectory = jest.fn((name) => ({
        name: name,
        kind: "directory",
        getDirectoryHandle: mockAppIdDirectory,
      }));

      const mockGetCypressDir = jest.fn(() => ({
        name: name,
        kind: "directory",
        getDirectoryHandle: mockE2eDirectory,
      }));

      const testDirHandle = {
        name: "ui-test",
        kind: "directory",
        getDirectoryHandle: mockGetCypressDir,
      };

      const fileHandle = await getCaseFileHandle(testDirHandle, {
        caseName: "route",
        appId: "myAppId",
      });

      expect(fileHandle).toEqual({ kind: "file", name: "route.spec.js" });

      (get as jest.Mock).mockResolvedValueOnce({
        kind: "file",
        name: "test.spec.js",
      });

      const fileHandle2 = await getCaseFileHandle(testDirHandle, {
        caseName: "test",
        appId: "myAppId",
      });
      expect(fileHandle2).toEqual({ kind: "file", name: "test.spec.js" });
    });
  });
});
