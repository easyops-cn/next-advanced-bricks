import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type Ref,
} from "react";
import { getBasePath } from "@next-core/runtime";
import classNames from "classnames";
import { saveAs } from "file-saver";
import { initializeI18n } from "@next-core/i18n";
import type { FileInfo } from "../../shared/interfaces";
import { WrappedIcon, WrappedButton } from "../../shared/bricks";
import styles from "./FilePreview.module.css";
import shareStyles from "../../cruise-canvas/shared.module.css";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown";
import { K, locales, NS, t } from "./i18n";
import { ICON_LOADING } from "../../shared/constants";
import { getMimeTypeByFilename } from "../../cruise-canvas/utils/file";
import imageUnpreviewable from "./unpreviewable.png";

initializeI18n(NS, locales);

export interface FilePreviewProps {
  file: FileInfo;
}

export interface FilePreviewRef {
  download: () => void;
}

export const FilePreview = React.forwardRef<FilePreviewRef, FilePreviewProps>(
  LegacyFilePreview
);

function LegacyFilePreview(
  { file }: FilePreviewProps,
  ref: Ref<FilePreviewRef>
) {
  const { bytes, uri, mimeType, name } = file;
  const type = mimeType || getMimeTypeByFilename(name);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  // For PDF, content is the object URL or data URL
  // For markdown, content is the content text
  const [content, setContent] = useState<string | undefined>();

  const isMarkdown = type === "text/markdown";
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
          const response = await fetch(
            new URL(uri, `${location.origin}${getBasePath()}`)
          );
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
    const { bytes, uri, mimeType, name } = file;
    const filename = name || t(K.UNTITLED);
    if (bytes) {
      saveAs(new Blob([atob(bytes)], { type: mimeType }), filename);
    } else if (uri) {
      const link = document.createElement("a");
      link.href = new URL(uri, `${location.origin}${getBasePath()}`).toString();
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [file]);

  useImperativeHandle(
    ref,
    () => ({
      download,
    }),
    [download]
  );

  return status === "loading" ? (
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
        <WrappedButton themeVariant="elevo" type="primary" onClick={download}>
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
    <div className={classNames(styles.content, shareStyles.markdown)}>
      <EnhancedMarkdown content={content} />
    </div>
  );
}
