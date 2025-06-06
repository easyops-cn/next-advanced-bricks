import { type TaskState } from "./interfaces.js";

export const DEFAULT_SCALE_RANGE_MIN = 0.5;
export const DEFAULT_SCALE_RANGE_MAX = 2;
export const START_NODE_ID = "<START>";
export const END_NODE_ID = "<END>";
// 20 + 48 + 8 + 26 + 20
export const CANVAS_PADDING_BOTTOM = 122;
export const RANK_SEP = 40;
export const NODE_SEP = 42;
export const EDGE_SEP = 10;

export const DONE_STATES = ["completed", "failed", "canceled"] as TaskState[];

export const GENERAL_DONE_STATES = [...DONE_STATES, "paused"] as TaskState[];
