import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dragImage from "./drag-file@2x.png";
import { K, t } from "./i18n";
import styles from "./GlobalDragOverlay.module.css";
import { validateFiles } from "./validateFiles";
import type { UploadOptions } from "../interfaces";

export interface GlobalDragOverlayProps {
  disabled?: boolean;
  uploadOptions?: UploadOptions;
  onFilesDropped?: (files: File[]) => void;
}

export default function GlobalDragOverlay({
  disabled,
  uploadOptions,
  onFilesDropped,
}: GlobalDragOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    if (disabled) {
      dragCounterRef.current = 0;
      setIsDragging(false);
      return;
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      for (const target of e.composedPath()) {
        if (
          target instanceof HTMLElement &&
          (target.tagName === "EO-DRAWER" || target.tagName === "EO-MODAL")
        ) {
          return;
        }
      }

      // 只在拖入文件时触发（排除文字、链接等）
      const hasFiles = Array.from(e.dataTransfer?.items || []).some(
        (item) => item.kind === "file"
      );
      if (!hasFiles) return;

      dragCounterRef.current++;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragCounterRef.current > 0) {
        dragCounterRef.current--;
      }
      if (dragCounterRef.current === 0) setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer!.files);
      if (files.length > 0) {
        const allFilesAccepted = validateFiles(files, uploadOptions!);
        if (allFilesAccepted) {
          onFilesDropped?.(files);
        }
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [disabled, uploadOptions, onFilesDropped]);

  if (!isDragging) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <img src={dragImage} width="91" height="79" />
      <div className={styles.title}>{t(K.DROP_FILES_HERE)}</div>
      <div className={styles.description}>{uploadOptions?.dragTips}</div>
    </div>,
    document.body
  );
}
