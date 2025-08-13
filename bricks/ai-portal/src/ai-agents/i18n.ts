import { i18n } from "@next-core/i18n";

export enum K {
  AGENTS = "AGENTS",
}

const en: Locale = {
  AGENTS: "Agents",
};

const zh: Locale = {
  AGENTS: "智能体",
};

export const NS = "bricks/ai-portal/ai-agents";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
