// istanbul ignore file: experimental
import React, { useMemo } from "react";
import { wrapBrick } from "@next-core/react-element";
import { auth } from "@next-core/easyops-runtime";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import moment from "moment";
import styles from "./NodeRequirement.module.css";

const WrappedEasyOpsAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);

export interface NodeRequirementProps {
  content?: string;
  startTime?: number;
  loading?: boolean;
}

export function NodeRequirement({
  content,
  startTime,
  loading,
}: NodeRequirementProps): JSX.Element {
  const username = useMemo(() => {
    return auth.getAuth().username;
  }, []);

  return (
    <div className={styles["node-requirement"]}>
      <div className={styles.heading}>
        <WrappedEasyOpsAvatar
          className={styles.avatar}
          nameOrInstanceId={username}
          showName
          size="xs"
        />
        <div className={styles.time}>
          {startTime && moment(startTime * 1000).format("MM-DD HH:mm")}
        </div>
      </div>
      <div className={styles.body}>{content}</div>
      {loading && (
        <>
          <svg
            className={styles["loading-line"]}
            viewBox="0 0 2 62"
            width="2"
            height="62"
          >
            <path d="M1 0 L1 62" />
          </svg>
          <div className={styles.loading}>
            <div className={styles.inner} />
          </div>
        </>
      )}
    </div>
  );
}
