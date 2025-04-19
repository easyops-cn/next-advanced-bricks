import type { Job, TaskBaseDetail, TaskPatch } from "../interfaces";

export interface CruiseCanvasState {
  task: TaskBaseDetail | null;
  jobs: Job[];
}

export type CruiseCanvasAction = TaskSSEAction | TaskResetAction;

export interface TaskSSEAction {
  type: "sse";
  payload: TaskPatch;
  isInitial?: boolean;
}

export interface TaskResetAction {
  type: "reset";
}
