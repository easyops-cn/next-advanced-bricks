import React, { useMemo } from "react";
import type { Job, TaskState } from "../../cruise-canvas/interfaces.js";
import styles from "./AssistantMessage.module.css";
import Avatar from "../images/avatar@2x.png";
import { NodeJob } from "../NodeJob/NodeJob.js";
import { DONE_STATES } from "../../cruise-canvas/constants.js";

export interface AssistantMessageProps {
  jobs: Job[];
  taskState: TaskState | undefined;
}

export function AssistantMessage({ jobs, taskState }: AssistantMessageProps) {
  const working = useMemo(() => {
    if (DONE_STATES.includes(taskState!)) {
      return false;
    }
    for (const job of jobs) {
      if (job.state === "input-required") {
        return false;
      }
      if (job.state === "working") {
        return true;
      }
    }
    return true;
  }, [jobs, taskState]);

  return (
    <div className={styles.assistant}>
      <div className={styles.avatar}>
        <img src={Avatar} width={32} height={32} alt="Elevo" />
      </div>
      <div className={styles.body}>
        {jobs.map((job) => (
          <NodeJob key={job.id} job={job} taskState={taskState} />
        ))}
        {working && <div className={styles.texting}></div>}
      </div>
    </div>
  );
}
