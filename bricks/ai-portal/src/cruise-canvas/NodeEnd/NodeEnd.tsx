// istanbul ignore file: experimental
import React, { useContext } from "react";
import classNames from "classnames";
import styles from "./NodeEnd.module.css";
import { K, t } from "../i18n";
import { CanvasContext } from "../CanvasContext";

export interface NodeEndProps {
  active?: boolean;
}

export function NodeEnd({ active }: NodeEndProps): JSX.Element {
  const { onShare } = useContext(CanvasContext);

  return (
    <div
      className={classNames(styles["node-end"], {
        [styles.active]: active,
      })}
    >
      <div className={styles.icon} />
      <div className={styles.title}>{t(K.TASK_COMPLETED)}</div>
      <div className={styles.description}>{t(K.PLAN_COMPLETED)}</div>
      <button className={styles.button} onClick={onShare}>
        {t(K.SHARE)}
      </button>
    </div>
  );
}
