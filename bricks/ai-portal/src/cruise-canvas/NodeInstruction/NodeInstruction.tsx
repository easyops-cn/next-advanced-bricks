import React from "react";
import styles from "./NodeInstruction.module.css";

export interface NodeInstructionProps {
  content?: string;
}

export function NodeInstruction({
  content,
}: NodeInstructionProps): JSX.Element {
  return <div className={styles["node-instruction"]}>{content}</div>;
}
