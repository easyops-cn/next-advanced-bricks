import React, { useMemo } from "react";
import styles from "./PlanProgress.module.css";
import type { JobState, StepWithState } from "../interfaces";

export interface PlanProgressProps {
  plan: StepWithState[];
}

interface PlanProgressStat {
  doneCount: number;
  instruction: string;
}

const COMPLETED_STATES = ["completed", "failed", "canceled"] as JobState[];

export function PlanProgress({ plan }: PlanProgressProps): JSX.Element | null {
  const { doneCount, instruction } = useMemo(() => {
    return plan.reduce<PlanProgressStat>(
      (acc, step, index) => {
        if (COMPLETED_STATES.includes(step.state!)) {
          return {
            ...acc,
            doneCount: acc.doneCount + 1,
            ...(!acc.instruction && index === plan.length - 1
              ? { instruction: step.instruction }
              : null),
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

  if (plan.length === 0) {
    return null;
  }

  return (
    <div className={styles["plan-progress"]}>
      <span className={styles["progress-text"]}>{instruction}</span>
      <span className={styles["progress-stat"]}>
        {doneCount}/{plan.length}
      </span>
    </div>
  );
}
