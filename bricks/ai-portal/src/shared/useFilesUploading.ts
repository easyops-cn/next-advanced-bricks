import { useCallback, useEffect, useRef, useState } from "react";
import { handleHttpError } from "@next-core/runtime";
import { http } from "@next-core/http";
import type { FileItem } from "./FileUpload/interfaces";
import type { UploadFileInfo, UploadOptions } from "./interfaces";
import { validateFiles } from "./FileUpload/validateFiles";
import { K, t } from "./FileUpload/i18n";

let uid = 0;

export function getNextUid() {
  return uid++;
}

export function useFilesUploading(options?: UploadOptions) {
  const enabled = options?.enabled;
  const maxFiles = options?.maxFiles;
  const [files, setFiles] = useState<FileItem[] | undefined>();
  const hasFiles = !!files && files.length > 0;

  useEffect(() => {
    files?.forEach(async (fileItem) => {
      if (fileItem.status === "ready") {
        const abortController = new AbortController();

        setFiles((prevFiles) => {
          return prevFiles?.map((item) => {
            if (item.uid === fileItem.uid) {
              return { ...item, status: "uploading", abortController };
            }
            return item;
          });
        });

        try {
          const formData = new FormData();
          formData.append("file", fileItem.file);

          const response = await http.request<{ data: UploadFileInfo }>(
            "api/gateway/logic.llm.aiops_service/api/v1/elevo/files/upload",
            {
              method: "POST",
              body: formData,
              signal: abortController.signal,
            },
            {
              interceptorParams: {
                ignoreLoadingBar: true,
              },
            }
          );

          setFiles((prevFiles) => {
            return prevFiles?.map((item) => {
              if (item.uid === fileItem.uid) {
                return {
                  ...item,
                  status: "done",
                  fileInfo: response.data,
                };
              }
              return item;
            });
          });
        } catch (error) {
          setFiles((prevFiles) => {
            return prevFiles?.map((item) => {
              if (item.uid === fileItem.uid) {
                return { ...item, status: "failed" };
              }
              return item;
            });
          });
          handleHttpError(error);
        }
      }
    });
  }, [files]);

  const [allFilesDone, setAllFilesDone] = useState(true);
  const [fileInfos, setFileInfos] = useState<UploadFileInfo[] | undefined>();
  const initialRef = useRef(true);

  useEffect(() => {
    const allFilesDone =
      !files || files.every((file) => file.status === "done");
    setAllFilesDone(allFilesDone);
    if (initialRef.current) {
      initialRef.current = false;
      return;
    }
    if (allFilesDone) {
      setFileInfos(files?.map((file) => file.fileInfo!));
    }
  }, [files]);

  const appendFiles = useCallback(
    (newFiles: File[]) => {
      if (!validateFiles(newFiles, options!)) {
        return;
      }

      setFiles((prev) => {
        const prevList = prev ?? [];
        if (maxFiles && prevList.length + newFiles.length > maxFiles) {
          handleHttpError(t(K.MAX_FILES_EXCEEDED, { count: maxFiles }));
          return prev;
        }
        return [
          ...prevList,
          ...newFiles.map<FileItem>((file) => ({
            uid: getNextUid(),
            file,
            status: "ready",
          })),
        ];
      });
    },
    [maxFiles, options]
  );

  const resetFiles = useCallback(() => {
    setFiles(undefined);
  }, []);

  const removeFile = useCallback((uid: number) => {
    setFiles((prev) => prev?.filter((file) => file.uid !== uid));
  }, []);

  const exceeded = !!maxFiles && !!files && files.length >= maxFiles;

  const paste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (!enabled) {
        return;
      }
      const fileList = e.clipboardData.files;
      if (fileList.length > 0 && enabled) {
        e.preventDefault();
        e.stopPropagation();
        const files = [...fileList];
        const allFilesAccepted = validateFiles(files, options!);
        if (allFilesAccepted) {
          appendFiles(files);
        }
      }
    },
    [enabled, options, appendFiles]
  );

  return {
    files,
    resetFiles,
    appendFiles,
    removeFile,
    hasFiles,
    allFilesDone,
    fileInfos,
    exceeded,
    paste,
  };
}
