import type { GeneralIconProps } from "@next-bricks/icons/general-icon";
import type { TaskState } from "../cruise-canvas/interfaces.js";

export const DONE_STATES = ["completed", "failed", "canceled"] as TaskState[];

export const GENERAL_DONE_STATES = [...DONE_STATES, "paused"] as TaskState[];

export const NON_WORKING_STATES = [...GENERAL_DONE_STATES, "input-required"];

export const ICON_CLOSE: GeneralIconProps = {
  lib: "antd",
  icon: "close",
};

export const ICON_LOADING: GeneralIconProps = {
  lib: "antd",
  icon: "loading-3-quarters",
  spinning: true,
};

export const ICON_CANVAS: GeneralIconProps = {
  lib: "antd",
  icon: "partition",
};

export const ICON_CHAT: GeneralIconProps = {
  lib: "antd",
  icon: "message",
};

export const ICON_FEEDBACK: GeneralIconProps = {
  lib: "fa",
  prefix: "far",
  icon: "message",
};
