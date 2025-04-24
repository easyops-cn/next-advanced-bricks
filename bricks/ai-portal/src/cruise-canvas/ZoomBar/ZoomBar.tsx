import React, { useCallback } from "react";
import styles from "./ZoomBar.module.css";

export interface ZoomBarProps {
  scale: number;
  onScaleChange?: (scale: number) => void;
}

export function ZoomBar({ scale, onScaleChange }: ZoomBarProps): JSX.Element {
  const handleZoomIn = useCallback(() => {
    onScaleChange?.(scale + 0.1);
  }, [onScaleChange, scale]);

  const handleZoomOut = useCallback(() => {
    onScaleChange?.(scale - 0.1);
  }, [onScaleChange, scale]);

  return (
    <div className={styles["zoom-bar"]}>
      <button onClick={handleZoomIn}>+</button>
      <button onClick={handleZoomOut}>-</button>
    </div>
  )
}
