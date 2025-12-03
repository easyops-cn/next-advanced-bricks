import { i18n } from "@next-core/i18n";

export enum K {
  ACTIVITY_PLAN = "ACTIVITY_PLAN",
  SHOW_PROCESS = "SHOW_PROCESS",
  STARTING_SERVICE_FLOW = "STARTING_SERVICE_FLOW",
}

const en: Locale = {
  [K.ACTIVITY_PLAN]: "Activity plan",
  [K.SHOW_PROCESS]: "Show process",
  [K.STARTING_SERVICE_FLOW]: "Starting serviceflow: {{ name }}",
};

const zh: Locale = {
  [K.ACTIVITY_PLAN]: "活动计划",
  [K.SHOW_PROCESS]: "显示过程",
  [K.STARTING_SERVICE_FLOW]: "发起业务流：{{ name }}",
};

export const NS = "bricks/ai-portal/ActivityPlan";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
