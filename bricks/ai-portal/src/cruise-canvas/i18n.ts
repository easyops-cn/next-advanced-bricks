import { i18n } from "@next-core/i18n";

export enum K {
  CONFIRM = "CONFIRM",
  CANCEL = "CANCEL",
}

const en: Locale = {
  CONFIRM: "Confirm",
  CANCEL: "Cancel",
};

const zh: Locale = {
  CONFIRM: "确认",
  CANCEL: "取消",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
