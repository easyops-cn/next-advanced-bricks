import React, { useContext } from "react";
import classNames from "classnames";
import type { FileInfo } from "../../shared/interfaces";
import styles from "./FileList.module.css";
import { K, t } from "../i18n";
import { CanvasContext } from "../CanvasContext";
import { formatFileSize, getFileTypeAndIcon } from "../utils/file";

export interface FileListProps {
  files: FileInfo[];
  large?: boolean;
}

export function FileList({ files, large }: FileListProps) {
  const { setActiveFile } = useContext(CanvasContext);

  return (
    <ul className={classNames(styles.files, { [styles.large]: large })}>
      {files.map((file, index) => {
        const [type, icon] = getFileTypeAndIcon(file.mimeType, file.name);
        return (
          <li key={index}>
            <a className={styles.file} onClick={() => setActiveFile(file)}>
              <img className={styles.icon} src={icon} width={26} height={32} />
              <div className={styles.content}>
                <div className={styles.name}>{file.name || t(K.UNTITLED)}</div>
                <div className={styles.metadata}>
                  {`${type}${file.size ? ` · ${formatFileSize(file.size)}` : ""}`}
                </div>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
