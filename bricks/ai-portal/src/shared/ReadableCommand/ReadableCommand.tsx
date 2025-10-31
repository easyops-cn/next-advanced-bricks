import React, { useEffect, useState } from "react";
import classNames from "classnames";
import type { CommandPayload } from "../interfaces";
import styles from "./ReadableCommand.module.css";
import { fetchEmployee } from "../fetchEmployee";

export interface ReadableCommandProps {
  cmd?: CommandPayload;
  mentionedAiEmployeeId?: string;
  size?: "medium" | "small";
}

export function ReadableCommand({
  cmd,
  mentionedAiEmployeeId /* , size */,
}: ReadableCommandProps) {
  const [content, setContent] = useState(() =>
    getInitialContent(cmd, mentionedAiEmployeeId)
  );

  useEffect(() => {
    setContent(getInitialContent(cmd, mentionedAiEmployeeId));
    if (!cmd) {
      let ignore = false;
      (async () => {
        const employee = await fetchEmployee(mentionedAiEmployeeId!);
        if (ignore || !employee) return;
        setContent(`@${employee.name}`);
      })();
      return () => {
        ignore = true;
      };
    }
  }, [cmd, mentionedAiEmployeeId]);

  return (
    <>
      <span
        className={classNames(styles.command, {
          [styles.small]: true,
        })}
      >
        {content}
      </span>{" "}
    </>
  );
}

export function getInitialContent(
  cmd?: CommandPayload,
  mentionedAiEmployeeId?: string
): string {
  if (cmd) {
    switch (cmd.type) {
      case "serviceFlowStarting":
        return `/start service flow${[
          cmd.serviceFlowStarting.flowName,
          cmd.serviceFlowStarting.spaceName,
        ]
          .filter(Boolean)
          .slice(0, 1)
          .map((name) => `: ${name}`)
          .join("")}`;
      default:
        return `/${cmd.type}`;
    }
  }
  return `@${mentionedAiEmployeeId!}`;
}
