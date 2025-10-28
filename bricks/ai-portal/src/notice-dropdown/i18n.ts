import { i18n } from "@next-core/i18n";

export enum K {
  MESSAGE_LIST = "MESSAGE_LIST",
  NO_NEW_MESSAGE = "NO_NEW_MESSAGE",
  MARK_ALL_READ = "MARK_ALL_READ",
  ENTER_MESSAGE_CENTER = "ENTER_MESSAGE_CENTER",
}

const en: Locale = {
  MESSAGE_LIST: "Message List",
  NO_NEW_MESSAGE: "No new messages for now",
  MARK_ALL_READ: "Mark all as read",
  ENTER_MESSAGE_CENTER: "Enter Message Center",
};

const zh: Locale = {
  MESSAGE_LIST: "消息列表",
  NO_NEW_MESSAGE: "暂无新消息",
  MARK_ALL_READ: "全部已读",
  ENTER_MESSAGE_CENTER: "进入消息中心",
};

export const NS = "bricks/ai-portal/notice-dropdown";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
