// istanbul ignore file: experimental
import React, {
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { HumanConfirm } from "../HumanConfirm/HumanConfirm.js";
import { HumanAdjustPlan } from "../HumanAdjustPlan/HumanAdjustPlan.js";
import { CanvasContext } from "../CanvasContext.js";
import { ToolCallStatus } from "../ToolCallStatus/ToolCallStatus.js";
import { HumanAdjustPlanResult } from "../HumanAdjustPlanResult/HumanAdjustPlanResult.js";
import { Topology } from "../Topology/Topology";

export interface NodeJobProps {
  job: Job;
  state?: string;
  active?: boolean;
}

export function NodeJob({ job, state, active }: NodeJobProps): JSX.Element {
  const toolName = job.toolCall?.name;
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
  const loading = state === "working" || state === "submitted";
  const hasGraph = !!job.componentGraph;

  return (
    <div
      className={classNames(styles["node-job"], {
        [styles.error]: job.isError,
        [styles["ask-user"]]: generalAskUser,
        [styles["fit-content"]]: hasGraph,
        [styles.active]: active,
      })}
    >
      <div className={styles.background} />
      <div className={styles.heading}>
        {generalAskUser ? (
          <WrappedIcon
            className={styles.icon}
            lib="fa"
            prefix="fas"
            // icon="person-circle-question"
            icon="user-check"
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
          {toolName ? t(K[toolName as K]) || toolName : "Elevo"}
        </div>
        <div className={styles.time}>
          {job.startTime && moment(job.startTime * 1000).format("MM-DD HH:mm")}
        </div>
      </div>
      <div
        className={classNames(styles.body, {
          // [styles.scrollable]: !generalAskUser && !experimental_showTables,
        })}
      >
        {knownAskUser ? (
          <>
            {(askUserPlan || !!job.toolCall!.arguments?.question) && (
              <div
                className={`${styles.message} ${sharedStyles.markdown} ${styles["role-assistant"]}`}
              >
                <MarkdownComponent
                  content={
                    askUserPlan
                      ? t(K.CONFIRMING_PLAN_TIPS)
                      : (job.toolCall!.arguments?.question as string)
                  }
                />
              </div>
            )}
            {state === "input-required" &&
              (job.toolCall!.arguments!.command === "ask_user_more" ? (
                <HumanInputComponent jobId={job.id} />
              ) : job.toolCall!.arguments!.command === "ask_user_confirm" ? (
                <HumanConfirm
                  jobId={job.id}
                  confirmText={job.toolCall!.arguments!.confirm_text as string}
                  cancelText={job.toolCall!.arguments!.cancel_text as string}
                />
              ) : job.toolCall!.arguments!.command === "ask_user_choose" ? (
                <HumanChooseComponent
                  jobId={job.id}
                  options={job.toolCall!.arguments!.options as string[]}
                />
              ) : job.toolCall!.arguments!.command ===
                "ask_user_select_from_cmdb" ? (
                <HumanSelectFromCmdb
                  jobId={job.id}
                  objectId={job.toolCall!.arguments!.objectId as string}
                  attrId={job.toolCall!.arguments!.attrId as string}
                />
              ) : askUserPlan ? (
                <HumanAdjustPlan
                  jobId={job.id}
                  steps={job.toolCall!.arguments!.steps as string[]}
                />
              ) : null)}
          </>
        ) : askUser ? (
          <div className={`${styles.message} ${styles["role-assistant"]}`}>
            Unexpected ask_human command:{" "}
            {JSON.stringify(job.toolCall!.arguments?.command ?? null)}
          </div>
        ) : null}
        {!generalAskUser && job.toolCall && <ToolCallStatus job={job} />}
        {askUserPlan && state !== "input-required" ? (
          <HumanAdjustPlanResult job={job} />
        ) : (
          job.messages?.map((message, index) =>
            message.role === "tool" && !generalAskUser ? null : (
              <div
                key={index}
                className={classNames(styles.message, sharedStyles.markdown, {
                  [styles["role-user"]]: message.role === "tool",
                })}
              >
                {message.parts?.map((part, partIndex) => (
                  <React.Fragment key={partIndex}>
                    {part.type === "text" ? (
                      <MarkdownComponent content={part.text} />
                    ) : (
                      <pre className="language-plaintext">
                        {JSON.stringify(part, null, 2)}
                      </pre>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )
          )
        )}
        {hasGraph && !job.componentGraph!.initial && (
          <Topology
            componentGraph={job.componentGraph!}
            filter="minimal"
            autoSize
          />
        )}
      </div>
    </div>
  );
}

function HumanInputComponent({ jobId }: { jobId: string }): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const { humanInput } = useContext(CanvasContext);

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
            humanInput(jobId, input);
          }
        }}
      />
    </div>
  );
}

function HumanChooseComponent({
  jobId,
  options,
}: {
  jobId: string;
  options?: string[];
}): JSX.Element {
  const { humanInput } = useContext(CanvasContext);

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
          themeVariant="elevo"
          onClick={() => {
            humanInput(jobId, option);
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
}: {
  jobId: string;
  objectId?: string;
  attrId?: string;
}): JSX.Element {
  const { humanInput } = useContext(CanvasContext);
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
            humanInput(
              jobId,
              e.detail.map((i) => i[fieldId /* ?? "instanceId" */]).join("\n")
            );
          }}
        />
      </Suspense>
    </div>
  );
}
