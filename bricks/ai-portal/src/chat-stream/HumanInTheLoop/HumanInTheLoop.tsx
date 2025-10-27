import React from "react";
import { WrappedIcon } from "../../shared/bricks";
import type { Job } from "../../shared/interfaces";
import styles from "./HumanInTheLoop.module.css";
import { RequestHumanAction } from "../../shared/RequestHumanAction/RequestHumanAction";
import { K, t } from "../i18n";

export interface HumanInTheLoopProps {
  job: Job;
}

export function HumanInTheLoop({ job }: HumanInTheLoopProps) {
  return (
    <div className={styles.hil}>
      <div className={styles.content}>
        <WrappedIcon lib="antd" icon="exclamation-circle" />
        {t(K.HIL_TIPS, { name: job.hil!.username })}
      </div>
      {job.requestHumanAction && (
        <div className={styles.actions}>
          <RequestHumanAction action={job.requestHumanAction} ui="chat" />
        </div>
      )}
    </div>
  );
}
