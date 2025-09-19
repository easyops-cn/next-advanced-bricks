import { i18n } from "@next-core/i18n";

export enum K {
  SEND_MESSAGE = "SEND_MESSAGE",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE = "CONFIRM_TO_TERMINATE_THE_TASK_TITLE",
}

const en: Locale = {
  SEND_MESSAGE: "Send message",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE: "Are you sure to terminate the task?",
};

const zh: Locale = {
  SEND_MESSAGE: "发送消息",
  CONFIRM_TO_TERMINATE_THE_TASK_TITLE: "确定终止任务吗？",
};

export const NS = "bricks/ai-portal/ChatBox";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
