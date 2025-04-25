import React, { Suspense, useEffect, useRef, useState } from "react";
import { MarkdownComponent } from "@next-shared/markdown";
import { TextareaAutoResize } from "@next-shared/form";
import { CmdbObjectApi_getObjectRef } from "@next-api-sdk/cmdb-sdk";
import classNames from "classnames";
import styles from "./NodeJob.module.css";
import type { Job } from "../interfaces";
import { K, t } from "../i18n.js";
import { AsyncWrappedCMDB } from "../cmdb.js";
import { WrappedButton, WrappedIcon } from "../bricks.js";
import moment from "moment";

export interface NodeJobProps {
  job: Job;
  state?: string;
  humanInput?: (jobId: string, input: string) => void;
}

export function NodeJob({ job, state, humanInput }: NodeJobProps): JSX.Element {
  const askUser = job.toolCall?.name === "ask_human";
  const knownAskUser =
    askUser &&
    ["ask_user_more", "ask_user_confirm", "ask_user_select_from_cmdb"].includes(
      job.toolCall!.arguments?.command as string
    );

  return (
    <div className={styles["node-job"]}>
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
                lib="fa"
                prefix="fas"
                icon="globe"
              />
            )}
            <div className={styles.tool}>{job.toolCall?.name}</div>
          </>
        ) : (
          <>
            <WrappedIcon className={styles.icon} lib="easyops" icon="robot" />
          </>
        )}
        {job.startTime && (
          <div className={styles.time}>
            {moment(job.startTime * 1000).format("MM-DD HH:mm")}
          </div>
        )}
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
                <HumanConfirmComponent jobId={job.id} humanInput={humanInput} />
              ) : job.toolCall!.arguments!.command ===
                "ask_user_select_from_cmdb" ? (
                <HumanSelectFromCmdb jobId={job.id} humanInput={humanInput} />
              ) : null)}
          </>
        ) : askUser ? (
          <div className={styles.message}>
            Unexpected ask_human command:{" "}
            {JSON.stringify(job.toolCall!.arguments?.command ?? null)}
          </div>
        ) : null}
        {job.messages?.map((message, index) => (
          <div
            key={index}
            className={classNames(styles.message, {
              [styles["role-user"]]: message.role === "tool" && knownAskUser,
            })}
          >
            {message.parts?.map((part, partIndex) => (
              <React.Fragment key={partIndex}>
                {part.type === "text" ? (
                  message.role === "user" ? (
                    part.text
                  ) : (
                    <MarkdownComponent content={part.text} />
                  )
                ) : part.type === "file" ? (
                  <div>{part.file.name}</div>
                ) : (
                  <div>{JSON.stringify(part.data)}</div>
                )}
              </React.Fragment>
            ))}
          </div>
        ))}
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
}: {
  jobId: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  return (
    <div style={{ marginTop: "1em" }}>
      <WrappedButton
        type="primary"
        onClick={() => {
          humanInput?.(jobId, t(K.CONFIRM));
        }}
      >
        {t(K.CONFIRM)}
      </WrappedButton>
      <WrappedButton
        onClick={() => {
          humanInput?.(jobId, t(K.CANCEL));
        }}
        style={{ marginLeft: "0.5em" }}
      >
        {t(K.CANCEL)}
      </WrappedButton>
    </div>
  );
}

function HumanSelectFromCmdb({
  jobId,
  humanInput,
}: {
  jobId: string;
  humanInput?: (jobId: string, input: string) => void;
}): JSX.Element {
  const objectId = "HOST";
  const attrId = "ip";

  const [objectList, setObjectList] = useState<any[] | null>(null);

  useEffect(() => {
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
        console.error("fetch object list failed:", e);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [objectId]);

  return (
    <div style={{ marginTop: "1em" }}>
      <Suspense>
        <AsyncWrappedCMDB
          objectList={objectList}
          objectId={objectId}
          fieldId={attrId}
          onChangeV2={(e) => {
            humanInput?.(jobId, e.detail.map((i) => i[attrId]).join("\n"));
          }}
        />
      </Suspense>
    </div>
  );
}
