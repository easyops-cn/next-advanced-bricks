import { i18n } from "@next-core/i18n";

export enum K {
  DESCRIPTION = "DESCRIPTION",
  SPACE_GUIDE_SECTION_TITLE = "SPACE_GUIDE_SECTION_TITLE",
  SPACE_GUIDE_CARD_1_TITLE = "SPACE_GUIDE_CARD_1_TITLE",
  SPACE_GUIDE_CARD_2_TITLE = "SPACE_GUIDE_CARD_2_TITLE",
  SPACE_GUIDE_CARD_3_TITLE = "SPACE_GUIDE_CARD_3_TITLE",
  BUSINESS_OBJECTS = "BUSINESS_OBJECTS",
  BUSINESS_FLOWS = "BUSINESS_FLOWS",
  NO_BUSINESS_OBJECTS_FLOWS = "NO_BUSINESS_OBJECTS_FLOWS",
  GUIDE_AI_TO_GENERATE_CONFIG = "GUIDE_AI_TO_GENERATE_CONFIG",
  NO_CONFIGURATION_DATA = "NO_CONFIGURATION_DATA",
  FIELD_DEFINITIONS = "FIELD_DEFINITIONS",
  LIFECYCLE_STATUS = "LIFECYCLE_STATUS",
  PREREQUISITES = "PREREQUISITES",
  PREREQUISITES_SUBTITLE = "PREREQUISITES_SUBTITLE",
  ACTIVITY_DESCRIPTION = "ACTIVITY_DESCRIPTION",
  NO_DESCRIPTION = "NO_DESCRIPTION",
  RESPONSIBLE_AI_EMPLOYEE = "RESPONSIBLE_AI_EMPLOYEE",
  SELECT_AI_EMPLOYEE_PLACEHOLDER = "SELECT_AI_EMPLOYEE_PLACEHOLDER",
  HITL_RULES = "HITL_RULES",
  HITL_INTERVENTION_USER = "HITL_INTERVENTION_USER",
  SELECT_HITL_USER_PLACEHOLDER = "SELECT_HITL_USER_PLACEHOLDER",
  SPACE_CONFIGURATION = "SPACE_CONFIGURATION",
  SAVE_CONFIGURATION = "SAVE_CONFIGURATION",
  CANCEL = "CANCEL",
  PLEASE_ENTER = "PLEASE_ENTER",
  CONFIG_ASSISTANT_WELCOME = "CONFIG_ASSISTANT_WELCOME",
}

const en: Locale = {
  DESCRIPTION: "Description",
  SPACE_GUIDE_SECTION_TITLE: "I can help you with:",
  SPACE_GUIDE_CARD_1_TITLE: "Manage Business Cases",
  SPACE_GUIDE_CARD_2_TITLE: "Initiate Business Flow",
  SPACE_GUIDE_CARD_3_TITLE: "Manage Space Knowledge",
  BUSINESS_OBJECTS: "Business Objects",
  BUSINESS_FLOWS: "Business Flows",
  NO_BUSINESS_OBJECTS_FLOWS: "No Business Objects/Flows",
  GUIDE_AI_TO_GENERATE_CONFIG:
    "Please guide AI to generate configuration through the left conversation",
  NO_CONFIGURATION_DATA: "No Configuration Data",
  FIELD_DEFINITIONS: "Field Definitions",
  LIFECYCLE_STATUS: "Lifecycle Status",
  PREREQUISITES: "Prerequisites",
  PREREQUISITES_SUBTITLE: "The following conditions must be met:",
  ACTIVITY_DESCRIPTION: "Activity Description",
  NO_DESCRIPTION: "No Description",
  RESPONSIBLE_AI_EMPLOYEE: "Responsible AI Employee",
  SELECT_AI_EMPLOYEE_PLACEHOLDER: "Please select AI employee",
  HITL_RULES: "HITL Rules",
  HITL_INTERVENTION_USER: "HITL Intervention User",
  SELECT_HITL_USER_PLACEHOLDER: "Please select HITL intervention user",
  SPACE_CONFIGURATION: "Space Configuration",
  SAVE_CONFIGURATION: "Save Configuration",
  CANCEL: "Cancel",
  PLEASE_ENTER: "Please enter",
  CONFIG_ASSISTANT_WELCOME:
    "Hello! I am the space configuration assistant. You can describe your business process, and I will automatically generate related business objects and flows for you. You can also explicitly tell me which business object or flow to modify.",
};

const zh: Locale = {
  DESCRIPTION: "描述",
  SPACE_GUIDE_SECTION_TITLE: "我可以协助您完成:",
  SPACE_GUIDE_CARD_1_TITLE: "管理业务案例",
  SPACE_GUIDE_CARD_2_TITLE: "发起业务流",
  SPACE_GUIDE_CARD_3_TITLE: "管理空间知识",
  BUSINESS_OBJECTS: "业务对象",
  BUSINESS_FLOWS: "业务流",
  NO_BUSINESS_OBJECTS_FLOWS: "暂无业务对象/业务流",
  GUIDE_AI_TO_GENERATE_CONFIG: "请通过左侧对话引导 AI 生成配置",
  NO_CONFIGURATION_DATA: "暂无配置数据",
  FIELD_DEFINITIONS: "字段定义",
  LIFECYCLE_STATUS: "生命周期状态",
  PREREQUISITES: "先决条件",
  PREREQUISITES_SUBTITLE: "需要满足以下条件：",
  ACTIVITY_DESCRIPTION: "活动描述",
  NO_DESCRIPTION: "暂无描述",
  RESPONSIBLE_AI_EMPLOYEE: "负责数字人",
  SELECT_AI_EMPLOYEE_PLACEHOLDER: "请选择负责数字人",
  HITL_RULES: "HITL规则",
  HITL_INTERVENTION_USER: "HITL介入用户",
  SELECT_HITL_USER_PLACEHOLDER: "请选择HITL介入用户",
  SPACE_CONFIGURATION: "协作空间配置",
  SAVE_CONFIGURATION: "保存配置",
  CANCEL: "取消",
  PLEASE_ENTER: "请输入",
  CONFIG_ASSISTANT_WELCOME:
    "您好！我是协作空间配置助手。您可以告诉我描述你的业务流程，我会为你自动生成相关的业务对象和业务流，你也可以明确让我修改哪个业务对象或业务流。",
};

export const NS = "bricks/ai-portal/space-workbench";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
