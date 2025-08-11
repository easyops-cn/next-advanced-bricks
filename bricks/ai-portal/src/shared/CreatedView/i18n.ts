import { i18n } from "@next-core/i18n";

export enum K {
  FULLSCREEN = "FULLSCREEN",
}

const en: Locale = {
  FULLSCREEN: "Fullscreen",
};

const zh: Locale = {
  FULLSCREEN: "全屏",
};

export const NS = "bricks/ai-portal/CreatedView";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
