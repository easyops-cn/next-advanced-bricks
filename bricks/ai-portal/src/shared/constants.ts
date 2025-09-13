import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import type { TaskState as LegacyTaskState } from "../cruise-canvas/interfaces.js";
import type { ConversationState, TaskState } from "./interfaces.js";

export const DONE_STATES = [
  "completed",
  "failed",
  "canceled",
  "terminated",
] as (ConversationState | TaskState | LegacyTaskState | undefined)[];

export const GENERAL_DONE_STATES = [...DONE_STATES, "paused"] as (
  | ConversationState
  | TaskState
  | LegacyTaskState
  | undefined
)[];

export const NON_WORKING_STATES = [...GENERAL_DONE_STATES, "input-required"];

export const ICON_CLOSE: GeneralIconProps = {
  lib: "lucide",
  icon: "x",
};

export const ICON_LOADING: GeneralIconProps = {
  lib: "antd",
  icon: "loading-3-quarters",
  spinning: true,
};

export const ICON_CANVAS: GeneralIconProps = {
  lib: "lucide",
  icon: "network",
} as GeneralIconProps;

export const ICON_CHAT: GeneralIconProps = {
  lib: "lucide",
  icon: "messages-square",
} as GeneralIconProps;

export const ICON_FEEDBACK: GeneralIconProps = {
  lib: "lucide",
  icon: "message-square",
};

export const ICON_EXTERNAL_LINK: GeneralIconProps = {
  lib: "lucide",
  icon: "external-link",
};
