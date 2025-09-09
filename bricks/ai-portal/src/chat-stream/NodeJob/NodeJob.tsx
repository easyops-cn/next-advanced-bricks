import React, { useContext, useMemo, useState } from "react";
import classNames from "classnames";
import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import type {
  CmdbInstanceDetailData,
  FileInfo,
  Job,
  JobState,
  TaskState,
} from "../../cruise-canvas/interfaces.js";
import styles from "./NodeJob.module.css";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { WrappedIcon } from "../../shared/bricks.js";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown.js";
import { CmdbInstanceDetail } from "../../cruise-canvas/CmdbInstanceDetail/CmdbInstanceDetail.js";
import { K, t } from "../i18n.js";
import { HumanAdjustPlanResult } from "../HumanAdjustPlanResult/HumanAdjustPlanResult.js";
import { HumanAdjustPlan } from "../../shared/HumanAdjustPlan/HumanAdjustPlan.js";
import { NodeView } from "../NodeView/NodeView.js";
import { TaskContext } from "../../shared/TaskContext.js";
import { StreamContext } from "../StreamContext.js";
import type { ConversationState } from "../../shared/interfaces.js";

export interface NodeJobProps {
  job: Job;
  taskState: TaskState | ConversationState | undefined;
}

const ICON_UP: GeneralIconProps = {
  lib: "fa",
  icon: "angle-up",
};

export function NodeJob({ job, taskState }: NodeJobProps) {
  const toolCall = job.toolCall;
  const toolTitle = toolCall?.annotations?.title || toolCall?.name;
  const toolName = toolCall?.name;
  const askUser = toolName === "ask_human";
  const askUserPlan = toolName === "ask_human_confirming_plan";
  const generalAskUser = askUser || askUserPlan;
  const knownAskUser =
    (askUser &&
      [
        "ask_user_more",
        "ask_user_confirm",
        "ask_user_choose",
        "ask_user_select_from_cmdb",
        "ask_user_adjust_plan",
      ].includes(job.toolCall!.arguments?.command as string)) ||
    askUserPlan;
  const showToolCall = !!toolCall && !generalAskUser;
  const { setActiveToolCallJobId } = useContext(TaskContext);
  const { lastToolCallJobId, setUserClosedAside } = useContext(StreamContext);

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

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={classNames({ [styles.collapsed]: collapsed })}>
      <div className={styles.main}>
        {knownAskUser ? (
          <>
            {(askUserPlan || !!toolCall!.arguments?.question) && (
              <div
                className={classNames(styles.message, sharedStyles.markdown)}
              >
                <EnhancedMarkdown
                  className={styles["message-part"]}
                  content={
                    askUserPlan
                      ? t(K.CONFIRMING_PLAN_TIPS)
                      : (job.toolCall!.arguments?.question as string)
                  }
                />
              </div>
            )}
            {job.state === "input-required" &&
              (askUserPlan ? (
                <HumanAdjustPlan
                  jobId={job.id}
                  steps={job.toolCall!.arguments!.steps as string[]}
                />
              ) : null)}
          </>
        ) : null}
        {askUserPlan && job.state === "completed" ? (
          <HumanAdjustPlanResult job={job} />
        ) : askUser ? null : (
          job.messages?.map((message, index) =>
            message.role === "tool" && !generalAskUser ? null : (
              <div
                key={index}
                className={classNames(styles.message, sharedStyles.markdown)}
              >
                {message.parts?.map((part, partIndex) => (
                  <React.Fragment key={partIndex}>
                    {part.type === "text" && (
                      <EnhancedMarkdown
                        className={styles["message-part"]}
                        content={part.text}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )
          )
        )}
      </div>
      {showToolCall && (
        <>
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
          <div className={styles.body}>
            <div
              className={styles.tool}
              onClick={() => {
                setActiveToolCallJobId(job.id);
                if (job.id === lastToolCallJobId) {
                  setUserClosedAside(false);
                }
              }}
            >
              {toolTitle}
            </div>
            <div className={styles.content}>
              {toolMarkdownContent && (
                <div
                  className={classNames(styles.markdown, sharedStyles.markdown)}
                >
                  <EnhancedMarkdown content={toolMarkdownContent} />
                </div>
              )}
              {cmdbInstanceDetails.map((detail, index) => (
                <div key={index} className={styles.box}>
                  <CmdbInstanceDetail {...detail} />
                </div>
              ))}
              {job.constructedView ? <NodeView job={job} /> : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getClassNameAndIconProps(
  state: JobState | undefined,
  taskState: TaskState | ConversationState | undefined
) {
  switch (state) {
    case "completed":
      return {
        className: styles.completed,
        icon: {
          lib: "antd",
          theme: "filled",
          icon: "check-circle",
        },
      };
    case "submitted":
    case "working":
      if (
        taskState === "paused" ||
        taskState === "canceled" ||
        taskState === "terminated"
      ) {
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
    case "terminated" as JobState:
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
