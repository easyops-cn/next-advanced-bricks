import { i18n } from "@next-core/i18n";

export enum K {
  TODAY = "TODAY",
  YESTERDAY = "YESTERDAY",
  PREVIOUS_7_DAYS = "PREVIOUS_7_DAYS",
  PREVIOUS_30_DAYS = "PREVIOUS_30_DAYS",
}

const en: Locale = {
  [K.TODAY]: "Today",
  [K.YESTERDAY]: "Yesterday",
  [K.PREVIOUS_7_DAYS]: "Previous 7 days",
  [K.PREVIOUS_30_DAYS]: "Previous 30 days",
};

const zh: Locale = {
  [K.TODAY]: "今天",
  [K.YESTERDAY]: "昨天",
  [K.PREVIOUS_7_DAYS]: "过去7天",
  [K.PREVIOUS_30_DAYS]: "过去30天",
};

export const NS = "bricks/ai-portal/chat-history";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
