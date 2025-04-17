import type { Reducer } from "react";
import type { TaskBaseDetail } from "../interfaces";
import type { CruiseCanvasAction } from "./interfaces";
import { isMatch, pick } from "lodash";

export const task: Reducer<TaskBaseDetail | null, CruiseCanvasAction> = (state, action) => {
  switch (action.type) {
    case "sse": {
      const taskPatch = pick(action.payload, [
        "id",
        "requirement",
        "state",
        "plan",
      ]);

      return state && isMatch(state, taskPatch) ? state : {...state, ...taskPatch} as TaskBaseDetail;
    }

    case "reset": {
      return null;
    }
  }
  return state;
};
