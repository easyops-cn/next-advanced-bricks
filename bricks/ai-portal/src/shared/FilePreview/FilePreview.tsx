import React, { useCallback, useContext, useEffect, useState } from "react";
import classNames from "classnames";
import { initializeI18n } from "@next-core/i18n";
import type { FileInfo } from "../../shared/interfaces";
import {
  WrappedIcon,
  WrappedButton,
  WrappedIconButton,
} from "../../shared/bricks";
import styles from "./FilePreview.module.css";
import shareStyles from "../../cruise-canvas/shared.module.css";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown";
import { K, locales, NS, t } from "./i18n";
import {
  ICON_CLOSE,
  ICON_DOWNLOAD,
  ICON_LOADING,
} from "../../shared/constants";
import { getMimeTypeByFilename } from "../../cruise-canvas/utils/file";
import imageUnpreviewable from "./unpreviewable.png";
import { downloadFile } from "./downloadFile";
import { getImageUrl } from "./getImageUrl";
import toolbarStyles from "../../cruise-canvas/toolbar.module.css";
import { TaskContext } from "../TaskContext";

initializeI18n(NS, locales);

export interface FilePreviewProps {
  file: FileInfo;
}

export function FilePreview({ file }: FilePreviewProps) {
  const { setActiveFile } = useContext(TaskContext);
  const { bytes, uri, mimeType, name } = file;
  const type = mimeType || getMimeTypeByFilename(name);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  // For PDF, content is the object URL or data URL
  // For markdown, content is the content text
  const [content, setContent] = useState<string | undefined>();

  const isMarkdown = type === "text/markdown" || type === "text/x-markdown";
  const embeddable = type === "application/pdf";
  const isImage = type.startsWith("image/");

  useEffect(() => {
    // When using `<embed>` to display PDF from a URL, which responses with
    // `Content-Disposition: attachment`, the PDF will be downloaded instead of
    // being displayed by the browser. So we need to fetch the file and create an object URL.
    setStatus("loading");

    if (!isMarkdown && !embeddable && !isImage) {
      setStatus("error");
      return;
    }

    if (bytes) {
      if (isMarkdown) {
        setContent(atob(bytes));
      } else {
        setContent(`data:application/pdf;base64,${bytes}`);
      }
      setStatus("loaded");
      return;
    }

    if (uri) {
      let ignore = false;
      let revokeUrl: string | undefined;
      (async () => {
        try {
          const response = await fetch(getImageUrl(uri));
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          let text: string;
          if (isMarkdown) {
            text = await response.text();
          } else {
            const blob = await response.blob();
            revokeUrl = text = URL.createObjectURL(blob);
          }
          if (ignore) {
            return;
          }
          setContent(text);
          setStatus("loaded");
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error("Error fetching file:", error);
          setStatus("error");
        }
      })();
      return () => {
        ignore = true;
        if (revokeUrl) {
          URL.revokeObjectURL(revokeUrl);
        }
      };
    }
  }, [bytes, isImage, isMarkdown, embeddable, uri]);

  const download = useCallback(() => {
    downloadFile(file);
  }, [file]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveFile(null);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [setActiveFile]);

  return (
    <div className={styles.preview}>
      <div className={styles.header}>
        <div className={styles.title}>{file.name || t(K.UNTITLED)}</div>
        <div className={styles.toolbar}>
          <WrappedIconButton
            icon={ICON_DOWNLOAD}
            onClick={() => {
              download();
            }}
          />
          <div className={toolbarStyles.divider} />
          <WrappedIconButton
            icon={ICON_CLOSE}
            onClick={() => {
              setActiveFile(null);
            }}
          />
        </div>
      </div>
      <div className={styles.body}>
        {status === "loading" ? (
          <div className={styles.loading}>
            <WrappedIcon {...ICON_LOADING} />
          </div>
        ) : status === "error" ? (
          <div className={styles.error}>
            <img
              src={imageUnpreviewable}
              alt="Unpreviewable"
              width={591}
              height={249}
            />
            <p>
              {t(K.FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX)}
              <WrappedButton
                themeVariant="elevo"
                type="primary"
                onClick={download}
              >
                {t(K.DOWNLOAD)}
              </WrappedButton>
              {t(K.FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX)}
            </p>
          </div>
        ) : isImage ? (
          <div className={styles.image}>
            <img src={content} alt={name} />
          </div>
        ) : embeddable ? (
          <embed
            className={styles.embed}
            src={content}
            type={type}
            title={name}
            width="100%"
            height="100%"
          />
        ) : (
          <div className={classNames(styles.markdown, shareStyles.markdown)}>
            <EnhancedMarkdown content={content} />
          </div>
        )}
      </div>
    </div>
  );
}
