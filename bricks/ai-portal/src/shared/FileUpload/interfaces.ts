import type { UploadFileInfo } from "../interfaces";

export interface FileItem {
  uid: number;
  file: File;
  status: FileStatus;
  fileInfo?: UploadFileInfo;
  abortController?: AbortController;
}

export type FileStatus = "ready" | "uploading" | "done" | "failed";
