import React, { useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import styles from "./Nav.module.css";
import type { GraphNavItem } from "../interfaces";
import { WrappedIcon } from "../../shared/bricks";
import { DONE_STATES } from "../../shared/constants";
import type {
  ConversationState,
  JobState,
  TaskState,
} from "../../shared/interfaces";

export interface NavProps {
  nav: GraphNavItem[] | undefined;
  currentNavId: string | null;
  taskState: TaskState | ConversationState | undefined;
  onClick: (jobId: string) => void;
}

interface MergedNavItem extends Omit<GraphNavItem, "state"> {
  disabled?: boolean;
  state?: JobState;
}

export function Nav({ nav, currentNavId, taskState, onClick }: NavProps) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const navElement = ref.current;
    if (!navElement || !currentNavId) {
      return;
    }
    navElement
      .querySelector(`[data-job-id="${currentNavId}"]`)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
  }, [currentNavId]);

  useEffect(() => {
    const navElement = ref.current;
    if (!navElement || currentNavId) {
      return;
    }

    const lastActiveItem = nav?.findLast(
      (item) =>
        DONE_STATES.includes(item.state || "unknown") ||
        item.state === "working" ||
        item.state === "input-required"
    );
    if (lastActiveItem) {
      navElement
        .querySelector(`[data-job-id="${lastActiveItem.id}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
    }
  }, [currentNavId, nav]);

  return (
    <div className={styles.container}>
      <ul className={styles.nav} ref={ref}>
        {nav?.map((item) => (
          <NavItem
            key={item.id}
            {...item}
            currentNavId={currentNavId}
            taskState={taskState}
            onClick={onClick}
          />
        ))}
      </ul>
    </div>
  );
}

interface NavItemProps extends MergedNavItem {
  currentNavId: string | null;
  taskState: TaskState | ConversationState | undefined;
  onClick: (jobId: string) => void;
}

function NavItem({
  id,
  title,
  state,
  level,
  taskState,
  currentNavId,
  disabled,
  onClick,
}: NavItemProps) {
  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(state, taskState);
  }, [state, taskState]);

  return (
    <li
      className={classNames(styles.item, {
        [styles.active]: currentNavId === id,
      })}
      style={{ marginLeft: `${level * 20}px` }}
    >
      <a
        className={classNames(styles.link, className, {
          [styles.disabled]: disabled,
        })}
        data-job-id={id}
        title={title}
        onClick={() => {
          if (!disabled) {
            onClick(id);
          }
        }}
      >
        <WrappedIcon className={styles.icon} {...icon} />
        <span className={styles.text}>{title}</span>
      </a>
    </li>
  );
}

function getClassNameAndIconProps(
  state: JobState | undefined,
  taskState: TaskState | ConversationState | undefined
) {
  switch (state) {
    case "completed":
      return {
        className: styles.completed,
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "check",
        },
      };
    case "submitted":
    case "working":
      if (taskState === "terminated") {
        return {
          icon: {
            lib: "fa",
            prefix: "far",
            icon: "circle-stop",
          },
        };
      }
      return {
        className: styles.working,
        icon: {
          lib: "antd",
          theme: "outlined",
          icon: "loading-3-quarters",
          spinning: true,
        },
      };
    case "input-required":
      return {
        className: styles["input-required"],
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "circle-user",
        },
      };
    case "failed":
      return {
        className: styles.failed,
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "xmark",
        },
      };
    case "canceled":
    case "terminated" as JobState:
      return {
        className: styles.canceled,
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "circle-stop",
        },
      };
    case "skipped":
      return {
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "ban",
        },
      };
    default:
      return {
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "clock",
        },
      };
  }
}
