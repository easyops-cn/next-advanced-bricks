// istanbul ignore file: experimental
import React, { useCallback } from "react";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import styles from "./ZoomBar.module.css";
import toolbarStyles from "../toolbar.module.css";
import { WrappedIconButton } from "../../shared/bricks";
import { K, t } from "../i18n";
import { ICON_CHAT } from "../../shared/constants";

const ICON_BACK_TO_CENTER: GeneralIconProps = {
  lib: "easyops",
  icon: "back-to-center",
};
const ICON_ZOOM_OUT: GeneralIconProps = {
  lib: "antd",
  icon: "minus-circle",
};
const ICON_ZOOM_IN: GeneralIconProps = {
  lib: "antd",
  icon: "plus-circle",
};

export interface ZoomBarProps {
  scale: number;
  showUiSwitch?: boolean;
  onScaleChange?: (scale: number) => void;
  onReCenter?: () => void;
  onSwitchToChat?: () => void;
}

export function ZoomBar({
  scale,
  showUiSwitch,
  onScaleChange,
  onReCenter,
  onSwitchToChat,
}: ZoomBarProps): JSX.Element {
  const handleZoomIn = useCallback(() => {
    onScaleChange?.(scale + 0.1);
  }, [onScaleChange, scale]);

  const handleZoomOut = useCallback(() => {
    onScaleChange?.(scale - 0.1);
  }, [onScaleChange, scale]);

  return (
    <div className={`${toolbarStyles.toolbar} ${styles["zoom-bar"]}`}>
      {showUiSwitch && (
        <>
          <WrappedIconButton
            variant="mini"
            icon={ICON_CHAT}
            onClick={onSwitchToChat}
          />
          <div className={toolbarStyles.divider}></div>
        </>
      )}
      <WrappedIconButton
        variant="mini"
        icon={ICON_BACK_TO_CENTER}
        onClick={onReCenter}
        title={t(K.BACK_TO_CENTER)}
      />
      <div className={toolbarStyles.divider}></div>
      <WrappedIconButton
        variant="mini"
        icon={ICON_ZOOM_OUT}
        onClick={handleZoomOut}
        title={t(K.ZOOM_OUT)}
      />
      <WrappedIconButton
        variant="mini"
        icon={ICON_ZOOM_IN}
        onClick={handleZoomIn}
        title={t(K.ZOOM_IN)}
      />
    </div>
  );
}
