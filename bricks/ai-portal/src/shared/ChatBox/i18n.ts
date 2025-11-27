import { i18n } from "@next-core/i18n";

export enum K {
  SEND_MESSAGE = "SEND_MESSAGE",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE = "CONFIRM_TO_TERMINATE_THE_TASK_TITLE",
  CONFIRM_TO_TERMINATE_THE_TASK_DESCRIPTION = "CONFIRM_TO_TERMINATE_THE_TASK_DESCRIPTION",
  TERMINATE_THE_TASK = "TERMINATE_THE_TASK",
}

const en: Locale = {
  SEND_MESSAGE: "Send message",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE: "Are you sure to terminate the task?",
  CONFIRM_TO_TERMINATE_THE_TASK_DESCRIPTION:
    "After terminating the task, Elevo will no longer proceed with your request. Please confirm.",
  TERMINATE_THE_TASK: "Terminate the task",
};

const zh: Locale = {
  SEND_MESSAGE: "发送消息",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE: "确定终止任务吗？",
  CONFIRM_TO_TERMINATE_THE_TASK_DESCRIPTION:
    "终止任务后 Elevo 将不会继续执行您的请求，请确认。",
  TERMINATE_THE_TASK: "终止任务",
};

export const NS = "bricks/ai-portal/ChatBox";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
