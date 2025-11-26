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
import { HumanInTheLoop } from "../HumanInTheLoop/HumanInTheLoop";

export interface AssistantMessageProps {
  chunks?: MessageChunk[];
  scopeState?: ConversationState | TaskState | JobState | undefined;
  isLatest?: boolean;
  isSubTask?: boolean;
  finished?: boolean;
  earlyFinished?: boolean;
}

const EARLY_FINISHED_ERROR_CHUNK: MessageChunk = {
  type: "error",
  error:
    "The conversation was marked as finished early due to an unexpected issue.\nPlease refresh the page or try again later.",
};

export function AssistantMessage({
  chunks,
  scopeState,
  isLatest,
  isSubTask,
  finished,
  earlyFinished,
}: AssistantMessageProps) {
  const [working, lastJob] = useMemo(() => {
    if (!chunks || chunks.length === 0) {
      return [false, undefined];
    }

    const lastChunk = chunks[chunks.length - 1];
    let lastJob: Job | undefined;
    if (lastChunk) {
      switch (lastChunk.type) {
        case "flow":
        case "activity":
          lastJob = lastChunk.task.jobs[lastChunk.task.jobs.length - 1];
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
        {chunks?.map((chunk, index) => (
          <NodeChunk key={index} chunk={chunk} isSubTask={isSubTask} />
        ))}
        {working && !finished && <div className={styles.texting}></div>}
        {isLatest &&
          lastJob &&
          !GENERAL_DONE_STATES.includes(scopeState) &&
          (lastJob.state === "working" || lastJob.state === "input-required") &&
          !lastJob.humanAction &&
          (lastJob.hil ? (
            <HumanInTheLoop job={lastJob} />
          ) : (
            lastJob.requestHumanAction && (
              <RequestHumanAction
                action={lastJob.requestHumanAction}
                ui="chat"
              />
            )
          ))}
        {earlyFinished && <NodeChunk chunk={EARLY_FINISHED_ERROR_CHUNK} />}
      </div>
    </div>
  );
}
