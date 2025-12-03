import React, { useContext } from "react";
import { isEqual } from "lodash";
import type { Job, Task } from "../interfaces";
import styles from "./AskUserTag.module.css";
import { DONE_STATES } from "../constants";
import { WrappedIcon } from "../bricks";
import { TaskContext } from "../TaskContext";

export interface AskUserTagProps {
  job: Job;
  task: Task | undefined;
}

export function AskUserTag({ job, task }: AskUserTagProps) {
  const { setActiveDetail } = useContext(TaskContext);
  const done = DONE_STATES.includes(task?.state);
  if (!done) {
    return null;
  }
  return (
    <div
      className={styles.tag}
      onClick={() => {
        if (task) {
          const detail = {
            type: "task" as const,
            id: task.id,
          };
          setActiveDetail((prev) => (isEqual(prev, detail) ? prev : detail));
        }
      }}
    >
      <WrappedIcon lib="antd" icon="check-circle" />
      {job.summary}
    </div>
  );
}
