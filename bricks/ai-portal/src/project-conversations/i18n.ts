import { i18n } from "@next-core/i18n";

export enum K {
  PROJECT_OVERALL = "PROJECT_OVERALL",
}

const en: Locale = {
  PROJECT_OVERALL: "Project overall",
};

const zh: Locale = {
  PROJECT_OVERALL: "项目整体",
};

export const NS = "bricks/ai-portal/project-conversations";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
