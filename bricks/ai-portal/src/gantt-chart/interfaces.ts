import type { JobState, TaskState } from "../shared/interfaces.js";

export interface GanttNode {
  name: string;
  state?: TaskState | JobState;
  startTime?: number;
  endTime?: number;
  children?: GanttNode[];
}

export interface Timing {
  start: number;
  end: number;
}
