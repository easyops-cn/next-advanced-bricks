import React, { createContext, useContext, useState } from "react";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import type { PlanStep, Task } from "../interfaces";
import styles from "./ActivityPlan.module.css";
import { K, locales, NS, t } from "./i18n";
import { WrappedIcon } from "../bricks";
import { ICON_UP } from "../constants";
import { TaskContext } from "../TaskContext";
import { useConversationStream } from "../../chat-stream/useConversationStream";
import { getStateIcon } from "./getStateIcon";

initializeI18n(NS, locales);

export interface ActivityPlanProps {
  task: Task;
}

const ActivityPlanContext = createContext<{
  collapsed?: boolean;
}>({});

export function ActivityPlan({ task }: ActivityPlanProps) {
  const [collapsed, setCollapsed] = useState(true);

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
  const { tasks, jobMap, errors, flowMap, activityMap } =
    useContext(TaskContext);
  const { collapsed } = useContext(ActivityPlanContext);
  const job = step.jobId ? jobMap?.get(step.jobId) : undefined;
  const subTask =
    job?.type === "subTask"
      ? tasks.find((t) => t.parent === job.id)
      : undefined;
  const { messages } = useConversationStream(
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
      {!collapsed && (
        <>
          {messages.map((msg, index) => (
            <div className={styles.message} key={index}>
              {msg.role === "user" ? (
                <div className={styles.user}>{msg.content}</div>
              ) : (
                <div className={styles.assistant}>
                  {msg.chunks.map((chunk, idx) => (
                    <div key={idx}>
                      {chunk.type === "job" && chunk.job.messages
                        ? chunk.job.messages.map((m, mIdx) => (
                            <div key={mIdx}>
                              {m.parts.map((part) =>
                                part.type === "text" ? part.text : null
                              )}
                            </div>
                          ))
                        : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </li>
  );
}
