import type { Reducer } from "react";
import { isMatch, pick } from "lodash";
import type { CruiseCanvasAction } from "./interfaces";
import type { ConversationBaseDetail } from "../../shared/interfaces";

export const conversation: Reducer<
  ConversationBaseDetail | null,
  CruiseCanvasAction
> = (state, action) => {
  switch (action.type) {
    case "sse": {
      const patch = pick(action.payload, [
        "id",
        "state",
        "title",
        "startTime",
        "endTime",
      ]);

      return (
        state && isMatch(state, patch) ? state : { ...state, ...patch }
      ) as ConversationBaseDetail;
    }

    case "reset": {
      return null;
    }
  }
  return state;
};
