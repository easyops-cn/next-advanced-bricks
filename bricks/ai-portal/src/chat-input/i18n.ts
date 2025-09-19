import { i18n } from "@next-core/i18n";

export enum K {
  TERMINATE_THE_TASK = "TERMINATE_THE_TASK",
}

const en: Locale = {
  TERMINATE_THE_TASK: "Terminate the task",
};

const zh: Locale = {
  TERMINATE_THE_TASK: "终止任务",
};

export const NS = "bricks/ai-portal/chat-input";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
