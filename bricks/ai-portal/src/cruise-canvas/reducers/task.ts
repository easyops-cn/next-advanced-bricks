import type { Reducer } from "react";
import { isMatch, pick } from "lodash";
import type { TaskBaseDetail } from "../interfaces";
import type { CruiseCanvasAction } from "./interfaces";

export const task: Reducer<TaskBaseDetail | null, CruiseCanvasAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "sse": {
      const taskPatch = pick(action.payload, [
        "id",
        "requirement",
        "state",
      ]);

      // TODO(): remove temp work around.
      if (!taskPatch.requirement) {
        delete taskPatch.requirement;
      }
      if (!taskPatch.state) {
        delete taskPatch.state;
      }

      return (
        action.isInitial
          ? taskPatch
          : state && isMatch(state, taskPatch)
            ? state
            : { ...state, ...taskPatch }
      ) as TaskBaseDetail;
    }

    case "reset": {
      return null;
    }
  }
  return state;
};
