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
      return [isLatest && !NON_WORKING_STATES.includes(scopeState!), undefined];
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

  const lastJobIsReasoning = lastJob?.type === "reasoning";

  return (
    <div className={styles.assistant}>
      <WrappedIcon
        lib="easyops"
        category="image"
        icon="elevo-avatar-png"
        className={styles.avatar}
      />
      <div className={styles.body}>
        {/* <NodeChunk
          chunk={{
            type: "job",
            job: {
              type: "reasoning",
              //               messages: [
              //                 {
              //                   role: "assistant",
              //                   parts: [{
              //                     type: "text",
              //                     text: `用户需要查询广州的天气，并根据天气帮他提请假流程。我需要：
              // 1. 调用天气工具查询广州天气
              // 2. 判断天气是下雨后，提起请假流程`
              //                   }]
              //                 }
              //               ],
            },
          }}
        /> */}
        {/* <NodeChunk
          chunk={
            {
              type: "plan",
              task: {
                plan: [
                  {
                    name: "查询广州明天天气预报",
                  },
                  {
                    name: "分析天气预报，判断是否下雨",
                  },
                ],
              },
            } as any
          }
        /> */}
        {chunks?.map((chunk, index) => (
          <NodeChunk key={index} chunk={chunk} isSubTask={isSubTask} />
        ))}
        {working && !finished && !lastJobIsReasoning && (
          <div className={styles.texting}></div>
        )}
        {isLatest &&
          lastJob &&
          !lastJobIsReasoning &&
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
