import React from "react";
import styles from "./NodeError.module.css";
import jobStyles from "../NodeJob/NodeJob.module.css";
import classNames from "classnames";

export interface NodeErrorProps {
  content: string;
}

export function NodeError({ content }: NodeErrorProps) {
  return (
    <div className={classNames(jobStyles["node-job"], jobStyles.error)}>
      <div className={styles.error}>{content}</div>
    </div>
  );
}
