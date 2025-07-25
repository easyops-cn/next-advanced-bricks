import { i18n } from "@next-core/i18n";

export enum K {
  ALL = "ALL",
}

const en: Locale = {
  [K.ALL]: "All",
};

const zh: Locale = {
  [K.ALL]: "全部",
};

export const NS = "bricks/ai-portal/show-cases";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
