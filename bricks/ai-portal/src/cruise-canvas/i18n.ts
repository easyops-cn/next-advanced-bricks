import { i18n } from "@next-core/i18n";

export enum K {
  YES = "YES",
  NO = "NO",
  PLAN_COMPLETED = "PLAN_COMPLETED",
  TASK_COMPLETED = "TASK_COMPLETED",
  SHARE = "SHARE",
}

const en: Locale = {
  YES: "Yes",
  NO: "No",
  PLAN_COMPLETED: "All jobs done",
  TASK_COMPLETED: "Task completed",
  SHARE: "Share",
};

const zh: Locale = {
  YES: "是",
  NO: "否",
  PLAN_COMPLETED: "所有任务已全部完成",
  TASK_COMPLETED: "任务完成",
  SHARE: "分享",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
