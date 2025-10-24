import React, { useEffect, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import {
  GeneralIcon,
  type GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import styleText from "./styles.shadow.css";
import type { JobState, TaskState } from "../shared/interfaces.js";
import StageIcon from "./images/stage.svg";
import classNames from "classnames";
import { getFlowOrActivityIcon } from "../shared/getFlowOrActivityIcon";
import { formatDuration } from "./formatDuration";

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const { defineElement, property, event } = createDecorators();

export interface RunningFlowProps {
  spec?: FlowStage[];
  activeActivityId?: string | null;
}

export interface FlowStage {
  name: string;
  serviceFlowActivities?: FlowActivity[];
}

export interface FlowActivity {
  name: string;
  taskId?: string;
  state?: TaskState | JobState;
  startTime?: number;
  endTime?: number;
}

export interface RunningFlowEvents {
  "active.change": CustomEvent<string | null>;
}

export interface RunningFlowMapEvents {
  onActiveChange: "active.change";
}

/**
 * 构件 `ai-portal.running-flow`
 */
export
@defineElement("ai-portal.running-flow", {
  styleTexts: [styleText],
})
class RunningFlow extends ReactNextElement implements RunningFlowProps {
  @property({ attribute: false })
  accessor spec: FlowStage[] | undefined;

  @property()
  accessor activeActivityId: string | null | undefined;

  @event({ type: "active.change" })
  accessor #activeChange!: EventEmitter<string | null>;

  #handleActiveChange = (activityId: string | null) => {
    this.#activeChange?.emit(activityId);
  };

  render() {
    return (
      <RunningFlowComponent
        spec={this.spec}
        activeActivityId={this.activeActivityId}
        onActiveChange={this.#handleActiveChange}
      />
    );
  }
}

interface RunningFlowComponentProps extends RunningFlowProps {
  onActiveChange: (activityId: string | null) => void;
}

function RunningFlowComponent({
  spec: stages,
  activeActivityId,
  onActiveChange,
}: RunningFlowComponentProps) {
  const [activeId, setActiveId] = useState(activeActivityId || null);

  useEffect(() => {
    setActiveId(activeActivityId || null);
  }, [activeActivityId]);

  return (
    <div className="container">
      <ul className="nav">
        {stages?.map((stage, index) => (
          <li key={index} className="nav-item">
            <div className="nav-content">
              <span className="icon">
                <StageIcon />
              </span>
              <div className="title">{stage.name}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="lanes">
        {stages?.map((stage, index) => (
          <ul className="lane" key={index}>
            {stage.serviceFlowActivities?.map((activity, activityIndex) => (
              <li key={activityIndex}>
                <div
                  className={classNames(
                    "activity",
                    getActivityStateClassName(activity.state),
                    {
                      active: activeId && activity.taskId === activeId,
                    }
                  )}
                  onClick={() => {
                    if (activity.taskId && activeId !== activity.taskId) {
                      setActiveId(activity.taskId);
                      onActiveChange(activity.taskId);
                    }
                  }}
                >
                  <WrappedIcon
                    {...getFlowOrActivityIcon(activity.state)}
                    className="icon"
                  />
                  <div className="title">{activity.name}</div>
                  {activity.startTime != null && activity.endTime != null && (
                    <Duration
                      startTime={activity.startTime}
                      endTime={activity.endTime}
                      state={activity.state}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

function getActivityStateClassName(state: TaskState | JobState | undefined) {
  switch (state) {
    case "input-required":
      return "paused";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "working":
      return "working";
    default:
      return "default";
  }
}

interface DurationProps {
  startTime: number | undefined;
  endTime: number | undefined;
  state: TaskState | JobState | undefined;
}

function Duration({ startTime, endTime, state }: DurationProps) {
  const [end, setEnd] = useState(endTime);
  const countTime = startTime != null && endTime == null && state === "working";

  useEffect(() => {
    if (endTime != null) {
      setEnd(endTime);
    }
  }, [endTime]);

  useEffect(() => {
    if (countTime) {
      const setEndTime = () => {
        setEnd(Date.now() / 1e3);
      };
      setEndTime();
      const interval = setInterval(setEndTime, 1e3);
      return () => clearInterval(interval);
    }
  }, [countTime]);

  if (startTime == null || end == null) {
    return null;
  }

  return <div className="duration">{formatDuration(end - startTime)}</div>;
}
