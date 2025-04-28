import type { Reducer } from "react";
import { isEqual, isMatchWith, pick } from "lodash";
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
        "startTime",
        "endTime",
        "plan",
      ]);

      // TODO(): remove temp work around.
      // if (!taskPatch.requirement) {
      //   delete taskPatch.requirement;
      // }
      // if (!taskPatch.state) {
      //   delete taskPatch.state;
      // }

      if ((taskPatch as any).state === "blocked") {
        taskPatch.state = "working";
      }

      return (
        action.isInitial
          ? taskPatch
          : state && isMatchWith(state, taskPatch, isEqual)
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
