import React from "react";
import classNames from "classnames";
import styles from "./ToolProgressLine.module.css";
import { DataPart } from "../interfaces";

export interface ToolProgressLineProps {
  progress: DataPart;
  /**
   * 暂定失败肯定是最后一个
   */
  failed?: boolean;
}

export function ToolProgressLine({
  progress,
  failed,
}: ToolProgressLineProps): JSX.Element {
  const data = progress.data;

  return (
    <div
      className={classNames(styles["progress-line"], {
        [styles["failed"]]: failed,
      })}
    >
      <div className={classNames(styles.step)} key={data.progress}>
        <div className={styles.axis}>
          <div className={styles.line} />
          <div className={styles.dot} />
        </div>
        <div className={styles.progress}>
          <span className={styles.count}>{data.progress}</span>
          <span>/</span>
          <span className={styles.total}>{data.total}</span>
        </div>
        <div className={styles.description}>{data.message}</div>
      </div>
    </div>
  );
}
