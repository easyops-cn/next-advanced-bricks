import { i18n } from "@next-core/i18n";

export enum K {
  NO_DATA = "NO_DATA",
}

const en: Locale = {
  NO_DATA: "No data",
};

const zh: Locale = {
  NO_DATA: "暂无数据",
};

export const NS = "bricks/form/select";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
