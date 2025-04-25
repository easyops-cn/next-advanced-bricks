import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import styles from "./PlanProgress.module.css";
import type { JobState, StepWithState, TaskState } from "../interfaces";
import { WrappedIcon } from "../bricks";
import { K, t } from "../i18n";

export interface PlanProgressProps {
  plan: StepWithState[];
  state?: TaskState;
}

interface PlanProgressStat {
  doneCount: number;
  instruction: string;
}

export function PlanProgress({
  plan,
  state,
}: PlanProgressProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(false);
  const completed = state === "completed";

  const { doneCount, instruction } = useMemo(() => {
    return plan.reduce<PlanProgressStat>(
      (acc, step) => {
        if (step.state === "completed") {
          return {
            ...acc,
            doneCount: acc.doneCount + 1,
          };
        } else if (!acc.instruction) {
          return {
            ...acc,
            instruction: step.instruction,
          };
        }
        return acc;
      },
      {
        doneCount: 0,
        instruction: "",
      }
    );
  }, [plan]);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // const taskProps = useMemo(() => {

  // }, []);

  if (plan.length === 0) {
    return null;
  }

  return (
    <div
      className={classNames(styles.progress, { [styles.completed]: completed })}
      onClick={toggle}
    >
      {completed ? (
        <WrappedIcon
          className={styles.icon}
          lib="antd"
          theme="outlined"
          icon="check-circle"
        />
      ) : (
        <WrappedIcon
          className={styles.icon}
          lib="antd"
          theme="outlined"
          icon="loading-3-quarters"
          spinning
        />
      )}
      <span className={styles.text}>
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
        <ul className={styles.details}>
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
  const iconProps = useMemo(() => {
    switch (state) {
      case "completed":
        return {
          className: styles.completed,
          lib: "fa",
          prefix: "far",
          icon: "circle-check",
        };
      case "failed":
        return {
          className: styles.failed,
          lib: "fa",
          prefix: "far",
          icon: "circle-close",
        };
      case "canceled":
        return {
          className: styles.canceled,
          lib: "fa",
          prefix: "far",
          icon: "circle-stop",
        };
      case "working":
        return {
          className: styles.working,
          lib: "lib",
          theme: "outlined",
          icon: "loading-3-quarters",
        };
      case "input-required":
        return {
          className: styles.working,
          lib: "fa",
          prefix: "far",
          icon: "circle-pause",
        };
      default:
        return {
          className: styles.unknown,
          lib: "fa",
          prefix: "far",
          icon: "circle-question",
        };
    }
  }, [state]);

  return (
    <li className={styles.step}>
      <WrappedIcon
        {...iconProps}
        className={`${styles.state} ${iconProps.className}`}
      />
      <span className={styles.instruction}>{instruction}</span>
    </li>
  );
}
