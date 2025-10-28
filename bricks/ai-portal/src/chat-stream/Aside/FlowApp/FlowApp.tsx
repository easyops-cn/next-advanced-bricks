import React, { useContext, useMemo, useRef } from "react";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import styles from "./FlowApp.module.css";
import {
  WrappedBlankState,
  WrappedIcon,
  WrappedRunningFlow,
} from "../../../shared/bricks";
import { getFlowOrActivityIcon } from "../../../shared/getFlowOrActivityIcon";
import type {
  ActivityRun,
  ConversationState,
  JobState,
  ServiceFlowRun,
  TaskState,
} from "../../../shared/interfaces";
import { TaskContext } from "../../../shared/TaskContext";
import { K, locales, NS, t } from "./i18n";
import { useConversationStream } from "../../useConversationStream";
import { UserMessage } from "../../UserMessage/UserMessage";
import { AssistantMessage } from "../../AssistantMessage/AssistantMessage";
import { useAutoScroll } from "../../useAutoScroll";
import scrollStyles from "../../ScrollDownButton.module.css";

initializeI18n(NS, locales);

export interface FlowAppProps {
  flow: ServiceFlowRun;
  activity?: ActivityRun;
}

export function FlowApp({ flow, activity }: FlowAppProps) {
  const { tasks, setActiveDetail } = useContext(TaskContext);
  const flowTask = useMemo(() => {
    return tasks.find((t) => t.id === flow.taskId)!;
  }, [tasks, flow.taskId]);

  const runningSpec = useMemo(() => {
    return flow.spec.map((stage) => ({
      ...stage,
      serviceFlowActivities: stage.serviceFlowActivities?.map((activity) => {
        const task = tasks.find((t) => t.id === activity.taskId);
        return {
          name: activity.name,
          taskId: activity.taskId,
          state: task?.state,
          startTime: task?.startTime,
          endTime: task?.endTime,
        };
      }),
    }));
  }, [flow.spec, tasks]);

  const flowStatus = useMemo(
    () => getFlowStatusDisplay(flowTask.state),
    [flowTask.state]
  );

  return (
    <div className={styles.app}>
      <div className={styles.heading}>
        <div className={styles.header}>
          <div className={classNames(styles.status, flowStatus.className)}>
            <WrappedIcon {...flowStatus.icon} />
            {flowStatus.text}
          </div>
          <div className={styles.title}>
            {`${flow.space?.name ? `${flow.space.name} / ` : ""}${flow.name}`}
          </div>
        </div>
        <div className={styles.chart}>
          <WrappedRunningFlow
            spec={runningSpec}
            activeActivityId={activity?.taskId}
            onActiveChange={(e) => {
              if (e.detail) {
                setActiveDetail({ type: "activity", id: e.detail });
              }
            }}
          />
        </div>
      </div>
      <div className={styles.body}>
        {activity ? (
          <ActivityDetail activity={activity} />
        ) : (
          <WrappedBlankState
            className={styles.blank}
            description="您还未选择活动"
            illustration="serviceflows"
          />
        )}
      </div>
    </div>
  );
}

interface ActivityDetailProps {
  activity: ActivityRun;
}

function ActivityDetail({ activity }: ActivityDetailProps) {
  const { tasks, errors } = useContext(TaskContext);
  const activityTask = useMemo(() => {
    return tasks.find((t) => t.id === activity.taskId)!;
  }, [tasks, activity.taskId]);
  const activityState = activityTask.state;

  const { icon, className } = useMemo(
    () => getFlowStatusDisplay(activityState),
    [activityState]
  );

  const fixedTasks = useMemo(() => {
    return [
      {
        ...activityTask,
        parent: undefined,
      },
    ];
  }, [activityTask]);

  const { messages } = useConversationStream(true, fixedTasks, errors);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const { scrollable, scrollToBottom } = useAutoScroll(
    true,
    scrollContainerRef,
    scrollContentRef
  );

  return (
    <>
      <div className={styles["activity-title"]}>
        <WrappedIcon {...icon} className={className} />
        {activity.name}
      </div>
      <div className={styles.chat} ref={scrollContainerRef}>
        <div className={styles.messages} ref={scrollContentRef}>
          {messages.map((msg, index, list) => (
            <div className={styles.message} key={index}>
              {msg.role === "user" ? (
                <UserMessage
                  content={msg.content}
                  cmd={msg.cmd}
                  files={msg.files}
                />
              ) : (
                <AssistantMessage
                  chunks={msg.chunks}
                  scopeState={activityTask.state}
                  isLatest={index === list.length - 1}
                  isSubTask
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div
        className={scrollStyles["scroll-down"]}
        style={{ bottom: "30px" }}
        hidden={!scrollable}
        onClick={scrollToBottom}
      >
        <WrappedIcon lib="antd" icon="down" />
      </div>
    </>
  );
}

function getFlowStatusDisplay(state: TaskState | JobState | ConversationState) {
  const icon = getFlowOrActivityIcon(state);
  let text: string;
  let className: string | undefined;

  switch (state) {
    case "working":
      text = t(K.EXECUTING);
      className = styles.working;
      break;
    case "completed":
      text = t(K.SUCCEEDED);
      className = styles.completed;
      break;
    case "failed":
      text = t(K.FAILED);
      className = styles.failed;
      break;
    case "input-required":
      text = t(K.PAUSED);
      className = styles.paused;
      break;
    case "terminated":
      text = t(K.TERMINATED);
      break;
    default:
      text = state ? t(K.EXECUTING) : t(K.WAITING);
  }

  return { icon, text, className };
}
