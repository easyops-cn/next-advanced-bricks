import React, { useContext, useMemo } from "react";
import classNames from "classnames";
import type { FileInfo } from "../../shared/interfaces";
import styles from "./FileList.module.css";
import { K, t } from "../i18n";
import { formatFileSize, getFileTypeAndIcon } from "../utils/file";
import { getImageUrl } from "../../shared/FilePreview/getImageUrl";
import { TaskContext } from "../../shared/TaskContext";

export interface FileListProps {
  files: FileInfo[];
  large?: boolean;
  ui?: "canvas" | "chat";
}

export function FileList({ files, large, ui }: FileListProps) {
  const { setActiveFile, setActiveImages } = useContext(TaskContext);

  const filesWithDisplayInfo = useMemo(() => {
    return files.map((file) => {
      const [displayType, icon] = getFileTypeAndIcon(file.mimeType, file.name);
      return {
        file,
        displayType,
        icon,
      };
    });
  }, [files]);

  const imageFiles = filesWithDisplayInfo
    .filter((file) => file.displayType === "Image" && file.file.uri)
    .map((f) => f.file);
  const allImages = imageFiles.length === files.length;

  return (
    <ul
      className={classNames(styles.files, {
        [styles.large]: large,
        [styles.images]: allImages,
        [styles.single]: filesWithDisplayInfo.length === 1,
        [styles.chat]: ui === "chat",
      })}
    >
      {filesWithDisplayInfo.map(({ file, displayType, icon }, index) => {
        return (
          <li key={index}>
            <a
              className={allImages ? styles.image : styles.file}
              onClick={() => {
                if (displayType === "Image" && file.uri) {
                  setActiveImages({
                    files: imageFiles,
                    file,
                  });
                } else {
                  setActiveFile(file);
                }
              }}
            >
              {allImages ? (
                <img src={getImageUrl(file.uri!)} fetchPriority="low" />
              ) : (
                <>
                  <img
                    className={styles.icon}
                    src={icon}
                    width={26}
                    height={32}
                  />
                  <div className={styles.content}>
                    <div className={styles.name}>
                      {file.name || t(K.UNTITLED)}
                    </div>
                    <div className={styles.metadata}>
                      {`${displayType}${file.size ? ` · ${formatFileSize(file.size)}` : ""}`}
                    </div>
                  </div>
                </>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
