import React, { useContext, useMemo, useState } from "react";
import classNames from "classnames";
import { isEqual } from "lodash";
import styles from "./NodeChunk.module.css";
import type {
  MessageChunk,
  MessageChunkOfActivity,
  MessageChunkOfFlow,
} from "../interfaces.js";
import { NodeJob } from "./NodeJob.js";
import { WrappedIcon } from "../../shared/bricks";
import { getStateDisplay } from "./getStateDisplay.js";
import { TaskContext } from "../../shared/TaskContext";
import { ICON_UP } from "../../shared/constants";
import { StreamContext } from "../StreamContext";
import { K, t } from "../i18n";

export interface NodeChunkProps {
  chunk: MessageChunk;
}

export function NodeChunk({ chunk }: NodeChunkProps) {
  if (chunk.type === "job") {
    return <NodeJob job={chunk.job} />;
  }

  if (chunk.type === "error") {
    return <div className={styles.error}>{chunk.error}</div>;
  }

  return <NodeTask chunk={chunk} />;
}

interface NodeTaskProps {
  chunk: MessageChunkOfFlow | MessageChunkOfActivity;
}

function NodeTask({ chunk }: NodeTaskProps) {
  const { conversationState, setActiveDetail } = useContext(TaskContext);
  const { setUserClosedAside, lastDetail } = useContext(StreamContext);
  const [collapsed, setCollapsed] = useState(false);
  const { type, task } = chunk;

  const { className, icon } = useMemo(() => {
    return getStateDisplay(
      chunk.type === "flow" ? "completed" : task.state,
      conversationState
    );
  }, [chunk.type, conversationState, task.state]);

  return (
    <div className={classNames({ [styles.collapsed]: collapsed })}>
      <div
        className={classNames(styles.heading, className)}
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <div className={styles.icon}>
          <WrappedIcon {...icon} />
        </div>
        <div className={styles.title}>
          {type === "flow"
            ? t(K.START_SERVICE_FLOW, { name: chunk.flow.name })
            : t(K.START_SERVICE_FLOW_ACTIVITY, { name: chunk.activity.name })}
        </div>
        <WrappedIcon className={styles.caret} {...ICON_UP} />
      </div>
      <div className={styles.body}>
        <div
          className={styles.tool}
          onClick={() => {
            const detail = {
              type: chunk.type,
              id: chunk.task.id,
            };
            setActiveDetail((prev) => (isEqual(prev, detail) ? prev : detail));
            if (isEqual(detail, lastDetail)) {
              setUserClosedAside(false);
            }
          }}
        >
          <WrappedIcon lib="lucide" icon="route" />
          {type === "flow"
            ? t(K.SERVICE_FLOW, { name: chunk.flow.name })
            : t(K.SERVICE_FLOW_ACTIVITY, { name: chunk.activity.name })}
        </div>
      </div>
    </div>
  );
}
