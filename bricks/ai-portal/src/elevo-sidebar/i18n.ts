import { i18n } from "@next-core/i18n";

export enum K {
  NEW_CHAT = "NEW_CHAT",
  LOGOUT = "LOGOUT",
  TODAY = "TODAY",
  YESTERDAY = "YESTERDAY",
  PREVIOUS_7_DAYS = "PREVIOUS_7_DAYS",
  PREVIOUS_30_DAYS = "PREVIOUS_30_DAYS",
  SWITCH_LANGUAGE = "SWITCH_LANGUAGE",
  MY = "MY",
  PROJECTS = "PROJECTS",
  HISTORY = "HISTORY",
  CREATE_PROJECT = "CREATE_PROJECT",
  MOVE_TO_PROJECT = "MOVE_TO_PROJECT",
  UNTITLED = "UNTITLED",
  UNNAMED = "UNNAMED",
  BUSINESS_OBJECTS = "BUSINESS_OBJECTS",
  BUSINESS_OBJECT_MODELS = "BUSINESS_OBJECT_MODELS",
  SERVICEFLOWS = "SERVICEFLOWS",
  COLLABORATION_SPACES = "COLLABORATION_SPACES",
  CREATE_SERVICEFLOW = "CREATE_SERVICEFLOW",
}

const en: Locale = {
  [K.NEW_CHAT]: "New chat",
  [K.LOGOUT]: "Logout",
  [K.TODAY]: "Today",
  [K.YESTERDAY]: "Yesterday",
  [K.PREVIOUS_7_DAYS]: "Previous 7 days",
  [K.PREVIOUS_30_DAYS]: "Previous 30 days",
  [K.SWITCH_LANGUAGE]: "中文",
  [K.MY]: "My",
  [K.PROJECTS]: "Projects",
  [K.HISTORY]: "Chats",
  [K.CREATE_PROJECT]: "Create project",
  [K.MOVE_TO_PROJECT]: "Move to project",
  [K.UNTITLED]: "Untitled",
  [K.UNNAMED]: "Unnamed",
  [K.BUSINESS_OBJECTS]: "Business objects",
  [K.SERVICEFLOWS]: "Serviceflows",
  [K.COLLABORATION_SPACES]: "Collaboration spaces",
  [K.CREATE_SERVICEFLOW]: "Create serviceflow",
  [K.BUSINESS_OBJECT_MODELS]: "Business object models",
};

const zh: Locale = {
  [K.NEW_CHAT]: "新对话",
  [K.LOGOUT]: "登出",
  [K.TODAY]: "今天",
  [K.YESTERDAY]: "昨天",
  [K.PREVIOUS_7_DAYS]: "过去7天",
  [K.PREVIOUS_30_DAYS]: "过去30天",
  [K.SWITCH_LANGUAGE]: "English",
  [K.MY]: "我的",
  [K.PROJECTS]: "项目",
  [K.HISTORY]: "对话",
  [K.CREATE_PROJECT]: "创建项目",
  [K.MOVE_TO_PROJECT]: "移动到项目",
  [K.UNTITLED]: "无标题",
  [K.UNNAMED]: "未命名",
  [K.BUSINESS_OBJECTS]: "业务对象",
  [K.SERVICEFLOWS]: "业务流",
  [K.COLLABORATION_SPACES]: "协作空间",
  [K.CREATE_SERVICEFLOW]: "创建业务流",
  [K.BUSINESS_OBJECT_MODELS]: "业务对象模型",
};

export const NS = "bricks/ai-portal/elevo-sidebar";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
