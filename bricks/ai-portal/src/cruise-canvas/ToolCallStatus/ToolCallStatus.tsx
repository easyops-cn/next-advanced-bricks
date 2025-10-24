import React, { useCallback, useContext, useMemo } from "react";
import classNames from "classnames";
import moment from "moment";
import { isEqual } from "lodash";
import { humanizeTime, HumanizeTimeFormat } from "@next-shared/datetime";
import styles from "./ToolCallStatus.module.css";
import { WrappedIcon } from "../../shared/bricks";
import { TaskContext } from "../../shared/TaskContext";
import { ToolProgressLine } from "../ToolProgressLine/ToolProgressLine";
import { getToolDataProgress } from "../utils/getToolDataProgress";
import type { ActiveDetail, Job, JobState } from "../../shared/interfaces";

export interface NodeJobToolCallProps {
  job: Job;
  variant?: "default" | "read-only";
}

export function ToolCallStatus({
  job,
  variant,
}: NodeJobToolCallProps): JSX.Element {
  const { setActiveDetail, separateInstructions } = useContext(TaskContext);
  const toolCall = job.toolCall!;
  const toolTitle = toolCall.annotations?.title || toolCall.name;
  const jobTitle = separateInstructions
    ? toolTitle
    : job.instruction || toolTitle;
  const [progress, hasToolCallResponse] = useMemo(() => {
    const toolCallMessages = job.messages?.filter((msg) => msg.role === "tool");
    return [
      getToolDataProgress(toolCallMessages),
      toolCallMessages?.some((msg) =>
        msg.parts.some((part) => part.type === "text")
      ),
    ];
  }, [job.messages]);

  const readOnly = useMemo(() => {
    return variant === "read-only";
  }, [variant]);

  const handleClick = useCallback(() => {
    if (variant === "read-only") {
      return;
    }
    const newActiveDetail: ActiveDetail = {
      type: "job",
      id: job.id,
    };
    setActiveDetail((prev) =>
      isEqual(prev, newActiveDetail) ? prev : newActiveDetail
    );
  }, [job.id, variant, setActiveDetail]);

  const toolState =
    ["working", "input-required"].includes(job.state) && hasToolCallResponse
      ? "completed"
      : job.state;

  const failed = job.isError || toolState === "failed";

  return (
    <div
      className={classNames(styles["tool-call"], {
        [styles.failed]: failed,
        [styles["read-only"]]: readOnly,
      })}
      onClick={handleClick}
    >
      <div className={classNames(styles.status)}>
        {job.isError || toolState === "failed" ? (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="fas"
            icon="xmark"
          />
        ) : toolState === "completed" ? (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="fas"
            icon="check"
          />
        ) : toolState === "working" ? (
          <WrappedIcon
            className={styles.icon}
            lib="antd"
            theme="outlined"
            icon="loading-3-quarters"
            spinning
          />
        ) : toolState === "input-required" ? (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="far"
            icon="circle-user"
          />
        ) : toolState === "canceled" ||
          toolState === ("terminated" as JobState) ? (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="far"
            icon="circle-stop"
          />
        ) : (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="far"
            icon="clock"
          />
        )}
        <span className={styles.name}>
          {variant === "read-only" ? toolTitle : jobTitle}
        </span>
        {job.startTime ? (
          <span className={styles.timing}>
            {`${humanizeTime(job.startTime * 1000, HumanizeTimeFormat.accurate)}${
              job.endTime
                ? ` (${moment.duration(job.endTime * 1000 - job.startTime * 1000).humanize({ ss: -1 })})`
                : ""
            }`}
          </span>
        ) : null}
      </div>
      {!!progress && !readOnly && (
        <ToolProgressLine progress={progress} failed={failed} />
      )}
    </div>
  );
}
