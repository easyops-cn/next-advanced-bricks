import React from "react";
import classNames from "classnames";
import styles from "../NodeJob/NodeJob.module.css";
import type { ActivityRun, ServiceFlowRun } from "../../shared/interfaces";
import { K, t } from "../i18n";

export interface NodeChunkProps {
  type: "flow" | "activity";
  active?: boolean;
  flow: ServiceFlowRun;
  activity?: ActivityRun;
}

export function NodeChunk({ type, active, flow, activity }: NodeChunkProps) {
  return (
    <div
      className={classNames(styles["node-job"], {
        [styles.active]: active,
      })}
    >
      <div className={styles.background} />
      <div className={styles.body}>
        {type === "flow"
          ? t(K.INITIATING_SERVICE_FLOW, { name: flow.name })
          : t(K.STARTING_SERVICE_FLOW_ACTIVITY, { name: activity!.name })}
      </div>
    </div>
  );
}
