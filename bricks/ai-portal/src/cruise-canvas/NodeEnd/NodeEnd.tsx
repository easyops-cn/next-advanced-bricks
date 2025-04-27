// istanbul ignore file: experimental
import React from "react";
import styles from "./NodeEnd.module.css";
import { K, t } from "../i18n";

export interface NodeEndProps {
  onShare?: () => void;
}

export function NodeEnd({ onShare }: NodeEndProps): JSX.Element {
  return (
    <div className={styles["node-end"]}>
      <div className={styles.icon} />
      <div className={styles.title}>{t(K.TASK_COMPLETED)}</div>
      <div className={styles.description}>{t(K.PLAN_COMPLETED)}</div>
      <button className={styles.button} onClick={onShare}>
        {t(K.SHARE)}
      </button>
    </div>
  );
}
