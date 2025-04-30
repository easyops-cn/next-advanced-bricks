import React, { memo } from "react";
import { ReactUseBrick } from "@next-core/react-runtime";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";

import { WorkbenchComponent, ExtraLayout } from "../interfaces";

import styles from "./DroppableComponentLayoutItem.module.css";
import { cloneDeep } from "lodash";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface DroppableComponentLayoutItemProps {
  component: WorkbenchComponent;
  layout: ExtraLayout;
  isEdit?: boolean;
  onDelete?(i: string): void;
}

export function DroppableComponentLayoutItemElement(
  props: DroppableComponentLayoutItemProps
): React.ReactElement {
  const { component, isEdit, onDelete, layout } = props;

  const handleEditMaskClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onDelete?.(layout.i);
  };

  return (
    <>
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
    </>
  );
}

export const DroppableComponentLayoutItem = memo(
  DroppableComponentLayoutItemElement
);
