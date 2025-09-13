import { i18n } from "@next-core/i18n";

export enum K {
  FULLSCREEN = "FULLSCREEN",
  FEEDBACK = "FEEDBACK",
  OPEN_PREVIEW = "OPEN_PREVIEW",
}

const en: Locale = {
  FULLSCREEN: "Fullscreen",
  FEEDBACK: "Feedback",
  OPEN_PREVIEW: "Open preview",
};

const zh: Locale = {
  FULLSCREEN: "全屏",
  FEEDBACK: "反馈",
  OPEN_PREVIEW: "打开预览",
};

export const NS = "bricks/ai-portal/CreatedView";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
