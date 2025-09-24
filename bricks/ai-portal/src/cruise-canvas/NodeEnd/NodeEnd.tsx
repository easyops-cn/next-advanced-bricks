// istanbul ignore file: experimental
import React, { useContext } from "react";
import styles from "./NodeEnd.module.css";
import { K, t } from "../i18n";
import { WrappedIcon } from "../../shared/bricks";
import { TaskContext } from "../../shared/TaskContext";

export function NodeEnd(): JSX.Element {
  const { onShare, replay } = useContext(TaskContext);

  return (
    <div className={styles["node-end"]}>
      {replay && (
        <div className={styles.content}>
          <span className={styles.icon}>
            <WrappedIcon lib="fa" prefix="fas" icon="check" />
          </span>
          <span className={styles.text}>{t(K.TASK_COMPLETED)}</span>
        </div>
      )}
      {!replay && (
        <button className={styles.button} onClick={onShare}>
          {t(K.SHARE)}
        </button>
      )}
    </div>
  );
}
