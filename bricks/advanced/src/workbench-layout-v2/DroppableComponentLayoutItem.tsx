import React from "react";
import { ReactUseBrick } from "@next-core/react-runtime";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { useDrop } from "react-dnd";

import { WorkbenchComponent, ExtraLayout } from "../interfaces";

import styles from "./DroppableComponentLayoutItem.module.css";
import { cloneDeep } from "lodash";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface DroppableComponentLayoutItemProps {
  component: WorkbenchComponent;
  layout?: ExtraLayout;
  isEdit?: boolean;
  onDrop?(component: WorkbenchComponent): void;
  onDelete?(): void;
}

export function DroppableComponentLayoutItem(
  props: DroppableComponentLayoutItemProps
): React.ReactElement {
  const { component, isEdit, onDrop, onDelete, layout } = props;

  const [, drop] = useDrop({
    accept: "component",
    drop: (component: WorkbenchComponent) => onDrop?.(component),
  });

  const handleEditMaskClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete?.();
  };

  return (
    <div className={styles.component} style={component.style} ref={drop}>
      {isEdit && (
        <div
          className={styles.editMask}
          onMouseDown={handleEditMaskClick}
          data-testid="droppable-component-layout-item-edit-mask"
        />
      )}
      <ReactUseBrick useBrick={cloneDeep(component.useBrick)} data={layout} />
      {isEdit && (
        <WrappedIcon
          icon="delete"
          lib="antd"
          className={styles.deleteIcon}
          onClick={handleDeleteClick}
          data-testid="droppable-component-layout-item-delete"
        />
      )}
    </div>
  );
}
