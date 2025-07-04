// istanbul ignore file: experimental
import React, { useCallback } from "react";
import styles from "./ZoomBar.module.css";
import toolbarStyles from "../toolbar.module.css";
import { WrappedIcon } from "../bricks";
import { K, t } from "../i18n";

export interface ZoomBarProps {
  scale: number;
  onScaleChange?: (scale: number) => void;
  onReCenter?: () => void;
}

export function ZoomBar({
  scale,
  onScaleChange,
  onReCenter,
}: ZoomBarProps): JSX.Element {
  const handleZoomIn = useCallback(() => {
    onScaleChange?.(scale + 0.1);
  }, [onScaleChange, scale]);

  const handleZoomOut = useCallback(() => {
    onScaleChange?.(scale - 0.1);
  }, [onScaleChange, scale]);

  return (
    <div className={`${toolbarStyles.toolbar} ${styles["zoom-bar"]}`}>
      <button onClick={onReCenter} title={t(K.BACK_TO_CENTER)}>
        <WrappedIcon lib="easyops" icon="back-to-center" />
      </button>
      <div className={toolbarStyles.divider}></div>
      <button onClick={handleZoomOut} title={t(K.ZOOM_OUT)}>
        <WrappedIcon lib="antd" theme="outlined" icon="minus-circle" />
      </button>
      <button onClick={handleZoomIn} title={t(K.ZOOM_IN)}>
        <WrappedIcon lib="antd" theme="outlined" icon="plus-circle" />
      </button>
    </div>
  );
}
