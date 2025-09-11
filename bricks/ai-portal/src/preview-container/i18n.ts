import { i18n } from "@next-core/i18n";

export enum K {
  UNTITLED = "UNTITLED",
}

const en: Locale = {
  UNTITLED: "Untitled",
};

const zh: Locale = {
  UNTITLED: "无标题",
};

export const NS = "bricks/ai-portal/preview-container";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
