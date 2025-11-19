import { i18n } from "@next-core/i18n";

export enum K {
  ARGUMENTS = "ARGUMENTS",
  PROCESS = "PROCESS",
  RESPONSE = "RESPONSE",
}

const en: Locale = {
  ARGUMENTS: "Arguments",
  PROCESS: "Process",
  RESPONSE: "Response",
};

const zh: Locale = {
  ARGUMENTS: "参数",
  PROCESS: "过程",
  RESPONSE: "响应",
};

export const NS = "bricks/ai-portal/ToolCallDetail";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
