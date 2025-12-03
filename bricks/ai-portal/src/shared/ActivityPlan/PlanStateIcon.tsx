import React from "react";
import classNames from "classnames";
import { WrappedIcon } from "../bricks";
import type { ConversationState, JobState, TaskState } from "../interfaces";
import styles from "./ActivityPlan.module.css";

export interface PlanStateIconProps {
  state: TaskState | JobState | ConversationState | undefined;
  filled?: boolean;
}

export function PlanStateIcon({ state, filled }: PlanStateIconProps) {
  switch (state) {
    case "input-required":
      return (
        <WrappedIcon
          lib="antd"
          theme={filled ? "filled" : "outlined"}
          icon="exclamation-circle"
          className={classNames(styles.icon, styles.paused)}
        />
      );
    case "completed":
      if (filled) {
        return (
          <span
            className={classNames(
              styles.icon,
              styles.stacked,
              styles.completed,
              {
                [styles.filled]: filled,
              }
            )}
          >
            <WrappedIcon lib="lucide" icon="check" strokeWidth={5} />
          </span>
        );
      }
      return (
        <WrappedIcon
          lib="antd"
          icon="check-circle"
          className={classNames(styles.icon, styles.completed)}
        />
      );
    case "working":
      return (
        <span
          className={classNames(styles.icon, styles.stacked, styles.working, {
            [styles.filled]: filled,
          })}
        >
          <WrappedIcon
            lib="lucide"
            icon="loader-2"
            spinning
            strokeWidth={filled ? 5 : 3}
          />
        </span>
      );
    case "failed":
      return (
        <WrappedIcon
          lib="antd"
          theme={filled ? "filled" : "outlined"}
          icon="close-circle"
          className={classNames(styles.icon, styles.failed)}
        />
      );
    case "terminated":
    case "canceled":
      return (
        <WrappedIcon
          lib="antd"
          theme={filled ? "filled" : "outlined"}
          icon="stop"
          className={styles.icon}
        />
      );
    default:
      return (
        <WrappedIcon
          lib="antd"
          theme={filled ? "filled" : "outlined"}
          icon="clock-circle"
          className={styles.icon}
        />
      );
  }
}
