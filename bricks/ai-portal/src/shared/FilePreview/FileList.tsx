import React, { useContext, useMemo, useState } from "react";
import classNames from "classnames";
import type { FileInfo } from "../interfaces";
import styles from "./FileList.module.css";
import { K, t } from "./i18n";
import {
  formatFileSize,
  getFileTypeAndIcon,
} from "../../cruise-canvas/utils/file";
import { getImageUrl } from "../FilePreview/getImageUrl";
import { TaskContext } from "../TaskContext";
import { WrappedIcon } from "../bricks";
import { ICON_UP } from "../constants";

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
  // 超出数量，多余的收起来
  const limit = allImages ? 8 : 6;
  const exceeded = files.length > limit;
  const [expanded, setExpanded] = useState(false);
  const filteredList = expanded
    ? filesWithDisplayInfo
    : filesWithDisplayInfo.slice(0, limit);

  return (
    <>
      <ul
        className={classNames(styles.files, {
          [styles.large]: large,
          [styles.images]: allImages,
          [styles.single]: filesWithDisplayInfo.length === 1,
          [styles.chat]: ui === "chat",
        })}
      >
        {filteredList.map(({ file, displayType, icon }, index) => {
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
                  <>
                    <img src={getImageUrl(file.uri!)} fetchPriority="low" />
                    {exceeded && index === limit - 1 && (
                      <>
                        <div className={styles.mask} />
                        <div className={styles.overlay}>
                          {`+${files.length - limit + 1}`}
                        </div>
                      </>
                    )}
                  </>
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
      {exceeded && !allImages && (
        <button
          className={classNames(styles.expand, {
            [styles.collapsed]: !expanded,
          })}
          onClick={() => setExpanded((prev) => !prev)}
        >
          <WrappedIcon {...ICON_UP} />
          {expanded ? t(K.COLLAPSE) : t(K.SHOW_ALL_FILES)}
        </button>
      )}
    </>
  );
}
