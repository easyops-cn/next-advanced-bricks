import { JobState } from "./interfaces.js";

export const DEFAULT_SCALE_RANGE_MIN = 0.5;
export const DEFAULT_SCALE_RANGE_MAX = 2;
export const START_NODE_ID = "<START>";
export const END_NODE_ID = "<END>";
export const CANVAS_PADDING_BOTTOM = 96;

export const DONE_STATES = ["completed", "failed", "canceled"] as JobState[];
