import React, { useContext, useMemo } from "react";
import classNames from "classnames";
import { httpErrorToString } from "@next-core/runtime";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import styles from "./Aside.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedIcon, WrappedIconButton } from "../../shared/bricks";
import type {
  CmdbInstanceDetailData,
  FileInfo,
  Job,
} from "../../cruise-canvas/interfaces";
import { ToolCallStatus } from "../../cruise-canvas/ToolCallStatus/ToolCallStatus";
import { TaskContext } from "../../shared/TaskContext";
import { StreamContext } from "../StreamContext";
import { useCodeBlock } from "../../shared/useCodeBlock";
import { ICON_LOADING } from "../../shared/constants";

const ICON_SHRINK: GeneralIconProps = {
  lib: "easyops",
  icon: "shrink",
};

export interface AsideProps {
  job: Job;
}

export function Aside({ job }: AsideProps) {
  const { setActiveToolCallJobId } = useContext(TaskContext);
  const { setUserClosedAside } = useContext(StreamContext);

  const [toolMarkdownContent, cmdbInstanceDetails /* , files */] =
    useMemo(() => {
      const contents: string[] = [];
      const instanceDetails: CmdbInstanceDetailData[] = [];
      const files: FileInfo[] = [];
      job.messages?.forEach((message) => {
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

      const markdownContent = contents.join("");

      return [markdownContent, instanceDetails, files] as const;
    }, [job.messages]);

  return (
    <div className={styles.aside}>
      <div className={styles.box}>
        <div className={styles.header}>
          <div className={styles.title}>Elevo&#39;s Computer</div>
          <WrappedIconButton
            icon={ICON_SHRINK}
            variant="mini"
            onClick={() => {
              setActiveToolCallJobId(null);
              setUserClosedAside(true);
            }}
          />
        </div>
        <div className={styles.body}>
          <ToolCallStatus job={job} variant="read-only" />
          {job.generatedView ? (
            <EditorApp
              name="View"
              source={job.generatedView.code}
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
  const { status, data, error } = useCodeBlock({ language, source });

  return (
    <div className={classNames(styles.app, styles.editor)}>
      <div className={styles.heading}>{`${name}.${language}`}</div>
      <div className={classNames(styles.content, sharedStyles.markdown)}>
        <div
          className={classNames(styles.scroller, {
            [styles.loading]: status === "pending",
          })}
        >
          {status === "pending" ? (
            <WrappedIcon {...ICON_LOADING} />
          ) : status === "error" ? (
            <div style={{ color: "var(--color-error)" }}>
              {httpErrorToString(error)}
            </div>
          ) : (
            data
          )}
        </div>
      </div>
    </div>
  );
}
