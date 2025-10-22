import React from "react";
import styles from "./UserMessage.module.css";
import type { CommandPayload } from "../../shared/interfaces";
import { ReadableCommand } from "../../shared/ReadableCommand/ReadableCommand";

export interface UserMessageProps {
  content: string;
  cmd?: CommandPayload;
}

export function UserMessage({ content, cmd }: UserMessageProps) {
  return (
    <div className={styles.user}>
      {cmd && <ReadableCommand cmd={cmd} />}
      {content}
    </div>
  );
}
