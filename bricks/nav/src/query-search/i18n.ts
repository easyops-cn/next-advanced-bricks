import { i18n } from "@next-core/i18n";

export enum K {
  FULL_TEXT_SEARCH = "FULL_TEXT_SEARCH",
  IP_SEARCH = "IP_SEARCH",
  TICKET_SEARCH = "TICKET_SEARCH",
  TICKET_SEARCH_PLACEHOLDER = "TICKET_SEARCH_PLACEHOLDER",
  IP_SEARCH_PLACEHOLDER = "IP_SEARCH_PLACEHOLDER",
  FULL_TEXT_SEARCH_PLACEHOLDER = "FULL_TEXT_SEARCH_PLACEHOLDER",
  IP_SEARCH_TOOLTIP = "IP_SEARCH_TOOLTIP",
  RECENT_SEARCH = "RECENT_SEARCH",
  NO_SEARCH_HISTORY = "NO_SEARCH_HISTORY",
  QUICK_SEARCH_TIP = "QUICK_SEARCH_TIP",
}

const en: Locale = {
  FULL_TEXT_SEARCH: "Full-text search",
  IP_SEARCH: "IP search",
  TICKET_SEARCH: "Ticket search",
  TICKET_SEARCH_PLACEHOLDER: "Enter ticket number/title and other keywords",
  IP_SEARCH_PLACEHOLDER:
    "Enter IP to query hosts and related applications, systems and other resources",
  FULL_TEXT_SEARCH_PLACEHOLDER:
    'Search applications, hosts and other information, supports "" exact search',
  IP_SEARCH_TOOLTIP: "IP Search",
  RECENT_SEARCH: "Recent Search",
  NO_SEARCH_HISTORY: "No search history",
  QUICK_SEARCH_TIP: "Quick Search (Cmd/Ctrl+K)",
};

const zh: Locale = {
  FULL_TEXT_SEARCH: "全文搜索",
  IP_SEARCH: "ip搜索",
  TICKET_SEARCH: "工单搜索",
  TICKET_SEARCH_PLACEHOLDER: "输入工单编号/标题等关键字",
  IP_SEARCH_PLACEHOLDER: "输入IP查询主机关联的应用、系统等资源",
  FULL_TEXT_SEARCH_PLACEHOLDER: '搜索应用、主机等信息，支持""精确搜索',
  IP_SEARCH_TOOLTIP: "IP搜索",
  RECENT_SEARCH: "最近搜索",
  NO_SEARCH_HISTORY: "暂无搜索记录",
  QUICK_SEARCH_TIP: "快捷搜索（Cmd/Ctrl+K）",
};

export const NS = "bricks/nav/query-search";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
