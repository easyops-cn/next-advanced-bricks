export enum K {
  PAGE_RENDER_SLOW_TIP = "PAGE_RENDER_SLOW_TIP",
  VIEW_SUGGESTION = "VIEW_SUGGESTION",
  LICENSE_EXPIRES_IN_DAY = "LICENSE_EXPIRES_IN_DAY",
}

const en: Locale = {
  PAGE_RENDER_SLOW_TIP:
    "Your page is running slowly. The current render time is {{renderTime}} seconds, exceeding the threshold of {{suggestTime}} seconds. Please optimize this page.",
  VIEW_SUGGESTION: "View suggestions",
  LICENSE_EXPIRES_IN_DAY: "License expires in {{count}} day",
  LICENSE_EXPIRES_IN_DAY_plural: "License expires in {{count}} days",
};

const zh: Locale = {
  PAGE_RENDER_SLOW_TIP:
    "您的页面存在性能问题，当前页面渲染时间为 {{renderTime}} 秒，超过规定阈值 {{suggestTime}} 秒。请针对该页面进行性能优化！",
  VIEW_SUGGESTION: "建议解决思路",
  LICENSE_EXPIRES_IN_DAY: "离 License 过期还有 {{count}} 天",
};

export const NS = "bricks/nav/easyops-navbar-alerts";

export const locales = { en, zh };

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
