import { i18n } from "@next-core/i18n";

export enum K {
  PLEASE_SELECT = "PLEASE_SELECT",
  SEARCH_PLACEHOLDER = "SEARCH_PLACEHOLDER",
  SEARCH_NO_DATA = "SEARCH_NO_DATA",
}

const en: Locale = {
  PLEASE_SELECT: "Please Select",
  SEARCH_PLACEHOLDER: "Search",
  SEARCH_NO_DATA: "No Data",
};

const zh: Locale = {
  PLEASE_SELECT: "请选择",
  SEARCH_PLACEHOLDER: "搜索",
  SEARCH_NO_DATA: "暂无结果",
};

export const NS = "bricks/ai-portal/dropdown-select";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
