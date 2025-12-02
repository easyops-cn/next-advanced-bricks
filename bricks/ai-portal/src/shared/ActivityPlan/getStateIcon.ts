import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import type { ConversationState, JobState, TaskState } from "../interfaces";
import styles from "./ActivityPlan.module.css";

export function getStateIcon(
  state: TaskState | JobState | ConversationState | undefined,
  isFirstLevel?: boolean
): { icon: GeneralIconProps; className?: string } {
  let icon: GeneralIconProps;
  let className: string | undefined;
  const preferTheme = isFirstLevel ? "filled" : "outlined";
  switch (state) {
    case "input-required":
      icon = { lib: "antd", theme: preferTheme, icon: "pause-circle" };
      className = styles.paused;
      break;
    case "completed":
      icon = { lib: "antd", theme: preferTheme, icon: "check-circle" };
      className = styles.completed;
      break;
    case "failed":
      icon = { lib: "antd", theme: preferTheme, icon: "close-circle" };
      className = styles.failed;
      break;
    case "terminated":
    case "canceled":
      icon = { lib: "antd", theme: preferTheme, icon: "stop" };
      break;
    case "working":
      icon = { lib: "antd", icon: "loading-3-quarters", spinning: true };
      className = styles.working;
      break;
    default:
      icon = { lib: "antd", theme: preferTheme, icon: "clock-circle" };
      break;
  }
  return { icon, className };
}
