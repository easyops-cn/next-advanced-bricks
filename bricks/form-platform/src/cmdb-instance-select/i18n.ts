export enum K {
  CMDB_INSTANCE_SELECT = "CMDB_INSTANCE_SELECT",
}

const en: Locale = {
  CMDB_INSTANCE_SELECT: "CMDB Instance Select",
};

const zh: Locale = {
  CMDB_INSTANCE_SELECT: "CMDB 实例选择",
};

export const NS = "bricks/form-platform/eo-cmdb-instance-select";

export const locales = { en, zh };

type Locale = { [key in K]: string };
