import { i18n } from "@next-core/i18n";

export enum K {
  ASK_USER_TIPS = "ASK_USER_TIPS",
}

const en: Locale = {
  [K.ASK_USER_TIPS]:
    "Elevo will continue after the activity 【{{ name }}】 provides additional information.",
};

const zh: Locale = {
  [K.ASK_USER_TIPS]: "Elevo将会在活动【{{ name }}】补充信息后继续执行。",
};

export const NS = "bricks/ai-portal/AskUser";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
