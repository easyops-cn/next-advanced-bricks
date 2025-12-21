import React from "react";
import styles from "./EmptyState.module.css";

import EmptyStateIcon from "../images/empty.svg";

/**
 * EmptyState 组件 Props
 */
export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * 空状态组件
 * 用于展示无数据时的提示信息
 */
export function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps): React.ReactElement {
  return (
    <div className={styles.emptyState}>
      {icon ? icon : <EmptyStateIcon className={styles.emptyStateIcon} />}
      <div className={styles.emptyStateTitle}>{title}</div>
      {description && (
        <div className={styles.emptyStateDescription}>{description}</div>
      )}
    </div>
  );
}
