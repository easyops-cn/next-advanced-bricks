import { useEffect, useRef, useState } from "react";
import { handleHttpError } from "@next-core/runtime";
import { http } from "@next-core/http";
import type { FileItem } from "./FileUpload/interfaces";
import type { UploadFileInfo } from "./interfaces";

export function useFilesUploading() {
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

  return { files, setFiles, hasFiles, allFilesDone, fileInfos };
}
