import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { WorkbenchComponent } from "../interfaces";

import styles from "./DraggableComponentMenuItem.module.css";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface DraggableComponentMenuItemProps {
  component: WorkbenchComponent;
  onClick?(): void;
  onDragStart?(): void;
  onDragEnd?(): void;
}

export function DraggableComponentMenuItem(
  props: DraggableComponentMenuItemProps
): React.ReactElement {
  const { component, onClick, onDragStart, onDragEnd } = props;
  const { key, title } = component;

  return (
    <div
      className={styles.componentItemWrapper}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", key);
        onDragStart?.();
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
      data-testid="draggable-component-menu-item"
    >
      <WrappedIcon
        lib="antd"
        icon={"menu"}
        className={styles.componentItemIcon}
      />
      <span className={styles.componentItemTitle}>{title}</span>
    </div>
  );
}
