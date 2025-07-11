import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MarkdownComponent } from "@next-shared/markdown";
import type { Drawer } from "@next-bricks/containers/drawer";
import classNames from "classnames";
import type { DataPart, Job, Part } from "../interfaces";
import { WrappedDrawer } from "../bricks";
import styles from "./ToolCallDetail.module.css";
import sharedStyles from "../shared.module.css";
import { K, t } from "../i18n";
import { CanvasContext } from "../CanvasContext";
import { ToolCallStatus } from "../ToolCallStatus/ToolCallStatus";
import { ToolProgressLine } from "../ToolProgressLine/ToolProgressLine";
import { Topology } from "../Topology/Topology";

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
  const { setActiveToolCallJobId } = useContext(CanvasContext);
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
              continue;
            default:
              intermediateParts.push(part);
              continue;
          }
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
      customTitle={t(K[toolCall.name as K]) || toolCall.name}
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
                <ProcessMessageComponent
                  key={partIndex}
                  content={part.data.message}
                />
              ) : part.data?.type === "graph" &&
                ["component_graph", "component_graph_node"].includes(
                  part.data.message?.type
                ) ? (
                job.componentGraph ? (
                  <Topology
                    key={partIndex}
                    componentGraph={job.componentGraph}
                    filter={
                      part.data.message.type === "component_graph_node"
                        ? "related"
                        : "all"
                    }
                  />
                ) : null
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
}): JSX.Element {
  const [refinedContent, fallback] = useMemo(() => {
    if (maybeJson) {
      try {
        const json = JSON.parse(content ?? "");
        return [`${"```json\n"}${JSON.stringify(json, null, 2)}${"\n```"}`];
      } catch {
        // Fallback to original content
      }
    }
    return [content, true];
  }, [content, maybeJson]);

  return fallback ? (
    <pre className={classNames("language-plaintext", styles.fallback)}>
      {refinedContent}
    </pre>
  ) : (
    <MarkdownComponent content={refinedContent} />
  );
}

function ProcessMessageComponent({
  content,
}: {
  content: string;
}): JSX.Element {
  return (
    <div
      className={classNames(styles["stream-message"], sharedStyles.markdown)}
    >
      <MarkdownComponent content={content} />
    </div>
  );
}
