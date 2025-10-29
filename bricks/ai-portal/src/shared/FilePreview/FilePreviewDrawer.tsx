import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Drawer } from "@next-bricks/containers/drawer";
import type { FileInfo } from "../interfaces";
import { WrappedDrawer, WrappedIconButton } from "../bricks";
import styles from "./FilePreviewDrawer.module.css";
import toolbarStyles from "../../cruise-canvas/toolbar.module.css";
import { K, t } from "./i18n";
import { ICON_CLOSE, ICON_DOWNLOAD } from "../constants";
import { TaskContext } from "../TaskContext";
import { FilePreview, FilePreviewRef } from "../FilePreview/FilePreview";

export interface FilePreviewDrawerProps {
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

export function FilePreviewDrawer({ file }: FilePreviewDrawerProps) {
  const ref = useRef<Drawer>(null);
  const previewRef = useRef<FilePreviewRef>(null);
  const { setActiveFile } = useContext(TaskContext);

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
      themeVariant="elevo"
      onClose={handleClose}
    >
      <FilePreview ref={previewRef} file={file} />
      <div slot="extra" className={styles.toolbar}>
        <WrappedIconButton
          icon={ICON_DOWNLOAD}
          onClick={() => {
            previewRef.current?.download();
          }}
        />
        <div className={toolbarStyles.divider} />
        <WrappedIconButton icon={ICON_CLOSE} onClick={handleClickClose} />
      </div>
    </WrappedDrawer>
  );
}
