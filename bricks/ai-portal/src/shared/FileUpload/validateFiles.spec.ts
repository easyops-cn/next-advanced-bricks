import { handleHttpError } from "@next-core/runtime";
import { validateFiles } from "./validateFiles";
import type { UploadOptions } from "../interfaces";
import { t, K } from "./i18n";

jest.mock("@next-core/runtime");
jest.mock("./i18n");

const mockHandleHttpError = handleHttpError as jest.MockedFunction<
  typeof handleHttpError
>;
const mockT = t as jest.MockedFunction<typeof t>;

describe("validateFiles", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockFile = (name: string, type: string, size: number): File => {
    return {
      name,
      type,
      size,
    } as File;
  };

  describe("file type validation", () => {
    it("should return true when no accept types are specified", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = {};

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should accept files matching exact MIME type", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = { accept: "text/plain" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should accept files with wildcard type", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = { accept: "*/*" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should accept files with * wildcard", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = { accept: "*" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should accept files matching file extension", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = { accept: ".txt" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should accept files matching MIME type category", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = { accept: "text/*" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should handle multiple accept types", () => {
      const files = [createMockFile("test.jpg", "image/jpeg", 1000)];
      const options: UploadOptions = { accept: "text/plain, image/jpeg, .pdf" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should reject files not matching accept types", () => {
      const files = [
        createMockFile("test.exe", "application/x-msdownload", 1000),
      ];
      const options: UploadOptions = { accept: "text/plain, image/*" };
      mockT.mockReturnValue("Unsupported file type");

      const result = validateFiles(files, options);

      expect(result).toBe(false);
      expect(mockHandleHttpError).toHaveBeenCalledWith("Unsupported file type");
      expect(mockT).toHaveBeenCalledWith(K.UNSUPPORTED_FILE_TYPE);
    });

    it("should use readableAccept when rejecting files", () => {
      const files = [
        createMockFile("test.exe", "application/x-msdownload", 1000),
      ];
      const options: UploadOptions = {
        accept: "text/plain",
        readableAccept: "Text files",
      };
      mockT.mockReturnValue("Supported file types: Text files");

      const result = validateFiles(files, options);

      expect(result).toBe(false);
      expect(mockT).toHaveBeenCalledWith(K.SUPPORTED_FILE_TYPES, {
        types: "Text files",
      });
    });

    it("should handle case insensitive file extensions", () => {
      const files = [createMockFile("TEST.TXT", "text/plain", 1000)];
      const options: UploadOptions = { accept: ".txt" };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });
  });

  describe("file size validation", () => {
    it("should accept files within size limit", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = { maxSize: 2000 };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should reject files exceeding size limit", () => {
      const files = [createMockFile("test.txt", "text/plain", 3000)];
      const options: UploadOptions = { maxSize: 2000 };
      mockT.mockReturnValue("Max size exceeded");

      const result = validateFiles(files, options);

      expect(result).toBe(false);
      expect(mockHandleHttpError).toHaveBeenCalledWith("Max size exceeded");
      expect(mockT).toHaveBeenCalledWith(K.MAX_SIZE_EXCEEDED_UNKNOWN);
    });

    it("should use readableMaxSize when rejecting oversized files", () => {
      const files = [createMockFile("test.txt", "text/plain", 3000)];
      const options: UploadOptions = {
        maxSize: 2000,
        readableMaxSize: "2KB",
      };
      mockT.mockReturnValue("Max size exceeded: 2KB");

      const result = validateFiles(files, options);

      expect(result).toBe(false);
      expect(mockT).toHaveBeenCalledWith(K.MAX_SIZE_EXCEEDED, { size: "2KB" });
    });

    it("should not validate size when maxSize is not specified", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000000)];
      const options: UploadOptions = {};

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });
  });

  describe("multiple files validation", () => {
    it("should validate all files and return true when all pass", () => {
      const files = [
        createMockFile("test1.txt", "text/plain", 1000),
        createMockFile("test2.txt", "text/plain", 1500),
      ];
      const options: UploadOptions = { accept: "text/plain", maxSize: 2000 };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should return false on first validation failure", () => {
      const files = [
        createMockFile("test1.txt", "text/plain", 1000),
        createMockFile("test2.exe", "application/x-msdownload", 1000),
      ];
      const options: UploadOptions = { accept: "text/plain" };
      mockT.mockReturnValue("Unsupported file type");

      const result = validateFiles(files, options);

      expect(result).toBe(false);
      expect(mockHandleHttpError).toHaveBeenCalledTimes(1);
    });
  });

  describe("combined validation", () => {
    it("should validate both type and size", () => {
      const files = [createMockFile("test.txt", "text/plain", 1000)];
      const options: UploadOptions = {
        accept: "text/plain",
        maxSize: 2000,
      };

      const result = validateFiles(files, options);

      expect(result).toBe(true);
      expect(mockHandleHttpError).not.toHaveBeenCalled();
    });

    it("should fail on type validation before checking size", () => {
      const files = [
        createMockFile("test.exe", "application/x-msdownload", 5000),
      ];
      const options: UploadOptions = {
        accept: "text/plain",
        maxSize: 2000,
      };
      mockT.mockReturnValue("Unsupported file type");

      const result = validateFiles(files, options);

      expect(result).toBe(false);
      expect(mockT).toHaveBeenCalledWith(K.UNSUPPORTED_FILE_TYPE);
    });
  });
});
