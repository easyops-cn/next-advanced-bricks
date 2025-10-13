export enum K {
  SEARCH_PLACEHOLDER = "SEARCH_PLACEHOLDER"
}

const en: Locale = {
  SEARCH_PLACEHOLDER: "Search products/micro-applications"
};

const zh: Locale = {
  SEARCH_PLACEHOLDER: "搜索产品/微应用"
};

export const NS = "bricks/nav/search-launchpad";

export const locales = { en, zh };

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};