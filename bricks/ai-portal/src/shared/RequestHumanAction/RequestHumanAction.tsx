// istanbul ignore file: experimental
import React, { useContext, useState } from "react";
import styles from "./RequestHumanAction.module.css";
// import { K, t } from "../i18n.js";
import { WrappedButton } from "../bricks";
import { TaskContext } from "../TaskContext";
import type { HumanAction } from "../interfaces";

export function RequestHumanAction({
  action,
}: {
  action: HumanAction;
}): JSX.Element | null {
  const { humanInput } = useContext(TaskContext);
  const [disabled, setDisabled] = useState(false);

  if (action.type === "select") {
    return null;
  }

  return (
    <div className={styles["human-action"]}>
      <WrappedButton
        type="primary"
        themeVariant="elevo"
        shape="round"
        disabled={disabled}
        onClick={() => {
          humanInput("", null, action.confirmText || "确认");
          setDisabled(true);
        }}
      >
        {action.confirmText || "确认"}
      </WrappedButton>
    </div>
  );
}
