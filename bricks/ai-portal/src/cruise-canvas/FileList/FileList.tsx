import React, { useMemo } from "react";
import classNames from "classnames";
import type { FileInfo } from "../../shared/interfaces";
import styles from "./FileList.module.css";
import { K, t } from "../i18n";
import { formatFileSize, getFileTypeAndIcon } from "../utils/file";
import { getBasePath } from "@next-core/runtime";

export interface FileListProps {
  files: FileInfo[];
  large?: boolean;
  ui?: "canvas" | "chat";
  onFileClick?: (file: FileInfo) => void;
}

export function FileList({ files, large, ui, onFileClick }: FileListProps) {
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

  const allImages = filesWithDisplayInfo.every(
    (file) => file.displayType === "Image" && file.file.uri
  );

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
              onClick={() => onFileClick?.(file)}
            >
              {allImages ? (
                <img
                  src={new URL(
                    file.uri!,
                    `${location.origin}${getBasePath()}`
                  ).toString()}
                  fetchPriority="low"
                />
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
