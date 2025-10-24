import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import type {
  ConversationState,
  JobState,
  TaskState,
} from "../../shared/interfaces";
import styles from "./NodeChunk.module.css";

export function getStateDisplay(
  state: JobState | TaskState | undefined,
  conversationState: ConversationState | undefined
): {
  className?: string;
  icon: GeneralIconProps;
} {
  switch (state) {
    case "completed":
      return {
        className: styles.completed,
        icon: {
          lib: "antd",
          theme: "filled",
          icon: "check-circle",
        },
      };
    case "submitted":
    case "working":
      if (conversationState === "terminated") {
        return {
          icon: {
            lib: "fa",
            prefix: "far",
            icon: "circle-stop",
          },
        };
      }
      return {
        className: styles.working,
        icon: {
          lib: "antd",
          theme: "outlined",
          icon: "loading-3-quarters",
          spinning: true,
        },
      };
    case "input-required":
      return {
        className: styles["input-required"],
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "circle-user",
        },
      };
    case "failed":
      return {
        className: styles.failed,
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "xmark",
        },
      };
    case "canceled":
    case "terminated" as JobState:
      return {
        className: styles.canceled,
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "circle-stop",
        },
      };
    case "skipped":
      return {
        icon: {
          lib: "fa",
          prefix: "fas",
          icon: "ban",
        },
      };
    default:
      return {
        icon: {
          lib: "fa",
          prefix: "far",
          icon: "clock",
        },
      };
  }
}
