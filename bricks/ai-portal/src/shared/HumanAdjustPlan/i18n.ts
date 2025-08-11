import { i18n } from "@next-core/i18n";

export enum K {
  CONFIRM = "CONFIRM",
  ADD_STEP = "ADD_STEP",
  RESET_PLAN = "RESET_PLAN",
}

const en: Locale = {
  CONFIRM: "Confirm",
  ADD_STEP: "Add step",
  RESET_PLAN: "Reset plan",
};

const zh: Locale = {
  CONFIRM: "确认",
  ADD_STEP: "添加步骤",
  RESET_PLAN: "重置计划",
};

export const NS = "bricks/ai-portal/HumanAdjustPlan";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
