export interface FileItem {
  uid: number;
  file: File;
  status: FileStatus;
  uploadedName?: string;
  abortController?: AbortController;
}

export type FileStatus = "ready" | "uploading" | "done" | "failed";
