import { i18n } from "@next-core/i18n";

export enum K {
  CONFIRM = "CONFIRM",
  CANCEL = "CANCEL",
  PLAN_COMPLETED = "PLAN_COMPLETED",
}

const en: Locale = {
  CONFIRM: "Confirm",
  CANCEL: "Cancel",
  PLAN_COMPLETED: "All jobs done",
};

const zh: Locale = {
  CONFIRM: "确认",
  CANCEL: "取消",
  PLAN_COMPLETED: "所有任务已全部完成",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
