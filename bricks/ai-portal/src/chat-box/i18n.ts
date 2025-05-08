import { i18n } from "@next-core/i18n";

export enum K {
  ASK_ANY_THING = "ASK_ANYTHING",
  COMMON_TASKS = "COMMON_TASKS",
}

const en: Locale = {
  [K.ASK_ANY_THING]: "Ask anything",
  [K.COMMON_TASKS]: "Common tasks",
};

const zh: Locale = {
  [K.ASK_ANY_THING]: "询问任何问题",
  [K.COMMON_TASKS]: "常用任务",
};

export const NS = "bricks/ai-portal/chat-box";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
