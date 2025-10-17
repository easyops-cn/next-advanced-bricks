import { i18n } from "@next-core/i18n";

export enum K {
  ADD_STAGE = "ADD_STAGE",
  PLEASE_ENTER_NAME = "PLEASE_ENTER_NAME",
  UNASSIGNED = "UNASSIGNED",
  DELETE_STAGE = "DELETE_STAGE",
  DELETE_STAGE_TIPS = "DELETE_STAGE_TIPS",
  DELETE = "DELETE",
  ADD_ACTIVITY = "ADD_ACTIVITY",
}

const en: Locale = {
  [K.ADD_STAGE]: "Add stage",
  [K.PLEASE_ENTER_NAME]: "Please enter name",
  [K.UNASSIGNED]: "Unassigned",
  [K.DELETE_STAGE]: "Delete stage",
  [K.DELETE_STAGE_TIPS]: 'Are you sure you want to delete stage "{{ name }}"?',
  [K.DELETE]: "Delete",
  [K.ADD_ACTIVITY]: "Add activity",
};

const zh: Locale = {
  [K.ADD_STAGE]: "添加阶段",
  [K.PLEASE_ENTER_NAME]: "请输入名称",
  [K.UNASSIGNED]: "未设置",
  [K.DELETE_STAGE]: "删除阶段",
  [K.DELETE_STAGE_TIPS]: "您确定要删除阶段 “{{ name }}” 吗？",
  [K.DELETE]: "删除",
  [K.ADD_ACTIVITY]: "添加活动",
};

export const NS = "bricks/ai-portal/stage-flow";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
