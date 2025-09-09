import type {
  ConversationBaseDetail,
  ConversationPatch,
  Task,
} from "../../shared/interfaces";

export interface CruiseCanvasState {
  conversation: ConversationBaseDetail | null;
  tasks: Task[];
  error: string | null;
}

export type CruiseCanvasAction =
  | ConversationSSEAction
  | ConversationResetAction;

export interface ConversationSSEAction {
  type: "sse";
  payload: ConversationPatch;
  workspace: string;
}

export interface ConversationResetAction {
  type: "reset";
}
