// istanbul ignore file: experimental
import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";
import { initializeI18n } from "@next-core/i18n";
import styles from "./PlanProgress.module.css";
import type {
  ConversationState,
  JobState,
  PlanProgressStep,
  TaskState,
} from "../interfaces";
import { WrappedIcon } from "../../shared/bricks";
import { K, locales, NS, t } from "./i18n";

initializeI18n(NS, locales);

export interface PlanProgressProps {
  plan: PlanProgressStep[];
  conversationState?: ConversationState;
  style?: React.CSSProperties;
}

interface PlanProgressStat {
  doneCount: number;
  name: string;
  // `state` is undefined when it is not started.
  state: TaskState | undefined;
}

export function PlanProgress({
  plan,
  conversationState,
  style,
}: PlanProgressProps): JSX.Element | null {
  const [expanded, setExpanded] = useState(false);

  const { doneCount, state, name } = useMemo(() => {
    return plan.reduce<PlanProgressStat>(
      (acc, step) => {
        if (step.state === "completed") {
          return {
            ...acc,
            state: step.state,
            name: step.name,
            doneCount: acc.doneCount + 1,
          };
        } else if (!acc.name || step.state) {
          return {
            ...acc,
            state: step.state,
            name: step.name,
          };
        }
        return acc;
      },
      {
        doneCount: 0,
        name: "",
        state: undefined,
      }
    );
  }, [plan]);

  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(state, conversationState);
  }, [state, conversationState]);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (!plan?.length) {
    return null;
  }

  const allDone =
    doneCount === plan.length && conversationState === "completed";

  return (
    <>
      {expanded && <div className={styles.mask} onClick={toggle} />}
      <div className={classNames(styles.progress, className)} style={style}>
        <div className={styles.bar} onClick={toggle}>
          <div className={styles.icon}>
            <WrappedIcon {...icon} />
          </div>
          <span className={styles.text} title={allDone ? "" : name}>
            {allDone ? t(K.PLAN_COMPLETED) : name}
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
        </div>
        {expanded && (
          <ul className={styles.details}>
            {plan.map((step, index) => (
              <PlanProgressStep
                key={index}
                state={step.state}
                conversationState={conversationState}
                name={step.name}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

interface PlanStepProps {
  state?: TaskState;
  conversationState?: ConversationState;
  name: string;
}

function PlanProgressStep({ state, conversationState, name }: PlanStepProps) {
  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(state, conversationState);
  }, [state, conversationState]);

  return (
    <li className={classNames(styles.step, className)}>
      <WrappedIcon {...icon} className={styles.state} />
      <span className={styles.name} title={name}>
        {name}
      </span>
    </li>
  );
}

function getClassNameAndIconProps(
  state: JobState | TaskState | ConversationState | undefined,
  conversationState?: JobState | TaskState | ConversationState
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
      if (conversationState === "terminated") {
        return {
          className: undefined,
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
