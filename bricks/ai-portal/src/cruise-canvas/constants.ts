import { JobState } from "./interfaces.js";

export const DEFAULT_SCALE_RANGE_MIN = 0.5;
export const DEFAULT_SCALE_RANGE_MAX = 2;
export const START_NODE_ID = "<START>";
export const END_NODE_ID = "<END>";
export const CANVAS_PADDING_BOTTOM = 96;
export const RANK_SEP = 40;
export const NODE_SEP = 42;
export const EDGE_SEP = 10;

export const DONE_STATES = ["completed", "failed", "canceled"] as JobState[];
