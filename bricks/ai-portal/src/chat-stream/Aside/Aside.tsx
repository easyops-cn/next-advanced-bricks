import React, { useContext } from "react";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import styles from "./Aside.module.css";
import { WrappedIconButton } from "../../shared/bricks";
import type { Job } from "../../cruise-canvas/interfaces";
import { ToolCallStatus } from "../../cruise-canvas/ToolCallStatus/ToolCallStatus";
import { TaskContext } from "../../shared/TaskContext";

const ICON_SHRINK: GeneralIconProps = {
  lib: "antd",
  icon: "shrink",
};

export interface AsideProps {
  job: Job;
}

export function Aside({ job }: AsideProps) {
  const { setActiveToolCallJobId } = useContext(TaskContext);

  return (
    <div className={styles.aside}>
      <div className={styles.box}>
        <div className={styles.heading}>
          <div className={styles.title}>Elevo&#39;s Computer</div>
          <WrappedIconButton
            icon={ICON_SHRINK}
            variant="mini"
            onClick={() => {
              setActiveToolCallJobId(null);
            }}
          />
        </div>
        <div className={styles.body}>
          <ToolCallStatus job={job} variant="read-only" />
        </div>
      </div>
    </div>
  );
}
