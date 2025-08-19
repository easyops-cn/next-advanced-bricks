import React, { memo, useEffect, useMemo, useState } from "react";
import { ReactUseBrick } from "@next-core/react-runtime";
import { wrapBrick } from "@next-core/react-element";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";

import { WorkbenchComponent, ExtraLayout } from "../interfaces";

import styles from "./DroppableComponentLayoutItem.module.css";
import { cloneDeep, isEqual, omit } from "lodash";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface DroppableComponentLayoutItemProps {
  component: WorkbenchComponent;
  layout: ExtraLayout;
  isEdit?: boolean;
  onDelete?(i: string): void;
}

const position = ["x", "y", "w", "h"];

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
  /**
   * cloneDeep 操作是为了让 useBrick事件抛出的值是计算后的值
   */
  const useBrick = useMemo(
    () => cloneDeep(component.useBrick),
    [component.useBrick]
  );
  const [cardConfigs, setCardConfigs] = useState(() =>
    omit(
      {
        ...layout,
        cardWidth: layout.cardWidth || component.position.w,
        cardTitle: component.title,
      },
      position
    )
  );

  // todo 用于处理 layout 重新渲染导致页面卡顿
  /* istanbul ignore next */
  useEffect(() => {
    const newCardConfigs = omit(
      {
        ...layout,
        cardWidth: layout.cardWidth || component.position.w,
      },
      position
    );

    if (!isEqual(newCardConfigs, cardConfigs)) {
      setCardConfigs(newCardConfigs);
    }
  }, [layout, cardConfigs, component.position.w]);

  const cardBorderWidth = useMemo(() => {
    return cardConfigs?.cardBorderWidth !== 1
      ? (cardConfigs?.cardBorderWidth as any) - 1
      : 0;
  }, [cardConfigs]);

  const editMaskTop = useMemo(() => {
    return 45 + cardBorderWidth;
  }, [cardBorderWidth]);

  const deleteIconPosition = useMemo(() => {
    const top = 15 + cardBorderWidth;
    return {
      top: !layout.noPadding ? top : 0,
      right: top,
    };
  }, [cardBorderWidth]);

  return (
    <div className={styles.itemWrapper}>
      {isEdit && (
        <div
          className={styles.editMask}
          style={{
            top: editMaskTop,
          }}
          onMouseDown={handleEditMaskClick}
          data-testid="droppable-component-layout-item-edit-mask"
        />
      )}
      <ReactUseBrick useBrick={useBrick} data={cardConfigs} />
      {isEdit && (
        <WrappedIcon
          icon="delete"
          lib="antd"
          style={deleteIconPosition}
          className={styles.deleteIcon}
          onClick={handleDeleteClick}
          data-testid="droppable-component-layout-item-delete"
        />
      )}
    </div>
  );
}

export const DroppableComponentLayoutItem = memo(
  DroppableComponentLayoutItemElement
);
