import React, {
  createContext,
  Fragment,
  useContext,
  useMemo,
  useState,
} from "react";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import { isEqual } from "lodash";
import type { ActiveDetail, Job, PlanStep, Task } from "../interfaces";
import styles from "./ActivityPlan.module.css";
import { K, locales, NS, t } from "./i18n";
import { WrappedIcon } from "../bricks";
import { ICON_UP } from "../constants";
import { TaskContext } from "../TaskContext";
import { useConversationStream } from "../../chat-stream/useConversationStream";
import { getStateIcon } from "./getStateIcon";
import type {
  MessageChunk,
  MessageFromAssistant,
} from "../../chat-stream/interfaces";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { StreamContext } from "../../chat-stream/StreamContext";

initializeI18n(NS, locales);

export interface ActivityPlanProps {
  task: Task;
}

const ActivityPlanContext = createContext<{
  collapsed?: boolean;
}>({});

export function ActivityPlan({ task }: ActivityPlanProps) {
  const [collapsed, setCollapsed] = useState(true);
  const { toggleAutoScroll } = useContext(StreamContext);

  return (
    <ActivityPlanContext.Provider value={{ collapsed }}>
      <div
        className={classNames(styles.plan, { [styles.collapsed]: collapsed })}
      >
        <div className={styles.heading}>
          <span className={styles.title}>{t(K.ACTIVITY_PLAN)}</span>
          <div
            className={styles.toggle}
            onClick={() => {
              setCollapsed((prev) => !prev);
              toggleAutoScroll(false);
            }}
          >
            {t(K.SHOW_PROCESS)}
            <WrappedIcon className={styles.chevron} {...ICON_UP} />
          </div>
        </div>
        <PlanTree plan={task.plan!} level={0} />
      </div>
    </ActivityPlanContext.Provider>
  );
}

interface PlanTreeProps {
  plan: PlanStep[];
  level: number;
}

function PlanTree({ plan, level }: PlanTreeProps) {
  return (
    <ul className={styles.tree}>
      {plan.map((step, index, list) => (
        <PlanStepNode
          key={index}
          step={step}
          level={level}
          isLast={index === list.length - 1}
        />
      ))}
    </ul>
  );
}

export interface PlanStepNodeProps {
  step: PlanStep;
  level: number;
  isLast: boolean;
}

function PlanStepNode({ step, level, isLast }: PlanStepNodeProps) {
  const isFirstLevel = level === 0;
  const { jobMap } = useContext(TaskContext);
  const { collapsed } = useContext(ActivityPlanContext);
  const job = step.jobId ? jobMap?.get(step.jobId) : undefined;
  const { icon, className } = getStateIcon(job?.state, isFirstLevel);
  const hasChildren = false;

  return (
    <li className={isFirstLevel ? styles.root : undefined}>
      {!(isLast && (collapsed || !hasChildren)) && (
        <div
          className={styles.line}
          style={{
            bottom: isLast ? 0 : isFirstLevel ? -12 : -8,
          }}
        />
      )}
      <div className={styles.node}>
        <div className={styles.label}>
          <WrappedIcon
            className={classNames(styles.icon, className)}
            {...icon}
          />
          <span className={styles.name}>{step.name}</span>
        </div>
      </div>
      {!collapsed && job ? <PlanStepDetails stepJob={job} /> : null}
    </li>
  );
}

interface PlanStepDetailsProps {
  stepJob: Job;
}

function PlanStepDetails({ stepJob }: PlanStepDetailsProps) {
  const { tasks, errors, flowMap, activityMap } = useContext(TaskContext);
  const subTask =
    stepJob.type === "subTask"
      ? tasks.find((t) => t.parent === stepJob.id)
      : undefined;
  const taskStream = useConversationStream(
    !!subTask,
    subTask?.state,
    tasks,
    errors,
    flowMap,
    activityMap,
    {
      skipActivitySubTasks: true,
      rootTaskId: subTask?.id,
    }
  );

  const messages = useMemo(() => {
    return subTask
      ? taskStream.messages
      : ([
          {
            role: "assistant",
            chunks: [
              {
                type: "job",
                job: stepJob,
              },
            ],
          },
        ] as MessageFromAssistant[]);
  }, [stepJob, subTask, taskStream.messages]);

  return (
    <div className={styles.details}>
      {messages.map((msg, index) => (
        <div className={styles.message} key={index}>
          {msg.role === "user" ? (
            <div className={styles.user}>{msg.content}</div>
          ) : (
            <div className={styles.assistant}>
              {msg.chunks.map((chunk, idx) => (
                <PlanStepMessageChunk key={idx} chunk={chunk} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface PlanStepMessageChunkProps {
  chunk: MessageChunk;
}

function PlanStepMessageChunk({ chunk }: PlanStepMessageChunkProps) {
  const { setActiveDetail } = useContext(TaskContext);
  const { icon, className } = getStateIcon(
    chunk.type === "job" ? chunk.job.state : undefined
  );

  return (
    <div className={styles.chunk}>
      {chunk.type === "job" ? (
        chunk.job.toolCall ? (
          <div
            className={styles.tool}
            onClick={() => {
              const detail: ActiveDetail = {
                type: "job",
                id: chunk.job.id,
              };
              setActiveDetail((prev) =>
                isEqual(prev, detail) ? prev : detail
              );
            }}
          >
            <WrappedIcon
              className={classNames(styles.icon, className)}
              {...icon}
            />
            {chunk.job.toolCall.annotations?.title || chunk.job.toolCall.name}
          </div>
        ) : (
          chunk.job.messages?.map((m, mIdx) => (
            <Fragment key={mIdx}>
              {m.parts.map((part, pIdx) =>
                part.type === "text" ? (
                  <EnhancedMarkdown
                    key={pIdx}
                    className={sharedStyles["markdown-wrapper"]}
                    content={part.text}
                  />
                ) : null
              )}
            </Fragment>
          ))
        )
      ) : null}
    </div>
  );
}
