import { i18n } from "@next-core/i18n";

export enum K {
  CHATS = "CHATS",
  GOALS = "GOALS",
}

const en: Locale = {
  [K.CHATS]: "Chat history",
  [K.GOALS]: "Project goals",
};

const zh: Locale = {
  [K.CHATS]: "历史对话",
  [K.GOALS]: "项目目标",
};

export const NS = "bricks/ai-portal/project-summary";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
