import { i18n } from "@next-core/i18n";

export enum K {
  WATCH_REPLAY = "WATCH_REPLAY",
}

const en: Locale = {
  [K.WATCH_REPLAY]: "Watch replay",
};

const zh: Locale = {
  [K.WATCH_REPLAY]: "查看回放",
};

export const NS = "bricks/ai-portal/show-case";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
