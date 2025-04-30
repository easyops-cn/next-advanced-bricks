// istanbul ignore file: experimental
import React from "react";
import classNames from "classnames";
import styles from "./NodeInstruction.module.css";
import sharedStyles from "../shared.module.css";

export interface NodeInstructionProps {
  content?: string;
  loading?: boolean;
}

export function NodeInstruction({
  content,
  loading,
}: NodeInstructionProps): JSX.Element {
  return (
    <div className={styles["node-instruction"]}>
      <div
        className={classNames(styles.text, {
          [sharedStyles["shine-text"]]: loading,
        })}
        title={content}
      >
        {content}
      </div>
    </div>
  );
}
