import React, { useCallback, useContext, useMemo } from "react";
import classNames from "classnames";
import styles from "./ToolCallStatus.module.css";
import type { Job } from "../interfaces";
import { WrappedIcon } from "../bricks";
import { CanvasContext } from "../CanvasContext";
import { ToolProgressLine } from "../ToolProgressLine/ToolProgressLine";
import { getlastProgress, getToolDataProgress } from "../utils";

export interface NodeJobToolCallProps {
  job: Job;
  variant?: "default" | "read-only";
}

export function ToolCallStatus({
  job,
  variant,
}: NodeJobToolCallProps): JSX.Element {
  const { setActiveToolCallJobId } = useContext(CanvasContext);
  const toolCall = job.toolCall!;
  const toolCallMessages = job.messages?.filter((msg) => msg.role === "tool");
  const toolDataProgress = getToolDataProgress(toolCallMessages!);
  const lastProgress = getlastProgress(toolDataProgress);

  const readOnly = useMemo(() => {
    return variant === "read-only";
  }, [variant]);

  const handleClick = useCallback(() => {
    if (variant === "read-only") {
      return;
    }
    setActiveToolCallJobId(job.id);
  }, [job.id, variant, setActiveToolCallJobId]);

  const toolState =
    ["working", "input-required"].includes(job.state) &&
    toolCallMessages?.length
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
        ) : toolState === "canceled" ? (
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
        <span className={styles.name}>{toolCall.name}</span>
      </div>
      {!!lastProgress && !readOnly && (
        <ToolProgressLine toolDataProgress={[lastProgress]} failed={failed} />
      )}
    </div>
  );
}
