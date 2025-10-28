import { i18n } from "@next-core/i18n";

export enum K {
  PLAN_COMPLETED = "PLAN_COMPLETED",
}

const en: Locale = {
  PLAN_COMPLETED: "All tasks are completed",
};

const zh: Locale = {
  PLAN_COMPLETED: "所有任务已全部完成",
};

export const NS = "bricks/ai-portal/PlanProgress";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
