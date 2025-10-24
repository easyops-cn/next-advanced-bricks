// istanbul ignore file: experimental
import React, { useContext, useState } from "react";
import styles from "./RequestHumanAction.module.css";
// import { K, t } from "../i18n.js";
import { WrappedButton } from "../bricks";
import { TaskContext } from "../TaskContext";
import type { HumanAction } from "../interfaces";
import classNames from "classnames";

export function RequestHumanAction({
  action,
  ui,
}: {
  action: HumanAction;
  ui?: "canvas" | "chat";
}): JSX.Element | null {
  const { humanInput, replay } = useContext(TaskContext);
  const [disabled, setDisabled] = useState(false);

  if (action.type === "select") {
    return null;
  }

  return (
    <div
      className={classNames(styles["human-action"], {
        [styles.canvas]: ui !== "chat",
      })}
    >
      <WrappedButton
        type="primary"
        themeVariant="elevo"
        shape={ui === "chat" ? undefined : "round"}
        disabled={disabled}
        onClick={() => {
          if (replay) {
            return;
          }
          humanInput("", null, action.confirmText || "确认");
          setDisabled(true);
        }}
      >
        {action.confirmText || "确认"}
      </WrappedButton>
    </div>
  );
}
