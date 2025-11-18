import { i18n } from "@next-core/i18n";

export enum K {
  TERMINATE_THE_TASK = "TERMINATE_THE_TASK",
  COMMAND_TIPS = "COMMAND_TIPS",
  SEARCH_COMMANDS_TIPS = "SEARCH_COMMANDS_TIPS",
}

const en: Locale = {
  [K.TERMINATE_THE_TASK]: "Terminate the task",
  [K.COMMAND_TIPS]: "‘@’ AI Employee | ‘/’ Command",
  [K.SEARCH_COMMANDS_TIPS]:
    "Showing up to {{count}} items, type keywords to search",
};

const zh: Locale = {
  [K.TERMINATE_THE_TASK]: "终止任务",
  [K.COMMAND_TIPS]: "‘@’ 数字人 | ‘/’ 命令",
  [K.SEARCH_COMMANDS_TIPS]: "最多显示 {{count}} 条数据，输入关键字搜索",
};

export const NS = "bricks/ai-portal/chat-input";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
