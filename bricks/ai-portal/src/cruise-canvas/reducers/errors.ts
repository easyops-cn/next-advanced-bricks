import type { Reducer } from "react";
import type { CruiseCanvasAction } from "./interfaces";
import type { ConversationError } from "../../shared/interfaces";

export const errors: Reducer<ConversationError[], CruiseCanvasAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "sse": {
      const { error, tasks } = action.payload;
      const lastError = state[state.length - 1];

      if (typeof error === "string" && error) {
        if (lastError) {
          return state.slice(0, -1).concat(
            {
              ...lastError,
              error,
            },
            { jobs: [] }
          );
        }
        return [{ jobs: [], error }, { jobs: [] }];
      }

      const previousJobs = new Set(state.flatMap((e) => Array.from(e.jobs)));
      const jobs = new Set<string>();
      for (const task of tasks ?? []) {
        for (const job of task.jobs ?? []) {
          if (!previousJobs.has(job.id)) {
            jobs.add(job.id);
          }
        }
      }

      const newJobs = Array.from(jobs);

      if (newJobs.length === 0) {
        return state;
      }

      if (lastError) {
        return state.slice(0, -1).concat({
          ...lastError,
          jobs: [...lastError.jobs, ...newJobs],
        });
      }

      return [{ jobs: newJobs }];
    }

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};
