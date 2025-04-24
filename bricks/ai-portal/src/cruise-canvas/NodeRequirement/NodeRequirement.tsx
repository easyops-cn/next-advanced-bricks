import React, { useMemo } from "react";
import { wrapBrick } from "@next-core/react-element";
import { auth } from "@next-core/easyops-runtime";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import styles from "./NodeRequirement.module.css";

const WrappedEasyOpsAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);

export interface NodeRequirementProps {
  content?: string;
}

export function NodeRequirement({
  content,
}: NodeRequirementProps): JSX.Element {
  const username = useMemo(() => {
    return auth.getAuth().username;
  }, []);

  return (
    <div className={styles["node-requirement"]}>
      <div className={styles.heading}>
        <div className={styles.user}>
          <WrappedEasyOpsAvatar
            nameOrInstanceId={username}
            showName
            size="xs"
          />
        </div>
        <div className={styles.time}>03-24 15:23</div>
      </div>
      <div className={styles.body}>{content}</div>
    </div>
  );
}
