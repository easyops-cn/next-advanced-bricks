import React, { useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import styles from "./Nav.module.css";
import type {
  GraphNavItem,
  Job,
  JobState,
  Step,
  TaskState,
} from "../interfaces";
import { WrappedIcon } from "../../shared/bricks";
import { DONE_STATES } from "../../shared/constants";

export interface NavProps {
  nav: GraphNavItem[] | undefined;
  plan: Step[] | undefined;
  jobs: Job[] | undefined;
  jobLevels: Map<string, number> | undefined;
  currentNavId: string | null;
  taskState: TaskState | undefined;
  onClick: (jobId: string) => void;
}

interface MergedNavItem extends Omit<GraphNavItem, "state"> {
  disabled?: boolean;
  state?: JobState;
}

export function Nav({
  nav,
  plan,
  jobs,
  jobLevels,
  currentNavId,
  taskState,
  onClick,
}: NavProps) {
  const mergedNav = useMemo<MergedNavItem[] | undefined>(() => {
    const unmatchedSteps = plan?.filter(
      (step) => !nav?.find((job) => job.id === step.id)
    );

    if (!unmatchedSteps?.length) {
      return nav;
    }

    // For the steps in plan that are not matched in nav,
    // We need to insert them into the nav at the correct position
    const insertsBefore = new Map<string | null, Step[]>();
    let cursor: string | null = null;

    for (let index = plan!.length - 1; index >= 0; index--) {
      const step = plan![index];
      if (unmatchedSteps.includes(step)) {
        let list = insertsBefore.get(cursor);
        if (!list) {
          insertsBefore.set(cursor, (list = []));
        }
        list.unshift(step);
      } else {
        cursor = step.id;
      }
    }

    const fixedNav = nav ?? [];
    const mergedNav: MergedNavItem[] = [...fixedNav];
    for (const [cursor, steps] of insertsBefore.entries()) {
      const cursorIndex =
        cursor === null
          ? mergedNav.length
          : mergedNav.findIndex((item) => item.id === cursor);

      // If the next step state is done, mark the inserted plan steps as skipped
      const nextStep = mergedNav[cursorIndex];
      const skipped = DONE_STATES.includes(nextStep?.state || "unknown");

      mergedNav.splice(
        cursorIndex,
        0,
        ...steps.map<MergedNavItem>((step) => {
          const job = jobs?.find((job) => job.id === step.id);
          const level = jobLevels?.get(step.id);
          return {
            id: step.id,
            title: step.instruction,
            state: job?.state ?? (skipped ? "skipped" : undefined),
            level: level ?? 0,
            disabled: true,
          };
        })
      );
    }

    return mergedNav;
  }, [nav, plan, jobs, jobLevels]);

  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const nav = ref.current;
    if (!nav || !currentNavId) {
      return;
    }
    nav.querySelector(`[data-job-id="${currentNavId}"]`)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [currentNavId]);

  useEffect(() => {
    const nav = ref.current;
    if (!nav || currentNavId) {
      return;
    }

    const lastActiveItem = mergedNav?.findLast(
      (item) =>
        DONE_STATES.includes(item.state || "unknown") ||
        item.state === "working" ||
        item.state === "input-required"
    );
    if (lastActiveItem) {
      nav
        .querySelector(`[data-job-id="${lastActiveItem.id}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
    }
  }, [currentNavId, mergedNav]);

  return (
    <div className={styles.container}>
      <ul className={styles.nav} ref={ref}>
        {mergedNav?.map((item) => (
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
  taskState: TaskState | undefined;
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
  taskState: TaskState | undefined
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
      if (taskState === "paused" || taskState === "canceled") {
        return {
          icon: {
            lib: "fa",
            prefix: "far",
            icon: taskState === "paused" ? "circle-pause" : "circle-stop",
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
