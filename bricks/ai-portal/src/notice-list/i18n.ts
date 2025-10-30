import { i18n } from "@next-core/i18n";

export enum K {
  MARK_READ = "MARK_READ",
  MARK_ALL_READ = "MARK_ALL_READ",
  NO_MESSAGE = "NO_MESSAGE",
}

const en: Locale = {
  MARK_READ: "Mark as read",
  MARK_ALL_READ: "Mark all as read",
  NO_MESSAGE: "No messages",
};

const zh: Locale = {
  MARK_READ: "标记已读",
  MARK_ALL_READ: "全部已读",
  NO_MESSAGE: "暂无消息",
};

export const NS = "bricks/ai-portal/notice-list";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
