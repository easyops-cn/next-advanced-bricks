import React from "react";
import classNames from "classnames";
import styles from "./ToolProgressLine.module.css";
import { DataPart } from "../interfaces";

export interface ToolProgressLineProps {
  toolDataProgress: DataPart[];
  /**
   * 暂定失败肯定是最后一个
   */
  failed?: boolean;
}

export function ToolProgressLine({
  toolDataProgress,
  failed,
}: ToolProgressLineProps): JSX.Element {
  return (
    <div
      className={classNames(styles["progress-line"], {
        [styles["failed"]]: failed,
      })}
    >
      {toolDataProgress.map((progress) => {
        const data = progress.data;
        return (
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
        );
      })}
    </div>
  );
}
