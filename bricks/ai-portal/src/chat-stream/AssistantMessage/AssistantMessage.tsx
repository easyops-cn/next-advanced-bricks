import React, { useMemo } from "react";
import type { Job, TaskState } from "../../cruise-canvas/interfaces.js";
import styles from "./AssistantMessage.module.css";
import { NodeJob } from "../NodeJob/NodeJob.js";
import { NON_WORKING_STATES } from "../../shared/constants.js";
import type { ConversationState } from "../../shared/interfaces.js";
import { WrappedIcon } from "../../shared/bricks.js";

export interface AssistantMessageProps {
  jobs: Job[];
  taskState: TaskState | ConversationState | undefined;
  error?: string | null;
  isLatest?: boolean;
}

export function AssistantMessage({
  jobs,
  taskState,
  error,
  isLatest,
}: AssistantMessageProps) {
  const working = useMemo(() => {
    if (!isLatest || NON_WORKING_STATES.includes(taskState!)) {
      return false;
    }
    for (const job of jobs) {
      if (job.state === "input-required") {
        return false;
      }
    }
    const lastJob = jobs[jobs.length - 1];
    if (lastJob && lastJob.state === "working" && lastJob.toolCall) {
      const toolName = lastJob.toolCall.name;
      if (
        toolName !== "ask_human" &&
        toolName !== "ask_human_confirming_plan"
      ) {
        return false;
      }
    }

    return true;
  }, [isLatest, jobs, taskState]);

  return (
    <div className={styles.assistant}>
      <WrappedIcon
        lib="easyops"
        category="image"
        icon="elevo-avatar-png"
        className={styles.avatar}
      />
      <div className={styles.body}>
        {jobs.map((job) => (
          <NodeJob key={job.id} job={job} taskState={taskState} />
        ))}
        {working && <div className={styles.texting}></div>}
        {error != null && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
