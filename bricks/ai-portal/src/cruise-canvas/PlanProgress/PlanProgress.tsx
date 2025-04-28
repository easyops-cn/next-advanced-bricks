// istanbul ignore file: experimental
import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import styles from "./PlanProgress.module.css";
import type { JobState, StepWithState } from "../interfaces";
import { WrappedIcon } from "../bricks";
import { K, t } from "../i18n";

export interface PlanProgressProps {
  plan?: StepWithState[];
}

interface PlanProgressStat {
  doneCount: number;
  instruction: string;
  state: JobState | undefined;
}

export function PlanProgress({ plan }: PlanProgressProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(false);

  const { doneCount, state, instruction } = useMemo(() => {
    return (plan ?? []).reduce<PlanProgressStat>(
      (acc, step) => {
        if (step.state === "completed") {
          return {
            ...acc,
            state: step.state,
            doneCount: acc.doneCount + 1,
          };
        } else if (
          !acc.instruction ||
          (step.state && step.state !== "unknown")
        ) {
          return {
            ...acc,
            state: step.state,
            instruction: step.instruction,
          };
        }
        return acc;
      },
      {
        doneCount: 0,
        state: "unknown",
        instruction: "",
      }
    );
  }, [plan]);

  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(state);
  }, [state]);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!plan?.length) {
    return null;
  }

  return (
    <div className={classNames(styles.progress, className)} onClick={toggle}>
      <div className={styles.icon}>
        <WrappedIcon {...icon} />
      </div>
      <span
        className={styles.text}
        title={state === "completed" ? "" : instruction}
      >
        {state === "completed" ? t(K.PLAN_COMPLETED) : instruction}
      </span>
      <span className={styles.stat}>
        {doneCount}/{plan.length}
      </span>
      <WrappedIcon
        className={styles.expand}
        lib="antd"
        theme="outlined"
        icon={expanded ? "down" : "up"}
      />
      {expanded && (
        <ul className={styles.details} onClick={(e) => e.stopPropagation()}>
          {plan.map((step, index) => (
            <PlanStep
              key={index}
              state={step.state}
              instruction={step.instruction}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface PlanStepProps {
  state?: JobState;
  instruction: string;
}

function PlanStep({ state, instruction }: PlanStepProps) {
  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(state);
  }, [state]);

  return (
    <li className={styles.step}>
      <WrappedIcon {...icon} className={classNames(styles.state, className)} />
      <span className={styles.instruction} title={instruction}>
        {instruction}
      </span>
    </li>
  );
}

function getClassNameAndIconProps(state: JobState | undefined) {
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
          icon: "circle-pause",
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
