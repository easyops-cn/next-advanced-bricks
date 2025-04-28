import type { Reducer } from "react";
import type { CruiseCanvasAction } from "./interfaces";

export const error: Reducer<string | null, CruiseCanvasAction> = (
  state,
  action
) => {
  switch (action.type) {
    case "sse": {
      const error = action.payload.error;
      return state === null && typeof error === "string" ? error : state;
    }

    case "reset": {
      return null;
    }
  }

  return state;
};
