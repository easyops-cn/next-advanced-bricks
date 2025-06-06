// istanbul ignore file: experimental
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import classNames from "classnames";
import styles from "./PlanProgress.module.css";
import type { JobState, StepWithState, TaskState } from "../interfaces";
import { WrappedIcon, WrappedTooltip, showDialog } from "../bricks";
import { K, t } from "../i18n";
import { DONE_STATES } from "../constants";
import { CanvasContext } from "../CanvasContext";

export interface PlanProgressProps {
  plan?: StepWithState[];
  state?: TaskState;
}

interface PlanProgressStat {
  doneCount: number;
  instruction: string;
  state: JobState | undefined;
}

export function PlanProgress({
  plan,
  state: taskState,
}: PlanProgressProps): JSX.Element | null {
  const { onPause, onResume, onCancel } = useContext(CanvasContext);
  const [expanded, setExpanded] = useState(false);
  const [actionBeingTaken, setActionBeingTaken] = useState<
    "toggle" | "cancel" | null
  >(null);

  useEffect(() => {
    setActionBeingTaken(null);
  }, [taskState]);

  const {
    doneCount,
    state: jobState,
    instruction,
  } = useMemo(() => {
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
    return getClassNameAndIconProps(jobState, taskState);
  }, [jobState, taskState]);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const handleResume = useCallback(() => {
    onResume();
    setActionBeingTaken("toggle");
  }, [onResume]);

  const handlePause = useCallback(() => {
    onPause();
    setActionBeingTaken("toggle");
  }, [onPause]);

  const handleStop = useCallback(async () => {
    try {
      await showDialog({
        type: "confirm",
        title: t(K.CONFIRM_TO_CANCEL_THE_TASK_TITLE),
        content: t(K.CONFIRM_TO_CANCEL_THE_TASK_CONTENT),
      });
    } catch {
      return;
    }
    onCancel();
    setActionBeingTaken("cancel");
  }, [onCancel]);

  if (!plan?.length) {
    return null;
  }

  const taskDone = DONE_STATES.includes(taskState!);
  const canIntercept = !taskDone && jobState !== "input-required";

  return (
    <div className={classNames(styles.progress, className)}>
      <div className={styles.bar} onClick={toggle}>
        <div className={styles.icon}>
          <WrappedIcon {...icon} />
        </div>
        <span
          className={styles.text}
          title={jobState === "completed" ? "" : instruction}
        >
          {jobState === "completed" ? t(K.PLAN_COMPLETED) : instruction}
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
      {canIntercept && (
        <div className={styles.actions}>
          {actionBeingTaken === "toggle" ? (
            <WrappedTooltip>
              <button disabled className={styles.action}>
                <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
              </button>
            </WrappedTooltip>
          ) : taskState === "paused" ? (
            <WrappedTooltip
              content={actionBeingTaken ? undefined : t(K.RESUME_THE_TASK)}
              onClick={handleResume}
            >
              <button disabled={!!actionBeingTaken} className={styles.action}>
                <WrappedIcon lib="fa" prefix="far" icon="circle-play" />
              </button>
            </WrappedTooltip>
          ) : (
            <WrappedTooltip
              content={actionBeingTaken ? undefined : t(K.PAUSE_THE_TASK)}
              onClick={handlePause}
            >
              <button disabled={!!actionBeingTaken} className={styles.action}>
                <WrappedIcon lib="fa" prefix="far" icon="circle-pause" />
              </button>
            </WrappedTooltip>
          )}
          {actionBeingTaken === "cancel" ? (
            <WrappedTooltip>
              <button disabled className={styles.action}>
                <WrappedIcon lib="antd" icon="loading-3-quarters" spinning />
              </button>
            </WrappedTooltip>
          ) : (
            <WrappedTooltip
              content={actionBeingTaken ? undefined : t(K.CANCEL_THE_TASK)}
              onClick={handleStop}
            >
              <button disabled={!!actionBeingTaken} className={styles.action}>
                <WrappedIcon lib="fa" prefix="far" icon="circle-stop" />
              </button>
            </WrappedTooltip>
          )}
        </div>
      )}
      {expanded && (
        <ul className={styles.details}>
          {plan.map((step, index) => (
            <PlanStep
              key={index}
              state={step.state}
              taskState={taskState}
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
  taskState?: TaskState;
  instruction: string;
}

function PlanStep({ state, taskState, instruction }: PlanStepProps) {
  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(state, taskState);
  }, [state, taskState]);

  return (
    <li className={styles.step}>
      <WrappedIcon {...icon} className={classNames(styles.state, className)} />
      <span className={styles.instruction} title={instruction}>
        {instruction}
      </span>
    </li>
  );
}

function getClassNameAndIconProps(
  state: JobState | undefined,
  taskState?: TaskState
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
          className: undefined,
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
