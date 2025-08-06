import React from "react";
import styles from "./UserMessage.module.css";

export interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return <div className={styles.user}>{content}</div>;
}
