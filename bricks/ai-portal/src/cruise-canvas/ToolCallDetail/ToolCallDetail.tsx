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
import type { Job } from "../interfaces";
import { WrappedDrawer } from "../bricks";
import styles from "./ToolCallDetail.module.css";
import sharedStyles from "../shared.module.css";
import { K, t } from "../i18n";
import { CanvasContext } from "../CanvasContext";
import { ToolCallStatus } from "../ToolCallStatus/ToolCallStatus";

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
  const toolCallMessages = job.messages?.filter((msg) => msg.role === "tool");

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

  return (
    <WrappedDrawer
      ref={ref}
      customTitle={t(K[toolCall.name as K]) || toolCall.name}
      width={width}
      closable
      mask
      maskClosable
      onClose={handleClose}
    >
      <ToolCallStatus job={job} variant="read-only" />
      <div className={styles.detail}>
        <div className={styles.heading}>{t(K.ARGUMENTS)}:</div>
        <div className={`${styles.body} ${sharedStyles.markdown}`}>
          <PreComponent content={toolCall.originalArguments} maybeJson />
        </div>
      </div>
      {!!toolCallMessages?.length && (
        <div className={styles.detail}>
          <div className={styles.heading}>{t(K.RESPONSE)}:</div>
          <div className={`${styles.body} ${sharedStyles.markdown}`}>
            {toolCallMessages?.map((message, index) => (
              <div key={index}>
                {message.parts?.map((part, partIndex) => (
                  <PreComponent
                    key={partIndex}
                    content={
                      part.type === "text" ? part.text : JSON.stringify(part)
                    }
                    maybeJson={part.type === "text"}
                  />
                ))}
              </div>
            ))}
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
