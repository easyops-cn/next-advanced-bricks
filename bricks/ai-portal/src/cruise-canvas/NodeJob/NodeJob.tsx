// istanbul ignore file: experimental
import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import classNames from "classnames";
import styles from "./NodeJob.module.css";
import sharedStyles from "../shared.module.css";
import type { CmdbInstanceDetailData } from "../interfaces";
import { FileInfo, Job } from "../../shared/interfaces";
import { ToolCallStatus } from "../ToolCallStatus/ToolCallStatus.js";
import { EnhancedMarkdown } from "../EnhancedMarkdown/EnhancedMarkdown";
import { CmdbInstanceDetail } from "../CmdbInstanceDetail/CmdbInstanceDetail";
import { FileList } from "../../shared/FilePreview/FileList";
import { RequestHumanAction } from "../../shared/RequestHumanAction/RequestHumanAction";
import { AIEmployeeAvatar } from "../AIEmployeeAvatar/AIEmployeeAvatar";
import { CreatedView } from "../../shared/CreatedView/CreatedView";
import { CanvasContext } from "../CanvasContext";
import { ViewToolbar } from "../../shared/CreatedView/ViewToolbar";

// 当 markdown 中包含超过 4 列的表格时，对节点使用大尺寸样式
const RegExpLargeTableInMarkdown = /^\s*\|(?:\s*:?-+:?\s*\|){4,}\s*$/m;

export interface NodeJobProps {
  job: Job;
  active?: boolean;
  isLeaf?: boolean;
}

export function NodeJob({ job, active, isLeaf }: NodeJobProps): JSX.Element {
  const toolName = job.toolCall?.name;

  const [toolMarkdownContent, cmdbInstanceDetails, files, sizeLarge] =
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

      large = large || RegExpLargeTableInMarkdown.test(markdownContent);

      return [markdownContent, instanceDetails, files, large] as const;
    }, [job.messages, toolName]);

  const [viewSize, setViewSize] = useState<"medium" | "large">("medium");

  const handleViewSizeChange = useCallback((value: "medium" | "large") => {
    setViewSize(value);
  }, []);

  return (
    <div
      className={classNames(styles["node-job"], {
        [styles.error]: job.isError,
        [styles.active]: active,
        [styles.large]: sizeLarge || viewSize === "large",
      })}
    >
      <div className={styles.background} />
      {job.aiEmployeeId ? (
        <div className={styles.heading}>
          <AIEmployeeAvatar aiEmployeeId={job.aiEmployeeId} />
          {job.generatedView ? <ViewToolbar job={job} /> : null}
        </div>
      ) : null}
      <div className={styles.body}>
        {job.toolCall && <ToolCallStatus job={job} />}
        {job.messages?.map((message, index) =>
          message.role === "tool" ? null : (
            <div
              key={index}
              className={classNames(styles.message, sharedStyles.markdown, {
                [styles["role-user"]]:
                  message.role === "tool" || message.role === "user",
              })}
            >
              {message.parts?.map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {part.type === "text" && (
                    <EnhancedMarkdown
                      className={sharedStyles["markdown-wrapper"]}
                      content={part.text}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )
        )}
        {toolMarkdownContent && (
          <div
            className={classNames(styles.message, sharedStyles.markdown)}
            style={{ padding: "0 8px" }}
          >
            <EnhancedMarkdown
              className={sharedStyles["markdown-wrapper"]}
              content={toolMarkdownContent}
            />
          </div>
        )}
        {cmdbInstanceDetails.map((detail, index) => (
          <CmdbInstanceDetail key={index} {...detail} />
        ))}
        {files.length > 0 && <FileList files={files} large={sizeLarge} />}
        {isLeaf &&
          !job.humanAction &&
          job.requestHumanAction &&
          (job.state === "working" || job.state === "input-required") && (
            <RequestHumanAction action={job.requestHumanAction} />
          )}
      </div>
      {job.generatedView ? (
        <ViewContainer job={job} onSizeChange={handleViewSizeChange} />
      ) : null}
    </div>
  );
}

interface ViewContainerProps {
  job: Job;
  onSizeChange?: (value: "medium" | "large") => void;
}

function ViewContainer({ job, onSizeChange }: ViewContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { setHoverOnScrollableContent } = useContext(CanvasContext);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      let found = false;
      let scrollableContent: HTMLElement | undefined;
      for (const el of e.nativeEvent.composedPath()) {
        if (el === ref.current) {
          break;
        }
        if (!(el instanceof HTMLElement)) {
          continue;
        }
        if (el.tagName === "PRE") {
          if (el.scrollWidth > el.clientWidth) {
            found = true;
            break;
          }
        } else if (el.classList.contains("ant-table-content")) {
          scrollableContent = el;
        } else if (
          el.classList.contains("ant-table") &&
          el.classList.contains("ant-table-scroll-horizontal")
        ) {
          if (
            scrollableContent &&
            scrollableContent.scrollWidth > scrollableContent.clientWidth
          ) {
            found = true;
            break;
          }
        }
      }
      setHoverOnScrollableContent(found);
    },
    [setHoverOnScrollableContent]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverOnScrollableContent(false);
  }, [setHoverOnScrollableContent]);

  return (
    <div
      className={styles["view-container"]}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <CreatedView job={job} noHeading onSizeChange={onSizeChange} />
    </div>
  );
}
