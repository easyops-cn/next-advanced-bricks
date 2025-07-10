// istanbul ignore file: experimental
import React, { useContext } from "react";
import styles from "./HumanConfirm.module.css";
import { K, t } from "../i18n.js";
import { WrappedButton } from "../bricks";
import { CanvasContext } from "../CanvasContext";

export function HumanConfirm({
  jobId,
  confirmText,
  cancelText,
}: {
  jobId: string;
  confirmText?: string;
  cancelText?: string;
}): JSX.Element {
  const { humanInput } = useContext(CanvasContext);

  return (
    <div className={styles["human-confirm"]}>
      <WrappedButton
        type="primary"
        themeVariant="elevo"
        shape="round"
        onClick={() => {
          humanInput(jobId, confirmText || t(K.YES));
        }}
      >
        {confirmText || t(K.YES)}
      </WrappedButton>
      <WrappedButton
        type="text"
        themeVariant="elevo"
        onClick={() => {
          humanInput(jobId, cancelText || t(K.NO));
        }}
        style={{ marginLeft: "0.5em" }}
      >
        {cancelText || t(K.NO)}
      </WrappedButton>
    </div>
  );
}
