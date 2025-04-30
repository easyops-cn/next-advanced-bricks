// istanbul ignore file: experimental
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownComponent } from "@next-shared/markdown";
import { TextareaAutoResize } from "@next-shared/form";
import { CmdbObjectApi_getObjectRef } from "@next-api-sdk/cmdb-sdk";
import classNames from "classnames";
import moment from "moment";
import { handleHttpError } from "@next-core/runtime";
import styles from "./NodeJob.module.css";
import sharedStyles from "../shared.module.css";
import type { Job } from "../interfaces";
import { K, t } from "../i18n.js";
import { AsyncWrappedCMDB } from "../cmdb.js";
import { WrappedButton, WrappedIcon } from "../bricks.js";

export interface NodeJobProps {
  job: Job;
  state?: string;
  humanInput?: (jobId: string, input: string) => void;
}

export function NodeJob({ job, state, humanInput }: NodeJobProps): JSX.Element {
  const askUser = job.toolCall?.name === "ask_human";
  const knownAskUser =
    askUser &&
    [
      "ask_user_more",
      "ask_user_confirm",
      "ask_user_choose",
      "ask_user_select_from_cmdb",
    ].includes(job.toolCall!.arguments?.command as string);
  const loading = state === "working" || state === "submitted";

  return (
    <div
      className={classNames(styles["node-job"], {
        [styles.error]: job.isError,
        [styles["ask-user"]]: knownAskUser,
      })}
    >
      <div className={styles.heading}>
        {askUser ? (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="fas"
            icon="person-circle-question"
          />
        ) : job.toolCall ? (
          <WrappedIcon
            className={styles.icon}
            lib="antd"
            theme="outlined"
            icon="tool"
          />
        ) : (
          <WrappedIcon className={styles.icon} lib="easyops" icon="robot" />
        )}
        <div
          className={classNames(styles.tool, {
            [sharedStyles["shine-text"]]: loading,
          })}
        >
          {job.toolCall?.name
            ? t(K[job.toolCall.name as K]) || job.toolCall.name
            : "Elevo"}
        </div>
        <div className={styles.time}>
          {job.startTime && moment(job.startTime * 1000).format("MM-DD HH:mm")}
        </div>
      </div>
      <div className={styles.body}>
        {knownAskUser ? (
          <>
            <div className={`${styles.message} ${styles["role-assistant"]}`}>
              <MarkdownComponent
                content={job.toolCall!.arguments?.question as string}
              />
            </div>
            {state === "input-required" &&
              (job.toolCall!.arguments!.command === "ask_user_more" ? (
                <HumanInputComponent jobId={job.id} humanInput={humanInput} />
              ) : job.toolCall!.arguments!.command === "ask_user_confirm" ? (
                <HumanConfirmComponent
                  jobId={job.id}
                  humanInput={humanInput}
                  confirmText={job.toolCall!.arguments!.confirm_text as string}
                  cancelText={job.toolCall!.arguments!.cancel_text as string}
                />
              ) : job.toolCall!.arguments!.command === "ask_user_choose" ? (
                <HumanChooseComponent
                  jobId={job.id}
                  humanInput={humanInput}
                  options={job.toolCall!.arguments!.options as string[]}
                />
              ) : job.toolCall!.arguments!.command ===
                "ask_user_select_from_cmdb" ? (
                <HumanSelectFromCmdb
                  jobId={job.id}
                  humanInput={humanInput}
                  objectId={job.toolCall!.arguments!.objectId as string}
                  attrId={job.toolCall!.arguments!.attrId as string}
                />
              ) : null)}
          </>
        ) : askUser ? (
          <div className={`${styles.message} ${styles["role-assistant"]}`}>
            Unexpected ask_human command:{" "}
            {JSON.stringify(job.toolCall!.arguments?.command ?? null)}
          </div>
        ) : null}
        {!askUser && job.toolCall && <ToolCallComponent job={job} />}
        {job.messages?.map((message, index) =>
          message.role === "tool" && !askUser ? null : (
            <div
              key={index}
              className={classNames(styles.message, {
                [styles["role-user"]]: message.role === "tool",
              })}
            >
              {message.parts?.map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {part.type === "text" ? (
                    <MarkdownComponent content={part.text} />
                  ) : part.type === "file" ? (
                    <pre className="language-plaintext">
                      File: {part.file.name}
                    </pre>
                  ) : (
                    <pre className="language-plaintext">
                      Data: {JSON.stringify(part.data, null, 2)}
                    </pre>
                  )}
                </React.Fragment>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ToolCallComponent({ job }: { job: Job }): JSX.Element {
  const toolCall = job.toolCall!;
  const toolCallMessages = job.messages?.filter((msg) => msg.role === "tool");

  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    setExpanded((prev) => !prev);
  };

  const toolState =
    (job.state === "working" || job.state === "input-required") &&
    toolCallMessages?.length
      ? "completed"
      : job.state;

  return (
    <div
      className={classNames(styles["tool-call"], {
        [styles.expanded]: expanded,
      })}
    >
      <div className={styles["tool-call-heading"]} onClick={toggle}>
        {/* <WrappedIcon lib="antd" theme="outlined" icon="code" /> */}
        {job.isError || toolState === "failed" ? (
          <WrappedIcon
            className={`${styles["tool-icon"]} ${styles.failed}`}
            lib="fa"
            prefix="fas"
            icon="xmark"
          />
        ) : toolState === "completed" ? (
          <WrappedIcon
            className={styles["tool-icon"]}
            lib="fa"
            prefix="fas"
            icon="check"
          />
        ) : toolState === "working" ? (
          <WrappedIcon
            className={styles["tool-icon"]}
            lib="antd"
            theme="outlined"
            icon="loading-3-quarters"
            spinning
          />
        ) : toolState === "input-required" ? (
          <WrappedIcon
            className={styles["tool-icon"]}
            lib="fa"
            prefix="far"
            icon="circle-pause"
          />
        ) : toolState === "canceled" ? (
          <WrappedIcon
            className={styles["tool-icon"]}
            lib="fa"
            prefix="far"
            icon="circle-stop"
          />
        ) : (
          <WrappedIcon
            className={styles["tool-icon"]}
            lib="fa"
            prefix="far"
            icon="clock"
          />
        )}
        <span className={styles["tool-call-name"]}>{toolCall.name}</span>
        <WrappedIcon
          className={styles.expand}
          lib="fa"
          prefix="fas"
          icon={expanded ? "chevron-up" : "chevron-down"}
        />
      </div>
      {expanded && (
        <dl className={styles["tool-call-body"]}>
          <dt>{t(K.ARGUMENTS)}:</dt>
          <dd>
            <PreComponent content={toolCall.originalArguments} maybeJson />
          </dd>
          {!!toolCallMessages?.length && (
            <>
              <dt>{t(K.RESPONSE)}:</dt>
              <dd>
                {toolCallMessages?.map((message, index) => (
                  <div key={index}>
                    {message.parts?.map((part, partIndex) => (
                      <PreComponent
                        key={partIndex}
                        content={
                          part.type === "text"
                            ? part.text
                            : part.type === "file"
                              ? `File: ${part.file.name}`
                              : `Data: ${JSON.stringify(part.data, null, 2)}`
                        }
                        maybeJson={part.type === "text"}
                      />
                    ))}
                  </div>
                ))}
              </dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}

function HumanInputComponent({
  jobId,
  humanInput,
}: {
  jobId: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef}>
      <TextareaAutoResize
        className={styles["human-input"]}
        containerRef={containerRef}
        autoResize
        minRows={2}
        borderSize={0}
        paddingSize={20}
        placeholder={t(K.TYPE_YOUR_MESSAGE_HERE)}
        submitWhen="enter-without-shift"
        onSubmit={(e) => {
          const input = e.currentTarget.value;
          if (input) {
            humanInput?.(jobId, input);
          }
        }}
      />
    </div>
  );
}

function HumanConfirmComponent({
  jobId,
  humanInput,
  confirmText,
  cancelText,
}: {
  jobId: string;
  confirmText?: string;
  cancelText?: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  return (
    <div style={{ marginTop: "1em" }}>
      <WrappedButton
        type="primary"
        onClick={() => {
          humanInput?.(jobId, confirmText || t(K.YES));
        }}
      >
        {confirmText || t(K.YES)}
      </WrappedButton>
      <WrappedButton
        onClick={() => {
          humanInput?.(jobId, cancelText || t(K.NO));
        }}
        style={{ marginLeft: "0.5em" }}
      >
        {cancelText || t(K.NO)}
      </WrappedButton>
    </div>
  );
}

function HumanChooseComponent({
  jobId,
  options,
  humanInput,
}: {
  jobId: string;
  options?: string[];
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  return (
    <div
      style={{
        marginTop: "1em",
        display: "flex",
        flexDirection: "column",
        gap: "0.5em",
      }}
    >
      {options?.map((option, index) => (
        <WrappedButton
          key={index}
          onClick={() => {
            humanInput?.(jobId, option);
          }}
        >
          {option}
        </WrappedButton>
      ))}
    </div>
  );
}

function HumanSelectFromCmdb({
  jobId,
  objectId,
  attrId,
  humanInput,
}: {
  jobId: string;
  objectId?: string;
  attrId?: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  const [objectList, setObjectList] = useState<any[] | null>(null);

  useEffect(() => {
    if (!objectId) {
      return;
    }
    let ignore = false;
    (async () => {
      try {
        const objects = (
          await CmdbObjectApi_getObjectRef({ ref_object: objectId })
        ).data;
        if (!ignore) {
          setObjectList(objects);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Fetch object list failed:", e);
        handleHttpError(e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [objectId]);

  if (!objectId) {
    return (
      <div style={{ marginTop: "1em" }}>
        Can not call ask_user_select_from_cmdb without objectId
      </div>
    );
  }
  // if (!objectId || !attrId) {
  //   return <div style={{ marginTop: "1em" }}>Can not call ask_user_select_from_cmdb without {!objectId ? "objectId" : "attrId"}</div>;
  // }

  const fieldId =
    !attrId || (attrId === "instanceId" && objectId === "HOST") ? "ip" : attrId;

  return (
    <div style={{ marginTop: "1em" }}>
      <Suspense>
        <AsyncWrappedCMDB
          objectList={objectList}
          objectId={objectId}
          fieldId={fieldId}
          onChangeV2={(e) => {
            if (!e.detail.length) {
              return;
            }
            humanInput?.(
              jobId,
              e.detail.map((i) => i[fieldId /* ?? "instanceId" */]).join("\n")
            );
          }}
        />
      </Suspense>
    </div>
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
    <pre className="language-plaintext">{refinedContent}</pre>
  ) : (
    <MarkdownComponent content={refinedContent} />
  );
}
