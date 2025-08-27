// istanbul ignore file: experimental
import React, { useContext } from "react";
import styles from "./NodeEnd.module.css";
import { K, t } from "../i18n";
import { WrappedIcon } from "../../shared/bricks";
import { TaskContext } from "../../shared/TaskContext";

export interface NodeEndProps {
  showCompleted?: boolean;
}

export function NodeEnd({ showCompleted }: NodeEndProps): JSX.Element {
  const { onShare } = useContext(TaskContext);

  return (
    <div className={styles["node-end"]}>
      {showCompleted && (
        <div className={styles.content}>
          <span className={styles.icon}>
            <WrappedIcon lib="fa" prefix="fas" icon="check" />
          </span>
          <span className={styles.text}>{t(K.TASK_COMPLETED)}</span>
        </div>
      )}
      <button className={styles.button} onClick={onShare}>
        {t(K.SHARE)}
      </button>
    </div>
  );
}
