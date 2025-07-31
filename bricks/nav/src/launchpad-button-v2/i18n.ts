import { i18n } from "@next-core/i18n";

export enum K {
  ALL = "ALL",
  QUICK_ACCESS = "QUICK_ACCESS",
  PLATFORM_BASE = "PLATFORM_BASE",
  SCENARIO_CENTER = "SCENARIO_CENTER",
  SOLUTIONS = "SOLUTIONS",
  OPEN_PLATFORM = "OPEN_PLATFORM",
  SEARCH_PLACEHOLDER = "SEARCH_PLACEHOLDER",
  RECENT_VISITS = "RECENT_VISITS",
  FAVORITE = "FAVORITE",
  UNFAVORITE = "UNFAVORITE",
  FAVORITES_LIMIT_REACHED = "FAVORITES_LIMIT_REACHED",
  FAVORITES_LIMIT_MESSAGE = "FAVORITES_LIMIT_MESSAGE",
}

const en: Locale = {
  ALL: "All",
  QUICK_ACCESS: "Quick Access",
  PLATFORM_BASE: "Platform Base",
  SCENARIO_CENTER: "Scenario Center",
  SOLUTIONS: "Solutions",
  OPEN_PLATFORM: "Open Platform",
  SEARCH_PLACEHOLDER: "Search by keyword",
  RECENT_VISITS: "Recent Visits",
  FAVORITE: "Favorite",
  UNFAVORITE: "Unfavorite",
  FAVORITES_LIMIT_REACHED: "Favorites Limit Reached",
  FAVORITES_LIMIT_MESSAGE:
    "Current favorites count has reached the limit ({{count}} items). Please remove some favorites before adding new ones.",
};

const zh: Locale = {
  ALL: "全部",
  QUICK_ACCESS: "快捷访问",
  PLATFORM_BASE: "平台底座",
  SCENARIO_CENTER: "场景中心",
  SOLUTIONS: "解决方案",
  OPEN_PLATFORM: "开放平台",
  SEARCH_PLACEHOLDER: "通过关键字搜索",
  RECENT_VISITS: "最近访问",
  FAVORITE: "收藏",
  UNFAVORITE: "取消收藏",
  FAVORITES_LIMIT_REACHED: "收藏数量已达上限",
  FAVORITES_LIMIT_MESSAGE:
    "当前收藏链接数量已达上限（{{count}}个），请删除部分收藏后再添加。",
};

export const NS = "bricks/nav/launchpad-button-v2";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
