// istanbul ignore file: experimental
import React, { useCallback } from "react";
import styles from "./ZoomBar.module.css";
import toolbarStyles from "../toolbar.module.css";
import { WrappedIcon } from "../bricks";

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
      <button onClick={onReCenter}>
        <WrappedIcon lib="fa" prefix="fas" icon="expand" />
      </button>
      <div className={styles.divider}></div>
      <button onClick={handleZoomOut}>
        <WrappedIcon lib="antd" theme="outlined" icon="minus-circle" />
      </button>
      <button onClick={handleZoomIn}>
        <WrappedIcon lib="antd" theme="outlined" icon="plus-circle" />
      </button>
    </div>
  );
}
