import React from "react";
import type { Job, TaskState } from "../../cruise-canvas/interfaces.js";
import styles from "./AssistantMessage.module.css";
import Avatar from "../images/avatar@2x.png";
import { NodeJob } from "../NodeJob/NodeJob.js";

export interface AssistantMessageProps {
  jobs: Job[];
  taskState: TaskState | undefined;
}

export function AssistantMessage({ jobs, taskState }: AssistantMessageProps) {
  return (
    <div className={styles.assistant}>
      <div className={styles.avatar}>
        <img src={Avatar} width={32} height={32} alt="Elevo" />
      </div>
      <div className={styles.body}>
        {jobs.map((job) => (
          <NodeJob key={job.id} job={job} taskState={taskState} />
        ))}
      </div>
    </div>
  );
}
