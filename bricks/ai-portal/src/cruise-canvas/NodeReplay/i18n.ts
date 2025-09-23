import { i18n } from "@next-core/i18n";

export enum K {
  WATCH_AGAIN = "WATCH_AGAIN",
  TRY_IT_OUT = "TRY_IT_OUT",
  CASE_REPLAYING = "CASE_REPLAYING",
  CASE_REPLAY_FINISHED = "CASE_REPLAY_FINISHED",
  SKIP_TO_RESULTS = "SKIP_TO_RESULTS",
  OTHER_CASES = "OTHER_CASES",
  PROJECT_TIPS = "PROJECT_TIPS",
  GET_STARTED_WITH_PROJECTS_PREFIX = "GET_STARTED_WITH_PROJECTS_PREFIX",
  PROJECTS = "PROJECTS",
  GET_STARTED_WITH_PROJECTS_SUFFIX = "GET_STARTED_WITH_PROJECTS_SUFFIX",
}

const en: Locale = {
  WATCH_AGAIN: "Watch again",
  TRY_IT_OUT: "Try it out",
  CASE_REPLAYING: "The case is replaying...",
  CASE_REPLAY_FINISHED: "The case replay has finished.",
  SKIP_TO_RESULTS: "Skip to results",
  OTHER_CASES: "Other cases",
  PROJECT_TIPS:
    "Start your project collaboration journey and achieve shared goals with team members and AI employees.",
  GET_STARTED_WITH_PROJECTS_PREFIX: "Get started with ",
  PROJECTS: "Projects",
  GET_STARTED_WITH_PROJECTS_SUFFIX: "",
};

const zh: Locale = {
  WATCH_AGAIN: "再次观看",
  TRY_IT_OUT: "尝试同款",
  CASE_REPLAYING: "案例回放中...",
  CASE_REPLAY_FINISHED: "案例回放完成",
  SKIP_TO_RESULTS: "跳转到结果",
  OTHER_CASES: "其他案例",
  PROJECT_TIPS:
    "开启项目协作之旅，和团队成员及多位AI数字人一起实现共同制定的目标。",
  GET_STARTED_WITH_PROJECTS_PREFIX: "开启 ",
  PROJECTS: "项目",
  GET_STARTED_WITH_PROJECTS_SUFFIX: " 体验",
};

export const NS = "bricks/ai-portal/NodeReplay";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
