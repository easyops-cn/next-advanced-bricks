import React, { useCallback, useContext, useEffect, useState } from "react";
import type { ActiveImages, FileInfo } from "../interfaces";
import styles from "./ImagesPreview.module.css";
import { WrappedIcon, WrappedIconButton } from "../bricks";
import { ICON_CLOSE, ICON_DOWNLOAD } from "../constants";
import { downloadFile } from "./downloadFile";
import { getImageUrl } from "./getImageUrl";
import { TaskContext } from "../TaskContext";
import { K, t } from "./i18n";
import floatingStyles from "../FloatingButton.module.css";

export interface ImagesPreviewProps {
  images: ActiveImages;
}

export function ImagesPreview({ images: { files, file } }: ImagesPreviewProps) {
  const [currentFile, setCurrentFile] = useState<FileInfo>(file);
  const { setActiveImages } = useContext(TaskContext);

  useEffect(() => {
    setCurrentFile(file);
  }, [file]);

  const go = useCallback(
    (diff: number) => {
      const currentIndex = files.indexOf(currentFile);
      let newIndex = currentIndex + diff;
      if (newIndex < 0) {
        newIndex = files.length - 1;
      } else if (newIndex >= files.length) {
        newIndex = 0;
      }
      setCurrentFile(files[newIndex]);
    },
    [currentFile, files]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        go(-1);
      } else if (e.key === "ArrowRight") {
        go(1);
      } else {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [go, setActiveImages]);

  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <WrappedIconButton
          icon={ICON_DOWNLOAD}
          onClick={() => {
            downloadFile(currentFile);
          }}
        >
          {t(K.DOWNLOAD)}
        </WrappedIconButton>
      </div>
      <div className={styles.body}>
        <div className={styles.aside}>
          <button
            className={floatingStyles["floating-button"]}
            onClick={() => {
              go(-1);
            }}
          >
            <WrappedIcon lib="antd" icon="left" />
          </button>
        </div>
        <div className={styles.content}>
          <img src={getImageUrl(currentFile.uri!)} alt={currentFile.name} />
        </div>
        <div className={styles.aside}>
          <button
            className={floatingStyles["floating-button"]}
            onClick={() => {
              go(1);
            }}
          >
            <WrappedIcon lib="antd" icon="right" />
          </button>
        </div>
      </div>
      <div className={styles.footer}>
        <ul className={styles.images}>
          {files.map((f, index) => {
            const isActive = f === currentFile;
            return (
              <li
                key={index}
                className={isActive ? styles.active : undefined}
                onClick={() => setCurrentFile(f)}
              >
                <img
                  src={getImageUrl(f.uri!)}
                  alt={f.name}
                  fetchPriority="low"
                />
              </li>
            );
          })}
        </ul>
      </div>
      <WrappedIconButton
        className={styles.close}
        icon={ICON_CLOSE}
        onClick={() => {
          setActiveImages(null);
        }}
      />
    </div>
  );
}
