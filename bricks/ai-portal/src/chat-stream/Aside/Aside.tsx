import React, { useContext, useMemo } from "react";
import classNames from "classnames";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import styles from "./Aside.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedCodeBlock, WrappedIconButton } from "../../shared/bricks";
import type { CmdbInstanceDetailData } from "../../cruise-canvas/interfaces";
import { ToolCallStatus } from "../../cruise-canvas/ToolCallStatus/ToolCallStatus";
import { TaskContext } from "../../shared/TaskContext";
import { StreamContext } from "../StreamContext";
import type {
  ActiveDetailOfActivity,
  FileInfo,
  FulfilledActiveDetail,
} from "../../shared/interfaces";
import { FlowApp } from "./FlowApp/FlowApp";

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

  const [toolMarkdownContent, cmdbInstanceDetails /* , files */] =
    useMemo(() => {
      const contents: string[] = [];
      const instanceDetails: CmdbInstanceDetailData[] = [];
      const files: FileInfo[] = [];

      if (detail.type === "job") {
        detail.job.messages?.forEach((message) => {
          if (message.role === "tool") {
            for (const part of message.parts) {
              if (part.type === "data") {
                switch (part.data?.type) {
                  case "markdown":
                    contents.push(part.data.content);
                    break;
                  case "cmdb_instance_detail":
                    instanceDetails.push(part.data as CmdbInstanceDetailData);
                    break;
                }
              } else if (part.type === "file") {
                files.push(part.file);
              }
            }
          }
        });
      }

      const markdownContent = contents.join("");

      return [markdownContent, instanceDetails, files] as const;
    }, [detail]);

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
        <div className={styles.body}>
          {detail.type === "job" ? (
            <>
              <ToolCallStatus job={detail.job} variant="read-only" />
              {detail.job.generatedView ? (
                <EditorApp
                  name="View"
                  source={detail.job.generatedView.code}
                  language="jsx"
                />
              ) : toolMarkdownContent ? (
                <EditorApp
                  name="Content"
                  source={toolMarkdownContent}
                  language="md"
                />
              ) : cmdbInstanceDetails.length > 0 ? (
                <EditorApp
                  name="CMDB"
                  source={JSON.stringify(cmdbInstanceDetails, null, 2)}
                  language="json"
                />
              ) : null}
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
