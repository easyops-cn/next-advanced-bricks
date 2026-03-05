export enum K {
  CMDB_INSTANCE_SELECT = "CMDB_INSTANCE_SELECT",
  BACKGROUND_SEARCH = "BACKGROUND_SEARCH",
}

const en: Locale = {
  CMDB_INSTANCE_SELECT: "CMDB Instance Select",
  BACKGROUND_SEARCH: "Input keyword to search",
};

const zh: Locale = {
  CMDB_INSTANCE_SELECT: "CMDB 实例选择",
  BACKGROUND_SEARCH: "输入关键字搜索",
};

export const NS = "bricks/form-platform/eo-cmdb-instance-select";

export const locales = { en, zh };

type Locale = { [key in K]: string };
