import React, { useMemo } from "react";
import styles from "./AssistantMessage.module.css";
import {
  GENERAL_DONE_STATES,
  NON_WORKING_STATES,
} from "../../shared/constants.js";
import type {
  ConversationState,
  Job,
  JobState,
  TaskState,
} from "../../shared/interfaces.js";
import { WrappedIcon } from "../../shared/bricks.js";
import type { MessageChunk } from "../interfaces";
import { RequestHumanAction } from "../../shared/RequestHumanAction/RequestHumanAction";
import { NodeChunk } from "../NodeChunk/NodeChunk";

export interface AssistantMessageProps {
  chunks: MessageChunk[];
  scopeState: ConversationState | TaskState | JobState | undefined;
  isLatest?: boolean;
  isSubTask?: boolean;
}

export function AssistantMessage({
  chunks,
  scopeState,
  isLatest,
  isSubTask,
}: AssistantMessageProps) {
  const [working, lastJob] = useMemo(() => {
    const lastChunk = chunks[chunks.length - 1];
    let lastJob: Job | undefined;
    if (lastChunk) {
      switch (lastChunk.type) {
        case "flow":
        case "activity":
          lastJob = lastChunk.task.jobs.findLast(
            (job) => job.state === "working"
          );
          break;
        case "job":
          lastJob = lastChunk.job;
          break;
        default:
          return [false, undefined];
      }
    }

    if (!isLatest || NON_WORKING_STATES.includes(scopeState!)) {
      return [false, lastJob];
    }
    for (const chunk of chunks) {
      switch (chunk.type) {
        case "flow":
        case "activity":
          if (chunk.task.jobs.some((job) => job.state === "input-required")) {
            return [false, lastJob];
          }
          break;
        case "job":
          if (chunk.job.state === "input-required") {
            return [false, lastJob];
          }
      }
    }
    if (lastJob && lastJob.state === "working" && lastJob.toolCall) {
      return [false, lastJob];
    }

    return [true, lastJob];
  }, [isLatest, chunks, scopeState]);

  return (
    <div className={styles.assistant}>
      <WrappedIcon
        lib="easyops"
        category="image"
        icon="elevo-avatar-png"
        className={styles.avatar}
      />
      <div className={styles.body}>
        {chunks.map((chunk, index) => (
          <NodeChunk key={index} chunk={chunk} isSubTask={isSubTask} />
        ))}
        {working && <div className={styles.texting}></div>}
        {isLatest &&
          lastJob &&
          !lastJob.humanAction &&
          lastJob.requestHumanAction &&
          !GENERAL_DONE_STATES.includes(scopeState) &&
          (lastJob.state === "working" ||
            lastJob.state === "input-required") && (
            <RequestHumanAction action={lastJob.requestHumanAction} ui="chat" />
          )}
      </div>
    </div>
  );
}
