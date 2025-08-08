import React, { useMemo } from "react";
import classNames from "classnames";
import type {
  CmdbInstanceDetailData,
  FileInfo,
  Job,
  JobState,
  TaskState,
} from "../../cruise-canvas/interfaces.js";
import styles from "./NodeJob.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedIcon } from "../../cruise-canvas/bricks.js";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown.js";
import { CmdbInstanceDetail } from "../../cruise-canvas/CmdbInstanceDetail/CmdbInstanceDetail.js";

export interface NodeJobProps {
  job: Job;
  taskState: TaskState | undefined;
}

export function NodeJob({ job, taskState }: NodeJobProps) {
  const toolTitle = job.toolCall?.annotations?.title || job.toolCall?.name;
  const toolName = job.toolCall?.name;

  const { className, icon } = useMemo(() => {
    return getClassNameAndIconProps(job.state, taskState);
  }, [job.state, taskState]);

  const [toolMarkdownContent, cmdbInstanceDetails /* , files */] =
    useMemo(() => {
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

  return (
    <div className={styles.job}>
      <div className={classNames(styles.heading, className)}>
        <div className={styles.icon}>
          <WrappedIcon className={styles.icon} {...icon} />
        </div>
        <div className={styles.title}>{job.instruction || toolTitle}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.tool}>{toolTitle}</div>
        <div className={styles.content}>
          {toolMarkdownContent && (
            <div className={classNames(styles.markdown, sharedStyles.markdown)}>
              <EnhancedMarkdown content={toolMarkdownContent} />
            </div>
          )}
          {cmdbInstanceDetails.map((detail, index) => (
            <div key={index} className={styles.box}>
              <CmdbInstanceDetail {...detail} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getClassNameAndIconProps(
  state: JobState | undefined,
  taskState: TaskState | undefined
) {
  switch (state) {
    case "completed":
      return {
        className: styles.completed,
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "check",
        },
      };
    case "submitted":
    case "working":
      if (taskState === "paused" || taskState === "canceled") {
        return {
          icon: {
            lib: "fa",
            prefix: "far",
            icon: taskState === "paused" ? "circle-pause" : "circle-stop",
          },
        };
      }
      return {
        className: styles.working,
        icon: {
          lib: "antd",
          theme: "outlined",
          icon: "loading-3-quarters",
          spinning: true,
        },
      };
    case "input-required":
      return {
        className: styles["input-required"],
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "circle-user",
        },
      };
    case "failed":
      return {
        className: styles.failed,
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "xmark",
        },
      };
    case "canceled":
      return {
        className: styles.canceled,
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "circle-stop",
        },
      };
    case "skipped":
      return {
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "ban",
        },
      };
    default:
      return {
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "clock",
        },
      };
  }
}
