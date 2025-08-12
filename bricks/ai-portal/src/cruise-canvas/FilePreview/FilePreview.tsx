import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getBasePath } from "@next-core/runtime";
import type { Drawer } from "@next-bricks/containers/drawer";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import classNames from "classnames";
import { saveAs } from "file-saver";
import type { FileInfo } from "../interfaces";
import {
  WrappedDrawer,
  WrappedIconButton,
  WrappedIcon,
  WrappedButton,
} from "../../shared/bricks";
import { CanvasContext } from "../CanvasContext";
import styles from "./FilePreview.module.css";
import shareStyles from "../shared.module.css";
import toolbarStyles from "../toolbar.module.css";
import { EnhancedMarkdown } from "../EnhancedMarkdown/EnhancedMarkdown";
import { K, t } from "../i18n";
import { ICON_CLOSE, ICON_LOADING } from "../../shared/constants";
import { getMimeTypeByFilename } from "../utils/file";
import imageUnpreviewable from "../images/unpreviewable.png";

const ICON_DOWNLOAD: GeneralIconProps = {
  lib: "antd",
  icon: "download",
};

export interface FilePreviewProps {
  file: FileInfo;
}

function getDrawerWidth() {
  const { innerWidth } = window;
  return innerWidth < 800
    ? innerWidth
    : innerWidth < 1280
      ? innerWidth * 0.9
      : 1246;
}

export function FilePreview({ file }: FilePreviewProps) {
  const ref = useRef<Drawer>(null);
  const { setActiveFile } = useContext(CanvasContext);
  const { bytes, uri, mimeType, name } = file;
  const type = mimeType || getMimeTypeByFilename(name);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading"
  );

  const [content, setContent] = useState<string | undefined>();
  useEffect(() => {
    if (type === "application/pdf") {
      setStatus(uri || bytes ? "loaded" : "error");
      return;
    }

    setStatus("loading");
    if (type !== "text/markdown") {
      setStatus("error");
      return;
    }

    if (bytes) {
      setContent(atob(bytes));
      setStatus("loaded");
      return;
    }

    if (uri) {
      let ignore = false;
      (async () => {
        try {
          const response = await fetch(
            new URL(uri, `${location.origin}${getBasePath()}`)
          );
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
          }
          const text = await response.text();
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
      };
    }
  }, [bytes, type, uri]);

  const handleDownload = useCallback(() => {
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

  const handleClickClose = useCallback(() => {
    ref.current?.close();
  }, []);

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setActiveFile(null);
    }, 300);
  }, [setActiveFile]);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.open();
    });
  }, []);

  const [width, setWidth] = useState(getDrawerWidth);

  useEffect(() => {
    const onResize = () => {
      setWidth(getDrawerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <WrappedDrawer
      ref={ref}
      customTitle={file.name || t(K.UNTITLED)}
      width={width}
      closable={false}
      mask
      maskClosable
      keyboard
      onClose={handleClose}
    >
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
              onClick={handleDownload}
            >
              {t(K.DOWNLOAD)}
            </WrappedButton>
            {t(K.FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX)}
          </p>
        </div>
      ) : type === "application/pdf" ? (
        <embed
          className={styles.embed}
          src={
            uri
              ? new URL(uri, `${location.origin}${getBasePath()}`).toString()
              : `data:application/pdf;base64,${bytes}`
          }
          type={type}
          title={name}
          width="100%"
          height="100%"
        />
      ) : (
        <div className={classNames(styles.content, shareStyles.markdown)}>
          <EnhancedMarkdown content={content} />
        </div>
      )}
      <div slot="extra" className={styles.toolbar}>
        <WrappedIconButton icon={ICON_DOWNLOAD} onClick={handleDownload} />
        <div className={toolbarStyles.divider} />
        <WrappedIconButton icon={ICON_CLOSE} onClick={handleClickClose} />
      </div>
    </WrappedDrawer>
  );
}
