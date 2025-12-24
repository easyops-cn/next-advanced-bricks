import React from "react";
import classNames from "classnames";
import styles from "./ActivityCard.module.css";

export interface ActivityCardProps {
  title: string;
  description: string;
  assignee?: string;
  active?: boolean;
  onClick?: () => void;
}

/**
 * 活动卡片组件
 * 参考设计图: node-id=125-2527
 * 展示活动名称、描述和负责人标签
 */
export function ActivityCard({
  title,
  description,
  assignee,
  active = false,
  onClick,
}: ActivityCardProps): React.ReactElement {
  return (
    <div
      className={classNames(styles.activityCard, {
        [styles.activityCardActive]: active,
      })}
      onClick={onClick}
    >
      <div className={styles.activityContent}>
        <div
          className={classNames(styles.activityName, {
            [styles.activityNameActive]: active,
          })}
          title={title}
        >
          {title}
        </div>
        <div className={styles.activityDescription} title={description}>
          {description}
        </div>
      </div>
      {assignee && <div className={styles.activityAssignee}>{assignee}</div>}
    </div>
  );
}
