import { Reducer } from "react";
import type { CruiseCanvasAction, CruiseCanvasState } from "./interfaces";
import { tasks } from "./tasks";
import { conversation } from "./conversation";
import { errors } from "./errors";
import { serviceFlows } from "./serviceFlows";

type ReducersMapObject<S, A> = {
  [K in keyof S]: Reducer<S[K], A>;
};

function combineReducers<S, A>(
  reducers: ReducersMapObject<S, A>
): Reducer<S, A> {
  return ((state, action) =>
    Object.fromEntries(
      Object.entries<Reducer<any, A>>(reducers).map(([key, value]) => [
        key,
        value(state[key as keyof S], action),
      ])
    )) as Reducer<S, A>;
}

export const rootReducer = combineReducers<
  CruiseCanvasState,
  CruiseCanvasAction
>({
  conversation,
  tasks,
  errors,
  serviceFlows,
});
