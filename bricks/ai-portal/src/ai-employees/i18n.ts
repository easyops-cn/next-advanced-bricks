import { i18n } from "@next-core/i18n";

export enum K {
  AI_EMPLOYEES = "AI_EMPLOYEES",
  UNTITLED = "UNTITLED",
}

const en: Locale = {
  AI_EMPLOYEES: "AI Employees",
  UNTITLED: "Untitled",
};

const zh: Locale = {
  AI_EMPLOYEES: "Ai 数字人",
  UNTITLED: "未命名",
};

export const NS = "bricks/ai-portal/ai-employees";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
