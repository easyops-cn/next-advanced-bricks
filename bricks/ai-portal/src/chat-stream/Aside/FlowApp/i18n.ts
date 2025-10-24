import { i18n } from "@next-core/i18n";

export enum K {
  WAITING = "WAITING",
  EXECUTING = "EXECUTING",
  PAUSED = "PAUSED",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
  TERMINATED = "TERMINATED",
}

const en: Locale = {
  WAITING: "Waiting",
  EXECUTING: "Executing",
  PAUSED: "Paused",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
  TERMINATED: "Terminated",
};

const zh: Locale = {
  WAITING: "等待中",
  EXECUTING: "执行中",
  PAUSED: "暂停",
  SUCCEEDED: "成功",
  FAILED: "失败",
  TERMINATED: "已终止",
};

export const NS = "bricks/ai-portal/FlowApp";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
