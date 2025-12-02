import React, { useContext } from "react";
import classNames from "classnames";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import styles from "./Aside.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedCodeBlock, WrappedIconButton } from "../../shared/bricks";
import { ToolCallStatus } from "../../cruise-canvas/ToolCallStatus/ToolCallStatus";
import { TaskContext } from "../../shared/TaskContext";
import { StreamContext } from "../StreamContext";
import type {
  ActiveDetailOfActivity,
  FulfilledActiveDetail,
} from "../../shared/interfaces";
import { FlowApp } from "./FlowApp/FlowApp";
import { ToolCallDetail } from "../../cruise-canvas/ToolCallDetail/ToolCallDetail";

const ICON_SHRINK: GeneralIconProps = {
  lib: "easyops",
  icon: "shrink",
};

export interface AsideProps {
  detail: FulfilledActiveDetail;
  isSubTask?: boolean;
  faded?: boolean;
}

export function Aside({ detail, isSubTask, faded }: AsideProps) {
  const { setActiveDetail, setSubActiveDetail } = useContext(TaskContext);
  const { setUserClosedAside } = useContext(StreamContext);

  return (
    <div
      className={classNames(styles.aside, {
        [styles.sub]: isSubTask,
        [styles.faded]: faded,
      })}
    >
      <div className={styles.box}>
        <div className={styles.header}>
          <div className={styles.title}>Elevo&#39;s Computer</div>
          <WrappedIconButton
            icon={ICON_SHRINK}
            variant="mini"
            onClick={() => {
              if (isSubTask) {
                setSubActiveDetail(null);
              } else {
                setActiveDetail(null);
                setUserClosedAside(true);
              }
            }}
          />
        </div>
        <div
          className={classNames(styles.body, {
            [styles.scrollable]:
              detail.type !== "job" || !detail.job.generatedView,
          })}
        >
          {detail.type === "job" ? (
            <>
              <ToolCallStatus job={detail.job} variant="read-only" />
              {detail.job.generatedView ? (
                <EditorApp
                  name="View"
                  source={detail.job.generatedView.code}
                  language="jsx"
                />
              ) : (
                <ToolCallDetail job={detail.job} />
              )}
            </>
          ) : (
            <FlowApp
              flow={detail.flow}
              activity={(detail as ActiveDetailOfActivity).activity}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface EditorAppProps {
  name: string;
  source: string;
  language: string;
}

function EditorApp({ name, source, language }: EditorAppProps) {
  return (
    <div className={classNames(styles.app, styles.editor)}>
      <div className={styles.heading}>{`${name}.${language}`}</div>
      <div className={classNames(styles.content, sharedStyles.markdown)}>
        <div className={styles.scroller}>
          <WrappedCodeBlock
            className={styles["code-block"]}
            source={source}
            language={language}
            themeVariant="elevo"
          />
        </div>
      </div>
    </div>
  );
}
