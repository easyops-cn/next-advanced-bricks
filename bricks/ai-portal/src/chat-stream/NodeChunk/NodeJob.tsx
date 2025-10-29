import React, { useContext, useMemo, useState } from "react";
import classNames from "classnames";
import { isEqual } from "lodash";
import type { CmdbInstanceDetailData } from "../../cruise-canvas/interfaces.js";
import styles from "./NodeChunk.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedIcon } from "../../shared/bricks.js";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown.js";
import { CmdbInstanceDetail } from "../../cruise-canvas/CmdbInstanceDetail/CmdbInstanceDetail.js";
import { NodeView } from "../NodeView/NodeView.js";
import { TaskContext } from "../../shared/TaskContext.js";
import { StreamContext } from "../StreamContext.js";
import type { ActiveDetail, FileInfo, Job } from "../../shared/interfaces.js";
import { getStateDisplay } from "./getStateDisplay.js";
import { ICON_UP } from "../../shared/constants.js";
import { FileList } from "../../cruise-canvas/FileList/FileList.js";

export interface NodeJobProps {
  job: Job;
  isSubTask?: boolean;
}

export function NodeJob({ job, isSubTask }: NodeJobProps) {
  const toolCall = job.toolCall;
  const toolTitle = toolCall?.annotations?.title || toolCall?.name;
  const toolName = toolCall?.name;
  const showToolCall = !!toolCall;
  const { conversationState, setActiveDetail, setSubActiveDetail } =
    useContext(TaskContext);
  const { lastDetail, setUserClosedAside } = useContext(StreamContext);

  const { className, icon } = useMemo(() => {
    return getStateDisplay(job.state, conversationState);
  }, [job.state, conversationState]);

  const [toolMarkdownContent, cmdbInstanceDetails, files] = useMemo(() => {
    const contents: string[] = [];
    const instanceDetails: CmdbInstanceDetailData[] = [];
    const files: FileInfo[] = [];
    let large = toolName === "llm_answer";
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
                if (!large) {
                  large =
                    Object.keys(
                      part.data?.outputSchema?.type === "object"
                        ? part.data.outputSchema.properties
                        : part.data.detail
                    ).length > 6;
                }
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
  }, [job.messages, toolName]);

  const [collapsed, setCollapsed] = useState(false);
  const showHeading = showToolCall || !!job.instruction;

  return (
    <div className={classNames({ [styles.collapsed]: collapsed })}>
      {showHeading && (
        <div
          className={classNames(styles.heading, className)}
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <div className={styles.icon}>
            <WrappedIcon {...icon} />
          </div>
          <div className={styles.title}>{job.instruction || toolTitle}</div>
          <WrappedIcon className={styles.caret} {...ICON_UP} />
        </div>
      )}
      <div className={styles.body}>
        {showToolCall && (
          <div
            className={styles.tool}
            onClick={() => {
              const detail: ActiveDetail = {
                type: "job",
                id: job.id,
              };
              (isSubTask ? setSubActiveDetail : setActiveDetail)((prev) =>
                isEqual(prev, detail) ? prev : detail
              );
              if (isEqual(detail, lastDetail)) {
                setUserClosedAside(false);
              }
            }}
          >
            <WrappedIcon lib="lucide" icon="square-chevron-right" />
            {toolTitle}
          </div>
        )}
        <div className={styles.main}>
          {job.messages?.map((message, index) =>
            message.role === "tool" ? null : (
              <div
                key={index}
                className={classNames(styles.message, sharedStyles.markdown)}
              >
                {message.parts?.map((part, partIndex) => (
                  <React.Fragment key={partIndex}>
                    {part.type === "text" && (
                      <EnhancedMarkdown
                        className={classNames(
                          styles["message-part"],
                          sharedStyles["markdown-wrapper"]
                        )}
                        content={part.text}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )
          )}
        </div>
        <div className={styles.content}>
          {toolMarkdownContent && (
            <div className={classNames(styles.markdown, sharedStyles.markdown)}>
              <EnhancedMarkdown
                className={sharedStyles["markdown-wrapper"]}
                content={toolMarkdownContent}
              />
            </div>
          )}
          {cmdbInstanceDetails.map((detail, index) => (
            <div key={index} className={styles.box}>
              <CmdbInstanceDetail {...detail} />
            </div>
          ))}
          {job.generatedView ? <NodeView job={job} /> : null}
          {files.length > 0 && <FileList files={files} />}
        </div>
      </div>
    </div>
  );
}
