import React, { useMemo } from "react";
import classNames from "classnames";
import type { CommandPayload } from "../interfaces";
import styles from "./ReadableCommand.module.css";

export interface ReadableCommandProps {
  cmd: CommandPayload;
  size?: "medium" | "small";
}

export function ReadableCommand({ cmd, size }: ReadableCommandProps) {
  const string = useMemo(() => {
    switch (cmd.type) {
      case "serviceFlowStarting":
        return `/start service flow${[
          cmd.serviceFlowStarting.spaceName,
          cmd.serviceFlowStarting.flowName,
        ]
          .filter(Boolean)
          .map((name) => `: ${name}`)
          .join("")}`;
      default:
        return `/${cmd.type}`;
    }
  }, [cmd]);

  return (
    <>
      <span
        className={classNames(styles.command, {
          [styles.small]: size === "small",
        })}
      >
        {string}
      </span>{" "}
    </>
  );
}
