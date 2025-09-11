import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Drawer } from "@next-bricks/containers/drawer";
import classNames from "classnames";
import type { DataPart, Job, Part } from "../interfaces";
import { WrappedDrawer } from "../../shared/bricks";
import styles from "./ToolCallDetail.module.css";
import sharedStyles from "../shared.module.css";
import { K, t } from "../i18n";
import { TaskContext } from "../../shared/TaskContext";
import { ToolCallStatus } from "../ToolCallStatus/ToolCallStatus";
import { ToolProgressLine } from "../ToolProgressLine/ToolProgressLine";
import { CodeBlock } from "../CodeBlock/CodeBlock";
import { EnhancedMarkdown } from "../EnhancedMarkdown/EnhancedMarkdown";
import { useCodeBlock } from "../../shared/useCodeBlock";

export interface ToolCallDetailProps {
  job: Job;
}

function getDrawerWidth() {
  const { innerWidth } = window;
  return innerWidth < 800
    ? Math.min(500, innerWidth)
    : innerWidth < 1000
      ? innerWidth * 0.8
      : 800;
}

export function ToolCallDetail({ job }: ToolCallDetailProps): JSX.Element {
  const { setActiveToolCallJobId } = useContext(TaskContext);
  const toolCall = job.toolCall!;
  const toolTitle = toolCall.annotations?.title;

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

  const handleClose = useCallback(() => {
    setTimeout(() => {
      setActiveToolCallJobId(null);
    }, 300);
  }, [setActiveToolCallJobId]);

  const ref = useRef<Drawer>(null);

  useEffect(() => {
    setTimeout(() => {
      ref.current?.open();
    });
  }, []);

  const [width, setWidth] = useState(getDrawerWidth);

  useEffect(() => {
    const onResize = () => {
      setWidth(getDrawerWidth);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const hasProcessParts = intermediateParts.length > 0 || !!progress;
  const hasResponseParts = responseParts.length > 0;
  const toolState =
    (["working", "input-required"].includes(job.state) && hasProcessParts) ||
    hasResponseParts
      ? "completed"
      : job.state;

  const failed = job.isError || toolState === "failed";

  return (
    <WrappedDrawer
      ref={ref}
      customTitle={toolTitle || toolCall.name}
      width={width}
      closable
      mask
      maskClosable
      keyboard
      onClose={handleClose}
    >
      <ToolCallStatus job={job} variant="read-only" />
      <div className={styles.detail}>
        <div className={styles.heading}>{t(K.ARGUMENTS)}:</div>
        <div className={`${styles.body} ${sharedStyles.markdown}`}>
          <PreComponent content={toolCall.originalArguments} maybeJson />
        </div>
      </div>
      {hasProcessParts && (
        <div className={styles.detail}>
          <div className={styles.heading}>{t(K.PROCESS)}:</div>
          <div className={`${styles.body} ${sharedStyles.markdown}`}>
            {intermediateParts.map((part, partIndex) =>
              part.data?.type === "stream" ? (
                <div
                  key={partIndex}
                  className={classNames(
                    styles["stream-message"],
                    sharedStyles.markdown
                  )}
                >
                  <EnhancedMarkdown content={part.data.message} />
                </div>
              ) : (
                <PreComponent key={partIndex} content={JSON.stringify(part)} />
              )
            )}
            {!!progress && (
              <div
                className={classNames(styles["progress-container"], {
                  [styles.fallback]: failed,
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
    </WrappedDrawer>
  );
}

function PreComponent({
  content,
  maybeJson,
}: {
  content?: string;
  maybeJson?: boolean;
}): JSX.Element | null {
  const [refinedContent, fallback] = useMemo(() => {
    if (maybeJson && content) {
      try {
        const json = JSON.parse(content);
        return [JSON.stringify(json, null, 2), false];
      } catch {
        // Fallback to original content
      }
    }
    return [content, true];
  }, [content, maybeJson]);

  const refinedNode = useCodeBlock({
    language: "json",
    source: refinedContent!,
    disabled: fallback,
  });

  return fallback ? (
    <CodeBlock className={classNames("shiki light-plus", styles.fallback)}>
      <code>{refinedContent}</code>
    </CodeBlock>
  ) : (
    refinedNode
  );
}
