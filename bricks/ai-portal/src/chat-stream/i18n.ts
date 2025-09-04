import { i18n } from "@next-core/i18n";

export enum K {
  CONFIRMING_PLAN_TIPS = "CONFIRMING_PLAN_TIPS",
  SWITCH_TO_CANVAS = "SWITCH_TO_CANVAS",
}

const en: Locale = {
  CONFIRMING_PLAN_TIPS:
    "According to the request, I have made the following plan:",
  SWITCH_TO_CANVAS: "Switch to canvas",
};

const zh: Locale = {
  CONFIRMING_PLAN_TIPS: "根据需求，我已制定如下计划：",
  SWITCH_TO_CANVAS: "切换为画布",
};

export const NS = "bricks/ai-portal/chat-stream";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
