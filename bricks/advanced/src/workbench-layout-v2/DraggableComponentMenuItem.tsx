import React from "react";
import { WorkbenchComponent } from "../interfaces";
import styles from "./DraggableComponentMenuItem.module.css";
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
  const { key, title, thumbnail } = component;

  return (
    <div
      className={styles.componentItemWrapper}
      data-testid="draggable-component-menu-item"
    >
      <div className={styles.componentItemTitle}>{title}</div>
      <div
        className={styles.componentItemContent}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", key);
          onDragStart?.();
        }}
        onDragEnd={onDragEnd}
        onClick={onClick}
        data-testid="draggable-component-menu-item-thumbnail"
      >
        <img
          className={styles.componentItemThumbnail}
          src={thumbnail}
          alt={title}
        />
      </div>
    </div>
  );
}
