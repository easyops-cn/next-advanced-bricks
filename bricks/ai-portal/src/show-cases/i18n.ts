import { i18n } from "@next-core/i18n";

export enum K {
  ALL = "ALL",
  EXPLORE_EXCELLENT_CASES = "EXPLORE_EXCELLENT_CASES",
}

const en: Locale = {
  [K.ALL]: "All",
  [K.EXPLORE_EXCELLENT_CASES]: "Explore excellent cases",
};

const zh: Locale = {
  [K.ALL]: "全部",
  [K.EXPLORE_EXCELLENT_CASES]: "探索优秀案例",
};

export const NS = "bricks/ai-portal/show-cases";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
