import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import type { ConversationState, JobState, TaskState } from "./interfaces";

export function getFlowOrActivityIcon(
  state: TaskState | JobState | ConversationState | undefined
): GeneralIconProps {
  switch (state) {
    case "input-required":
      return { lib: "antd", theme: "filled", icon: "pause-circle" };
    case "completed":
      return { lib: "antd", theme: "filled", icon: "check-circle" };
    case "failed":
      return { lib: "antd", theme: "filled", icon: "close-circle" };
    case "terminated":
      return { lib: "antd", theme: "filled", icon: "stop" };
    case "working":
      return { lib: "antd", icon: "loading-3-quarters", spinning: true };
    default:
      return { lib: "antd", theme: "filled", icon: "clock-circle" };
  }
}
