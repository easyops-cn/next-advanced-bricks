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
        return `/start serviceflow${[
          cmd.serviceFlowStarting.flowName,
          cmd.serviceFlowStarting.spaceName,
        ]
          .filter(Boolean)
          .slice(0, 1)
          .map((name) => `: ${name}`)
          .join("")}`;
      case "serviceflow-start":
        return `/start serviceflow${[
          cmd.payload.flowName,
          cmd.payload.spaceName,
        ]
          .filter(Boolean)
          .slice(0, 1)
          .map((name) => `: ${name}`)
          .join("")}`;
      case "serviceflow-edit":
        return `/edit serviceflow${[cmd.payload.flowName, cmd.payload.spaceName]
          .filter(Boolean)
          .slice(0, 1)
          .map((name) => `: ${name}`)
          .join("")}`;
      case "serviceflow-create":
        return `/create serviceflow${[cmd.payload.spaceName]
          .filter(Boolean)
          .slice(0, 1)
          .map((name) => `: ${name}`)
          .join("")}`;
      case "serviceObject-createOrEdit":
        return `/manage business object`;
      case "serviceObjectInstance-createOrEdit":
        return `/manage business object instance`;
      default:
        // unknown command type
        return `/${(cmd as CommandPayload).type}`;
    }
  }
  return `@${mentionedAiEmployeeId!}`;
}
