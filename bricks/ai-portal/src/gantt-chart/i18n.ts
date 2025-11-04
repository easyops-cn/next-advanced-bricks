import { i18n } from "@next-core/i18n";

export enum K {
  FULLSCREEN = "FULLSCREEN",
  COLLAPSE = "COLLAPSE",
  EXPAND = "EXPAND",
}

const en: Locale = {
  FULLSCREEN: "Fullscreen",
  COLLAPSE: "Collapse",
  EXPAND: "Expand",
};

const zh: Locale = {
  FULLSCREEN: "放大",
  COLLAPSE: "折叠",
  EXPAND: "展开",
};

export const NS = "bricks/ai-portal/gantt-chart";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
