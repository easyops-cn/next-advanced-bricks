import type { SourceFile } from "./interfaces.js";

const resolveExtensions = [".js", ".jsx", ".ts", ".tsx"];

export function getFilePath(
  importSource: string,
  currentFilePath: string,
  files: SourceFile[]
): string {
  if (importSource.startsWith("/")) {
    // Absolute path
    return resolvePath(importSource.slice(1), files);
  }
  // Relative path
  // Assert: importSource starts with "."
  const currentDir = currentFilePath.substring(
    0,
    currentFilePath.lastIndexOf("/")
  );
  const segments = currentDir ? currentDir.split("/") : [];
  const parts = importSource.split("/");
  for (const part of parts) {
    if (part === ".") {
      continue;
    } else if (part === "..") {
      if (segments.length > 0) {
        segments.pop();
      }
    } else {
      segments.push(part);
    }
  }
  return resolvePath(segments.join("/"), files);
}

function resolvePath(path: string, files: SourceFile[]): string {
  if (files.some((f) => f.filePath === path)) {
    return path;
  }
  if (
    files.some((f) =>
      resolveExtensions.some((ext) => f.filePath === `${path}${ext}`)
    )
  ) {
    return `${path}.tsx`;
  }
  return path;
}
