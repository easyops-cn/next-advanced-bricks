import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { initializeI18n } from "@next-core/i18n";
import classNames from "classnames";
import styles from "./FlowApp.module.css";
import { WrappedIcon, WrappedRunningFlow } from "../../../shared/bricks";
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
import floatingStyles from "../../../shared/FloatingButton.module.css";

initializeI18n(NS, locales);

const ActivityDetail = forwardRef(LegacyActivityDetail);

export interface FlowAppProps {
  flow: ServiceFlowRun;
  activity?: ActivityRun;
}

export function FlowApp({ flow, activity }: FlowAppProps) {
  const { tasks } = useContext(TaskContext);
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

  const activities = useMemo(
    () =>
      runningSpec.flatMap(
        (s) => s.serviceFlowActivities?.filter((act) => act.taskId) || []
      ),
    [runningSpec]
  );

  const flowStatus = useMemo(
    () => getFlowStatusDisplay(flowTask.state),
    [flowTask.state]
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContentRef = useRef<HTMLDivElement>(null);

  const { scrollable, scrollToBottom, toggleAutoScroll } = useAutoScroll(
    true,
    scrollContainerRef,
    scrollContentRef
  );

  const activitiesRef = useRef<Map<string, ActivityDetailRef | null>>(
    new Map()
  );

  useEffect(() => {
    if (activity?.taskId) {
      const activityDetail = activitiesRef.current.get(activity.taskId);
      if (activityDetail) {
        activityDetail.scrollIntoView();
        toggleAutoScroll(false);
      }
    }
  }, [activity, toggleAutoScroll]);

  return (
    <>
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
            onActivityClick={(e) => {
              const activityDetail = activitiesRef.current.get(e.detail);
              if (activityDetail) {
                activityDetail.scrollIntoView();
                toggleAutoScroll(false);
              }
            }}
          />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.chat} ref={scrollContainerRef}>
          <div className={styles.messages} ref={scrollContentRef}>
            {activities.map((act) => (
              <ActivityDetail
                key={act.taskId}
                activity={act}
                ref={(r) => {
                  activitiesRef.current.set(act.taskId!, r);
                }}
              />
            ))}
          </div>
        </div>
        <button
          className={`${scrollStyles["scroll-down"]} ${floatingStyles["floating-button"]}`}
          style={{ bottom: "30px" }}
          hidden={!scrollable}
          onClick={scrollToBottom}
        >
          <WrappedIcon lib="antd" icon="down" />
        </button>
      </div>
    </>
  );
}

interface ActivityDetailRef {
  scrollIntoView: () => void;
}

interface ActivityDetailProps {
  activity: ActivityRun;
}

function LegacyActivityDetail(
  { activity }: ActivityDetailProps,
  ref: React.Ref<ActivityDetailRef>
) {
  const activityRef = useRef<HTMLDivElement>(null);
  const { tasks, errors } = useContext(TaskContext);
  const activityTask = useMemo(() => {
    return tasks.find((t) => t.id === activity.taskId)!;
  }, [tasks, activity.taskId]);

  const { messages } = useConversationStream(
    true,
    activityTask.state,
    tasks,
    errors,
    {
      rootTaskId: activity.taskId,
      expandAskUser: true,
    }
  );

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      activityRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    },
  }));

  return (
    <div className={styles.activity} ref={activityRef}>
      {messages.map((msg, index, list) => (
        <div className={styles.message} key={index}>
          {msg.role === "user" ? (
            <UserMessage
              content={msg.content}
              mentionedAiEmployeeId={msg.mentionedAiEmployeeId}
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
