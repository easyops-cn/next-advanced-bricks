// istanbul ignore file: experimental
import React from "react";
import { wrapBrick } from "@next-core/react-element";
import type {
  EoEasyopsAvatar,
  EoEasyopsAvatarProps,
} from "@next-bricks/basic/easyops-avatar";
import moment from "moment";
import classNames from "classnames";
import styles from "./NodeRequirement.module.css";
import type { CommandPayload } from "../../shared/interfaces";
import { ReadableCommand } from "../../shared/ReadableCommand/ReadableCommand";

const WrappedEasyOpsAvatar = wrapBrick<EoEasyopsAvatar, EoEasyopsAvatarProps>(
  "eo-easyops-avatar"
);

export interface NodeRequirementProps {
  username?: string;
  content?: string;
  startTime?: number;
  active?: boolean;
  cmd?: CommandPayload;
}

export function NodeRequirement({
  username,
  content,
  startTime,
  active,
  cmd,
}: NodeRequirementProps): JSX.Element {
  return (
    <div
      className={classNames(styles["node-requirement"], {
        [styles.active]: active,
      })}
    >
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
      <div className={styles.body}>
        {cmd && <ReadableCommand cmd={cmd} size="small" />}
        {content}
      </div>
    </div>
  );
}
