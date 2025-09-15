import { i18n } from "@next-core/i18n";

export enum K {
  UN_START_STATUS = "UN_START_STATUS",
  RUNNING_STATUS = "RUNNING_STATUS",
  COMPLETED_STATUS = "COMPLETED_STATUS",
}

const en: Locale = {
  UN_START_STATUS: "Not Start",
  RUNNING_STATUS: "Running",
  COMPLETED_STATUS: "Completed",
};

const zh: Locale = {
  UN_START_STATUS: "未开始",
  RUNNING_STATUS: "运行中",
  COMPLETED_STATUS: "已完成",
};

export const NS = "bricks/ai-portal/goal-card-list";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
