import React from "react";
import styles from "./UserMessage.module.css";
import type { CommandPayload, FileInfo } from "../../shared/interfaces";
import { ReadableCommand } from "../../shared/ReadableCommand/ReadableCommand";
import { FileList } from "../../cruise-canvas/FileList/FileList";

export interface UserMessageProps {
  content: string;
  cmd?: CommandPayload;
  mentionedAiEmployeeId?: string;
  files?: FileInfo[];
}

export function UserMessage({
  content,
  cmd,
  mentionedAiEmployeeId,
  files,
}: UserMessageProps) {
  return (
    <>
      {files?.length ? <FileList files={files} ui="chat" /> : null}
      <div className={styles.user}>
        {(cmd || mentionedAiEmployeeId) && (
          <ReadableCommand
            cmd={cmd}
            mentionedAiEmployeeId={mentionedAiEmployeeId}
          />
        )}
        {content}
      </div>
    </>
  );
}
