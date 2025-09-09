// istanbul ignore file: experimental
import React, { useContext } from "react";
import styles from "./RequestHumanAction.module.css";
import { WrappedButton } from "../../shared/bricks";
import { TaskContext } from "../../shared/TaskContext";
import type { HumanAction } from "../interfaces";

export function RequestHumanAction({
  jobId,
  action,
}: {
  jobId: string;
  action: HumanAction;
}): JSX.Element | null {
  const { humanInput } = useContext(TaskContext);

  if (action.type !== "confirm-plan") {
    return null;
  }

  return (
    <div className={styles.request}>
      <WrappedButton
        type="primary"
        themeVariant="elevo"
        shape="round"
        onClick={() => {
          humanInput(jobId, "", action.confirmText);
        }}
      >
        {action.confirmText}
      </WrappedButton>
    </div>
  );
}
