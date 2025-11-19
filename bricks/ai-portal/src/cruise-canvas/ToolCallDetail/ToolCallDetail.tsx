import React, { useMemo } from "react";
import classNames from "classnames";
import { initializeI18n } from "@next-core/i18n";
import type { DataPart, Job, Part } from "../../shared/interfaces";
import { WrappedCodeBlock } from "../../shared/bricks";
import styles from "./ToolCallDetail.module.css";
import sharedStyles from "../shared.module.css";
import { K, t, locales, NS } from "./i18n";
import { ToolProgressLine } from "../ToolProgressLine/ToolProgressLine";
import { EnhancedMarkdown } from "../EnhancedMarkdown/EnhancedMarkdown";
import { MarkdownPre } from "../../shared/MarkdownPre";

initializeI18n(NS, locales);

export interface ToolCallDetailProps {
  job: Job;
}

export function ToolCallDetail({ job }: ToolCallDetailProps): JSX.Element {
  const toolCall = job.toolCall!;

  const [progress, intermediateParts, responseParts] = useMemo(() => {
    const toolCallMessages = job.messages?.filter((msg) => msg.role === "tool");
    const intermediateParts: DataPart[] = [];
    const responseParts: Part[] = [];
    let progress: DataPart | undefined;
    for (const message of toolCallMessages ?? []) {
      for (const part of message.parts) {
        if (part.type === "data") {
          switch (part.data?.type) {
            case "progress":
              // Take the last progress part
              progress = part;
              continue;
            case "markdown":
            case "cmdb_instance_detail":
            case "static_data_view":
              continue;
            default:
              intermediateParts.push(part);
              continue;
          }
        } else if (part.type === "file") {
          continue;
        }
        responseParts.push(part);
      }
    }
    return [progress, intermediateParts, responseParts];
  }, [job.messages]);

  const hasProcessParts = intermediateParts.length > 0 || !!progress;
  const hasResponseParts = responseParts.length > 0;
  const toolState =
    (["working", "input-required"].includes(job.state) && hasProcessParts) ||
    hasResponseParts
      ? "completed"
      : job.state;

  const failed = job.isError || toolState === "failed";

  return (
    <>
      <div className={styles.detail}>
        <div className={styles.heading}>{t(K.ARGUMENTS)}:</div>
        <div className={`${styles.body} ${sharedStyles.markdown}`}>
          <PreComponent
            content={toolCall.originalArguments}
            maybeJson
            fallbackAsMarkdown
          />
        </div>
      </div>
      {hasProcessParts && (
        <div className={styles.detail}>
          <div className={styles.heading}>{t(K.PROCESS)}:</div>
          <div className={styles.body}>
            {intermediateParts.map((part, partIndex) =>
              part.data?.type === "stream" ? (
                <div
                  key={partIndex}
                  className={classNames(
                    styles["stream-message"],
                    sharedStyles.markdown
                  )}
                >
                  <EnhancedMarkdown
                    className={sharedStyles["markdown-wrapper"]}
                    content={part.data.message}
                  />
                </div>
              ) : (
                <div key={partIndex} className={sharedStyles.markdown}>
                  <PreComponent content={JSON.stringify(part)} />
                </div>
              )
            )}
            {!!progress && (
              <div
                className={classNames(styles["progress-container"], {
                  [styles["progress-fallback"]]: failed,
                })}
              >
                <ToolProgressLine progress={progress} failed={failed} />
              </div>
            )}
          </div>
        </div>
      )}
      {hasResponseParts && (
        <div className={styles.detail}>
          <div className={styles.heading}>{t(K.RESPONSE)}:</div>
          <div className={`${styles.body} ${sharedStyles.markdown}`}>
            {responseParts.map((part, partIndex) =>
              part.type === "data" && part.data?.type === "progress" ? null : (
                <PreComponent
                  key={partIndex}
                  content={
                    part.type === "text" ? part.text : JSON.stringify(part)
                  }
                  maybeJson={part.type === "text"}
                />
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

function PreComponent({
  content,
  maybeJson,
  fallbackAsMarkdown,
}: {
  content?: string;
  maybeJson?: boolean;
  fallbackAsMarkdown?: boolean;
}): JSX.Element | null {
  const [refinedContent, fallback, asMarkdown] = useMemo(() => {
    if (maybeJson && content) {
      try {
        const json = JSON.parse(content);
        return [JSON.stringify(json, null, 2), false, false];
      } catch {
        // Fallback to original content
        if (fallbackAsMarkdown) {
          return [content, false, true];
        }
      }
    }
    return [content, true, false];
  }, [content, fallbackAsMarkdown, maybeJson]);

  return asMarkdown ? (
    <div className={styles["markdown-block"]}>
      <EnhancedMarkdown
        className={sharedStyles["markdown-wrapper"]}
        content={refinedContent}
      />
    </div>
  ) : fallback ? (
    <div className={styles["code-fallback"]}>
      <MarkdownPre>
        <code>{refinedContent}</code>
      </MarkdownPre>
    </div>
  ) : (
    <WrappedCodeBlock
      className={styles["code-block"]}
      source={refinedContent!}
      language="json"
      themeVariant="elevo"
    />
  );
}
