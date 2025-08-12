// istanbul ignore file: experimental
import React from "react";
import styles from "./NodeLoading.module.css";

export function NodeLoading(): JSX.Element {
  return (
    <div className={styles.loading}>
      <div className={styles.inner} />
    </div>
  );
}
