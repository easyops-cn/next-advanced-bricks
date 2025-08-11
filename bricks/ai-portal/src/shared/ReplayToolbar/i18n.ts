import { i18n } from "@next-core/i18n";

export enum K {
  REPLAYING = "REPLAYING",
  REPLAY_COMPLETED = "REPLAY_COMPLETED",
  SKIP_TO_RESULTS = "SKIP_TO_RESULTS",
  WATCH_AGAIN = "WATCH_AGAIN",
}

const en: Locale = {
  REPLAYING: "Task is replaying...",
  REPLAY_COMPLETED: "Task replay completed.",
  SKIP_TO_RESULTS: "Skip to results",
  WATCH_AGAIN: "Watch again",
};

const zh: Locale = {
  REPLAYING: "任务正在回放中...",
  REPLAY_COMPLETED: "任务回放完成。",
  SKIP_TO_RESULTS: "跳转到结果",
  WATCH_AGAIN: "重新观看",
};

export const NS = "bricks/ai-portal/ReplayToolbar";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
