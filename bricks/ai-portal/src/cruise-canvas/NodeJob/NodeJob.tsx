// istanbul ignore file: experimental
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { MarkdownComponent } from "@next-shared/markdown";
import { TextareaAutoResize } from "@next-shared/form";
import { CmdbObjectApi_getObjectRef } from "@next-api-sdk/cmdb-sdk";
import classNames from "classnames";
import moment from "moment";
import { handleHttpError } from "@next-core/runtime";
import styles from "./NodeJob.module.css";
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

  const [expanded, setExpanded] = useState(false);
  const toggle = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={classNames(styles["node-job"], {
        [styles.error]: job.isError,
        [styles["ask-user"]]: knownAskUser,
      })}
    >
      <div className={styles.heading}>
        {job.toolCall ? (
          <>
            {askUser ? (
              <WrappedIcon
                className={styles.icon}
                lib="fa"
                prefix="fas"
                icon="person-circle-question"
              />
            ) : (
              <WrappedIcon
                className={styles.icon}
                lib="antd"
                theme="outlined"
                icon="tool"
              />
            )}
            <div className={styles.tool}>{job.toolCall?.name}</div>
          </>
        ) : (
          <>
            <WrappedIcon className={styles.icon} lib="easyops" icon="robot" />
          </>
        )}
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
        {!askUser && job.toolCall && !expanded ? (
          <>
            <div className={styles["tool-call"]}>
              {job.isError || state === "failed" ? (
                <WrappedIcon
                  className={`${styles["tool-icon"]} ${styles.failed}`}
                  lib="fa"
                  prefix="fas"
                  icon="xmark"
                />
              ) : state === "completed" ? (
                <WrappedIcon
                  className={styles["tool-icon"]}
                  lib="fa"
                  prefix="fas"
                  icon="check"
                />
              ) : state === "working" || state === "completed" ? (
                <WrappedIcon
                  className={styles["tool-icon"]}
                  lib="antd"
                  theme="outlined"
                  icon="loading-3-quarters"
                  spinning
                />
              ) : state === "input-required" ? (
                <WrappedIcon
                  className={styles["tool-icon"]}
                  lib="fa"
                  prefix="far"
                  icon="circle-pause"
                />
              ) : state === "canceled" ? (
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
            </div>
          </>
        ) : (
          job.messages?.map((message, index) => (
            <div
              key={index}
              className={classNames(styles.message, {
                [styles["role-user"]]: message.role === "tool" && askUser,
              })}
            >
              {message.parts?.map((part, partIndex) => (
                <React.Fragment key={partIndex}>
                  {part.type === "text" ? (
                    message.role === "tool" && askUser ? (
                      part.text
                    ) : (
                      <RefineMarkdownComponent
                        content={part.text}
                        isToolOutput={
                          message.role === "tool" && !!job.toolCall && !askUser
                        }
                      />
                    )
                  ) : part.type === "file" ? (
                    <div>{part.file.name}</div>
                  ) : (
                    <div>{JSON.stringify(part.data)}</div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ))
        )}
        {!askUser && job.toolCall && job.messages?.length ? (
          <WrappedIcon
            className={styles.expand}
            lib="fa"
            prefix="fas"
            icon={expanded ? "chevron-up" : "chevron-down"}
            onClick={toggle}
          />
        ) : null}
      </div>
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
    <div /* className="node-ask-user-more size-medium" */ ref={containerRef}>
      {/* <div className="message">
        <MarkdownComponent content={node.content} />
      </div> */}
      <TextareaAutoResize
        className={styles["human-input"]}
        containerRef={containerRef}
        autoResize
        minRows={2}
        paddingSize={14}
        placeholder="Type your message here..."
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

function RefineMarkdownComponent({
  content,
  isToolOutput,
}: {
  content?: string;
  isToolOutput?: boolean;
}): JSX.Element {
  const refinedContent = useMemo(() => {
    if (isToolOutput) {
      try {
        const json = JSON.parse(content ?? "");
        return `${"```json\n"}${JSON.stringify(json, null, 2)}${"\n```"}`;
      } catch {
        // Do nothing.
      }
    }
    return content;
  }, [content, isToolOutput]);

  return <MarkdownComponent content={refinedContent} />;
}
