export enum K {
  CLEAR_CONFIRM = "CLEAR_CONFIRM",
  CARD_LIST = "CARD_LIST",
  CLEAR_CONFIRM_MESSAGE = "CLEAR_CONFIRM_MESSAGE",
  SAVE = "SAVE",
  CANCEL = "CANCEL",
  SETTING = "SETTING",
  MORE = "MORE",
  SAVE_AS_TEMPLATE = "SAVE_AS_TEMPLATE",
  LOAD_FROM_TEMPLATE = "LOAD_FROM_TEMPLATE",
  CLEAR_ALL = "CLEAR_ALL"
}

const en: Locale = {
  CLEAR_CONFIRM: "Clear Confirm",
  CARD_LIST: "Card List",
  CLEAR_CONFIRM_MESSAGE: "All cards will be cleared and editing will start from scratch. This operation cannot be undone.",
  SAVE: "Save",
  CANCEL: "Cancel",
  SETTING: "Setting",
  MORE: "More",
  SAVE_AS_TEMPLATE: "Save As Template",
  LOAD_FROM_TEMPLATE: "Load From Template",
  CLEAR_ALL: "Clear All"
};

const zh: Locale = {
  CLEAR_CONFIRM: "清空确认",
  CARD_LIST: "卡片列表",
  CLEAR_CONFIRM_MESSAGE: "将清空所有卡片，从零开始编辑，该操作无法撤回。",
  SAVE: "保存",
  CANCEL: "取消",
  SETTING: "设置",
  MORE: "更多",
  SAVE_AS_TEMPLATE: "另存为模板",
  LOAD_FROM_TEMPLATE: "从模板加载",
  CLEAR_ALL: "清空所有"
};

export const NS = "bricks/advanced/eo-workbench-layout-v2";

export const locales = { en, zh };

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};