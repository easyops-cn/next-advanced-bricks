import React, {
  createContext,
  Fragment,
  useContext,
  useMemo,
  useRef,
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
import type {
  MessageChunk,
  MessageFromAssistant,
} from "../../chat-stream/interfaces";
import { EnhancedMarkdown } from "../../cruise-canvas/EnhancedMarkdown/EnhancedMarkdown";
import sharedStyles from "../../cruise-canvas/shared.module.css";
import { StreamContext } from "../../chat-stream/StreamContext";
import { AskUserTag } from "../AskUserTag/AskUserTag";
import { PlanStateIcon } from "./PlanStateIcon";

initializeI18n(NS, locales);

export interface ActivityPlanProps {
  task: Task;
}

const ActivityPlanContext = createContext<{
  collapsed?: boolean;
}>({});

export function ActivityPlan({ task }: ActivityPlanProps) {
  const [collapsed, setCollapsed] = useState(true);
  const { flowMap, setActiveDetail } = useContext(TaskContext);
  const { toggleAutoScroll } = useContext(StreamContext);
  const flow = flowMap?.get(task.id);
  const toggleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (
    <ActivityPlanContext.Provider value={{ collapsed }}>
      <div
        className={classNames(styles.plan, { [styles.collapsed]: collapsed })}
      >
        <div className={styles.heading}>
          {flow ? (
            <span
              className={styles["flow-title"]}
              onClick={() => {
                const detail = {
                  type: "flow" as const,
                  id: task.id,
                };
                setActiveDetail((prev) =>
                  isEqual(prev, detail) ? prev : detail
                );
              }}
            >
              <WrappedIcon lib="lucide" icon="route" />
              {t(K.STARTING_SERVICE_FLOW, { name: flow.name })}
            </span>
          ) : (
            <span>{t(K.ACTIVITY_PLAN)}</span>
          )}
          <div
            className={styles.toggle}
            onClick={() => {
              setCollapsed((prev) => !prev);
              toggleAutoScroll(false);
              if (toggleRef.current) {
                clearTimeout(toggleRef.current);
              }
              toggleRef.current = setTimeout(() => {
                toggleAutoScroll(true);
              }, 100);
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
          <PlanStateIcon state={job?.state} filled={isFirstLevel} />
          <span className={styles.name}>{step.name}</span>
        </div>
      </div>
      {!collapsed && job ? (
        <PlanStepDetails stepJob={job} level={level} />
      ) : null}
    </li>
  );
}

interface PlanStepDetailsProps {
  stepJob: Job;
  level: number;
}

function PlanStepDetails({ stepJob, level }: PlanStepDetailsProps) {
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
    {
      flowMap,
      activityMap,
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
            <MergedPlanStepMessageChunks chunks={msg.chunks} level={level} />
          )}
        </div>
      ))}
    </div>
  );
}

interface MergedPlanStepMessageChunksProps {
  chunks: MessageChunk[];
  level: number;
}

type StepMessageChunk =
  | MessageChunk
  | {
      type: "tools";
      jobs: Job[];
    };

function MergedPlanStepMessageChunks({
  chunks,
  level,
}: MergedPlanStepMessageChunksProps) {
  const stepChunks = useMemo(() => {
    const mergedChunks: StepMessageChunk[] = [];
    for (const chunk of chunks) {
      if (chunk.type === "job" && chunk.job.toolCall) {
        const lastChunk = mergedChunks[mergedChunks.length - 1];
        if (lastChunk && lastChunk.type === "tools") {
          lastChunk.jobs.push(chunk.job);
        } else {
          mergedChunks.push({
            type: "tools",
            jobs: [chunk.job],
          });
        }
      } else {
        mergedChunks.push(chunk);
      }
    }
    return mergedChunks;
  }, [chunks]);

  return (
    <div className={styles.assistant}>
      {stepChunks.map((chunk, idx) => (
        <PlanStepMessageChunk key={idx} chunk={chunk} level={level} />
      ))}
    </div>
  );
}

interface PlanStepMessageChunkProps {
  chunk: StepMessageChunk;
  level: number;
}

function PlanStepMessageChunk({ chunk, level }: PlanStepMessageChunkProps) {
  const { setActiveDetail } = useContext(TaskContext);

  return (
    <div className={styles.chunk}>
      {chunk.type === "tools" ? (
        <div className={styles.tools}>
          {chunk.jobs.map((job) => (
            <div
              key={job.id}
              className={styles.tool}
              onClick={() => {
                const detail: ActiveDetail = {
                  type: "job",
                  id: job.id,
                };
                setActiveDetail((prev) =>
                  isEqual(prev, detail) ? prev : detail
                );
              }}
            >
              <PlanStateIcon state={job.state} />
              {job.toolCall!.annotations?.title || job.toolCall!.name}
            </div>
          ))}
        </div>
      ) : chunk.type === "job" ? (
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
      ) : chunk.type === "plan" ? (
        <PlanTree plan={chunk.task.plan!} level={level + 1} />
      ) : chunk.type === "askUser" ? (
        <AskUserTag job={chunk.job} task={chunk.task} />
      ) : null}
    </div>
  );
}
