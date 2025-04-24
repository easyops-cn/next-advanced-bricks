import React, { Suspense, useEffect, useRef, useState } from "react";
import { MarkdownComponent } from "@next-shared/markdown";
import { wrapBrick } from "@next-core/react-element";
import type { Button, ButtonProps } from "@next-bricks/basic/button";
import { TextareaAutoResize } from "@next-shared/form";
import { CmdbObjectApi_getObjectRef } from "@next-api-sdk/cmdb-sdk";
import styles from "./NodeJob.module.css";
import type { Job } from "../interfaces";
import { K, t } from "../i18n.js";
import { AsyncWrappedCMDB } from "../cmdb.js";

const WrappedButton = wrapBrick<Button, ButtonProps>("eo-button");

export interface NodeJobProps {
  job: Job;
  state?: string;
  humanInput?: (jobId: string, input: string) => void;
}

export function NodeJob({ job, state, humanInput }: NodeJobProps): JSX.Element {
  return (
    <div className={styles["node-job"]}>
      <div className={styles.heading}>
        <div className={styles.tool}>{job.toolCall?.name}</div>
        <div className={styles.time}>03-24 15:23</div>
      </div>
      <div className={styles.body}>
        {[
          "ask_user_more",
          "ask_user_confirm",
          "ask_user_select_from_cmdb",
        ].includes(job.toolCall?.name as string) ? (
          <>
            <div className={`${styles.message} ${styles["role-assistant"]}`}>
              <MarkdownComponent
                content={job.toolCall!.arguments?.question as string}
              />
            </div>
            {state === "input-required" &&
              (job.toolCall!.name === "ask_user_more" ? (
                <HumanInputComponent jobId={job.id} humanInput={humanInput} />
              ) : job.toolCall!.name === "ask_user_confirm" ? (
                <HumanConfirmComponent jobId={job.id} humanInput={humanInput} />
              ) : job.toolCall!.name === "ask_user_select_from_cmdb" ? (
                <HumanSelectFromCmdb jobId={job.id} humanInput={humanInput} />
              ) : null)}
          </>
        ) : null}
        {job.messages?.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${styles[`role-${message.role}`]}`}
          >
            {message.parts?.map((part, partIndex) => (
              <React.Fragment key={partIndex}>
                {part.type === "text" ? (
                  <MarkdownComponent content={part.text} />
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
