import { acceptFiles } from "./acceptFiles";

describe("acceptFiles", () => {
  const createMockFile = (name: string, type: string): File => {
    return new File([""], name, { type });
  };

  it('should accept all files when accept is "*/*"', () => {
    const files = [
      createMockFile("test.txt", "text/plain"),
      createMockFile("image.jpg", "image/jpeg"),
      createMockFile("video.mp4", "video/mp4"),
    ];
    expect(acceptFiles("*/*", files)).toBe(true);
  });

  it('should accept all files when accept is "*"', () => {
    const files = [
      createMockFile("test.txt", "text/plain"),
      createMockFile("image.jpg", "image/jpeg"),
    ];
    expect(acceptFiles("*", files)).toBe(true);
  });

  it("should accept files by exact MIME type", () => {
    const files = [
      createMockFile("test.txt", "text/plain"),
      createMockFile("data.json", "application/json"),
    ];
    expect(acceptFiles("text/plain, application/json", files)).toBe(true);
  });

  it("should reject files with non-matching MIME type", () => {
    const files = [
      createMockFile("test.txt", "text/plain"),
      createMockFile("image.jpg", "image/jpeg"),
    ];
    expect(acceptFiles("text/plain", files)).toBe(false);
  });

  it("should accept files by file extension", () => {
    const files = [
      createMockFile("test.txt", ""),
      createMockFile("data.JSON", ""),
    ];
    expect(acceptFiles(".txt, .json", files)).toBe(true);
  });

  it("should reject files with non-matching extension", () => {
    const files = [
      createMockFile("test.txt", ""),
      createMockFile("image.jpg", ""),
    ];
    expect(acceptFiles(".txt", files)).toBe(false);
  });

  it("should accept files by MIME type category", () => {
    const files = [
      createMockFile("image1.jpg", "image/jpeg"),
      createMockFile("image2.png", "image/png"),
      createMockFile("image3.gif", "image/gif"),
    ];
    expect(acceptFiles("image/*", files)).toBe(true);
  });

  it("should reject files not matching MIME type category", () => {
    const files = [
      createMockFile("image.jpg", "image/jpeg"),
      createMockFile("video.mp4", "video/mp4"),
    ];
    expect(acceptFiles("image/*", files)).toBe(false);
  });

  it("should handle mixed accept criteria", () => {
    const files = [
      createMockFile("image.jpg", "image/jpeg"),
      createMockFile("document.pdf", "application/pdf"),
      createMockFile("data.txt", ""),
    ];
    expect(acceptFiles("image/*, application/pdf, .txt", files)).toBe(true);
  });

  it("should return true for empty files array", () => {
    expect(acceptFiles("text/plain", [])).toBe(true);
  });

  it("should handle whitespace in accept string", () => {
    const files = [createMockFile("test.txt", "text/plain")];
    expect(acceptFiles("  text/plain  ,  image/*  ", files)).toBe(true);
  });

  it("should be case insensitive for file extensions", () => {
    const files = [
      createMockFile("TEST.TXT", ""),
      createMockFile("data.JSON", ""),
    ];
    expect(acceptFiles(".txt, .json", files)).toBe(true);
  });
});
