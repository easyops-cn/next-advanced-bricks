// istanbul ignore file: experimental
import React, { useContext } from "react";
import styles from "./NodeEnd.module.css";
import { K, t } from "../i18n";
import { CanvasContext } from "../CanvasContext";
import { WrappedIcon } from "../bricks";

export function NodeEnd(): JSX.Element {
  const { onShare } = useContext(CanvasContext);

  return (
    <div className={styles["node-end"]}>
      <div className={styles.content}>
        <span className={styles.icon}>
          <WrappedIcon lib="fa" prefix="fas" icon="check" />
        </span>
        <span className={styles.text}>{t(K.TASK_COMPLETED)}</span>
      </div>
      <button className={styles.button} onClick={onShare}>
        {t(K.SHARE)}
      </button>
    </div>
  );
}
