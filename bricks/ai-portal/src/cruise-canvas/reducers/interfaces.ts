import type { Job, StepWithState, TaskBaseDetail, TaskPatch } from "../interfaces";

export interface CruiseCanvasState {
  task: TaskBaseDetail | null;
  jobs: Job[];
  plan: StepWithState[];
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
