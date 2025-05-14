// istanbul ignore file: experimental
import React, { useContext } from "react";
import styles from "./NodeEnd.module.css";
import { K, t } from "../i18n";
import { CanvasContext } from "../CanvasContext";

export function NodeEnd(): JSX.Element {
  const { onShare } = useContext(CanvasContext);

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
