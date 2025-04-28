// istanbul ignore file: experimental
import React from "react";
import classNames from "classnames";
import styles from "./NodeInstruction.module.css";

export interface NodeInstructionProps {
  content?: string;
  loading?: boolean;
}

export function NodeInstruction({
  content,
  loading,
}: NodeInstructionProps): JSX.Element {
  return (
    <div
      className={classNames(styles["node-instruction"], {
        [styles.loading]: loading,
      })}
    >
      <div className={styles.text} title={content}>
        {content}
      </div>
    </div>
  );
}
