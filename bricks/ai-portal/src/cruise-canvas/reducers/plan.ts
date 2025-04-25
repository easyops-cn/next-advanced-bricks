import type { Reducer } from "react";
import type { CruiseCanvasAction } from "./interfaces";
import type { JobState, StepWithState } from "../interfaces";

export const plan: Reducer<StepWithState[], CruiseCanvasAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "sse": {
      const { plan: steps, jobs } = action.payload;

      const stateMap = new Map<string, JobState | undefined>(
        state.map((step) => [step.id, step.state])
      );

      for (const job of jobs ?? []) {
        if (job.state) {
          if ((job as any).state === "blocked") {
            job.state = "working";
          }
          stateMap.set(job.id, job.state);
        }
      }

      const plan: StepWithState[] = (steps ?? state).map((step) => ({
        id: step.id,
        instruction: step.instruction,
        state: stateMap.get(step.id),
      }));

      return plan;
    }

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};
