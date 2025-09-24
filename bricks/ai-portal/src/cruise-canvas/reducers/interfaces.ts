import type {
  ConversationBaseDetail,
  ConversationPatch,
  ConversationError,
  Task,
} from "../../shared/interfaces";

export interface CruiseCanvasState {
  conversation: ConversationBaseDetail | null;
  tasks: Task[];
  errors: ConversationError[];
}

export type CruiseCanvasAction =
  | ConversationSSEAction
  | ConversationResetAction
  | ConversationFinishedAction;

export interface ConversationSSEAction {
  type: "sse";
  payload: ConversationPatch;
  workspace: string;
}

export interface ConversationResetAction {
  type: "reset";
}

export interface ConversationFinishedAction {
  type: "finished";
}
