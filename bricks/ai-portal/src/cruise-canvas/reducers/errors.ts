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

      let taskId: string | undefined;
      if (tasks?.length) {
        taskId = tasks[tasks.length - 1].id;
      } else {
        taskId = lastError?.taskId;
      }

      if (typeof error === "string" && error) {
        if (lastError) {
          return state.slice(0, -1).concat(
            {
              taskId,
              error,
            },
            { taskId }
          );
        }
      }

      if (lastError) {
        if (lastError.error) {
          return state.concat({ taskId });
        }
        if (lastError.taskId !== taskId) {
          return state.slice(0, -1).concat({ taskId });
        }
        return state;
      }

      return taskId ? [{ taskId }] : state;
    }

    case "reset": {
      return state.length === 0 ? state : [];
    }
  }

  return state;
};
