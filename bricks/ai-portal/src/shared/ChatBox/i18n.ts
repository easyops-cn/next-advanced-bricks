import { i18n } from "@next-core/i18n";

export enum K {
  PAUSE_THE_TASK = "PAUSE_THE_TASK",
  RESUME_THE_TASK = "RESUME_THE_TASK",
  CANCEL_THE_TASK = "CANCEL_THE_TASK",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE = "CONFIRM_TO_TERMINATE_THE_TASK_TITLE",
  CONFIRM_TO_TERMINATE_THE_TASK_CONTENT = "CONFIRM_TO_TERMINATE_THE_TASK_CONTENT",
  SEND_MESSAGE = "SEND_MESSAGE",
}

const en: Locale = {
  PAUSE_THE_TASK: "Pause the task",
  RESUME_THE_TASK: "Resume the task",
  CANCEL_THE_TASK: "Cancel the task",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE: "Are you sure to cancel the task?",
  CONFIRM_TO_TERMINATE_THE_TASK_CONTENT:
    "The task can not be resumed after been canceled.",
  SEND_MESSAGE: "Send message",
};

const zh: Locale = {
  PAUSE_THE_TASK: "暂停任务",
  RESUME_THE_TASK: "恢复任务",
  CANCEL_THE_TASK: "取消任务",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE: "确定取消任务吗？",
  CONFIRM_TO_TERMINATE_THE_TASK_CONTENT: "任务取消后将无法再恢复运行。",
  SEND_MESSAGE: "发送消息",
};

export const NS = "bricks/ai-portal/ChatBox";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
