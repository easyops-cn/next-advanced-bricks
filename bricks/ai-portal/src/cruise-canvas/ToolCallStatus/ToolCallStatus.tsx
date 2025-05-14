import React, { useCallback, useContext } from "react";
import classNames from "classnames";
import styles from "./ToolCallStatus.module.css";
import type { Job } from "../interfaces";
import { WrappedIcon } from "../bricks";
import { CanvasContext } from "../CanvasContext";

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

  const handleClick = useCallback(() => {
    if (variant === "read-only") {
      return;
    }
    setActiveToolCallJobId(job.id);
  }, [job.id, variant, setActiveToolCallJobId]);

  const toolState =
    (job.state === "working" || job.state === "input-required") &&
    toolCallMessages?.length
      ? "completed"
      : job.state;
  const failed = job.isError || toolState === "failed";

  return (
    <div
      className={classNames(styles.status, {
        [styles.failed]: failed,
        [styles["read-only"]]: variant === "read-only",
      })}
      onClick={handleClick}
    >
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
          icon="circle-pause"
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
  );
}
