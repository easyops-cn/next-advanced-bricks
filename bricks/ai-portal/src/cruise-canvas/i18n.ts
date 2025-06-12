import { i18n } from "@next-core/i18n";

export enum K {
  YES = "YES",
  NO = "NO",
  CONFIRM = "CONFIRM",
  ADD_STEP = "ADD_STEP",
  RESET_PLAN = "RESET_PLAN",
  PLAN_COMPLETED = "PLAN_COMPLETED",
  TASK_COMPLETED = "TASK_COMPLETED",
  SHARE = "SHARE",
  TYPE_YOUR_MESSAGE_HERE = "TYPE_YOUR_MESSAGE_HERE",
  ARGUMENTS = "ARGUMENTS",
  PROCESS = "PROCESS",
  RESPONSE = "RESPONSE",
  CONFIRMING_PLAN_TIPS = "CONFIRMING_PLAN_TIPS",
  PAUSE_THE_TASK = "PAUSE_THE_TASK",
  RESUME_THE_TASK = "RESUME_THE_TASK",
  CANCEL_THE_TASK = "CANCEL_THE_TASK",
  CONFIRM_TO_CANCEL_THE_TASK_TITLE = "CONFIRM_TO_CANCEL_THE_TASK_TITLE",
  CONFIRM_TO_CANCEL_THE_TASK_CONTENT = "CONFIRM_TO_CANCEL_THE_TASK_CONTENT",
  cmdb_create_app_system = "cmdb_create_app_system",
  cmdb_create_service_set = "cmdb_create_service_set",
  cmdb_append_host_to_service_set = "cmdb_append_host_to_service_set",
  cmdb_create_agent_scan_job = "cmdb_create_agent_scan_job",
  cmdb_service_node_clustering = "cmdb_service_node_clustering",
  ask_human = "ask_human",
  ask_human_confirming_plan = "ask_human_confirming_plan",
}

const en: Locale = {
  YES: "Yes",
  NO: "No",
  CONFIRM: "Confirm",
  ADD_STEP: "Add step",
  RESET_PLAN: "Reset plan",
  PLAN_COMPLETED: "All jobs done",
  TASK_COMPLETED: "Task completed",
  SHARE: "Share",
  TYPE_YOUR_MESSAGE_HERE: "Type your message here",
  ARGUMENTS: "Arguments",
  PROCESS: "Process",
  RESPONSE: "Response",
  CONFIRMING_PLAN_TIPS:
    "According to your request, I have made the following plan:",
  PAUSE_THE_TASK: "Pause the task",
  RESUME_THE_TASK: "Resume the task",
  CANCEL_THE_TASK: "Cancel the task",
  CONFIRM_TO_CANCEL_THE_TASK_TITLE: "Are you sure to cancel the task?",
  CONFIRM_TO_CANCEL_THE_TASK_CONTENT:
    "The task can not be resumed after been canceled.",
  cmdb_create_app_system: "Create app system",
  cmdb_create_service_set: "Create service set",
  cmdb_append_host_to_service_set: "Append host to service set",
  cmdb_create_agent_scan_job: "Create agent scan job",
  cmdb_service_node_clustering: "Service node clustering",
  ask_human: "Ask user",
  ask_human_confirming_plan: "Ask user to confirm the plan",
};

const zh: Locale = {
  YES: "是",
  NO: "否",
  CONFIRM: "确认",
  ADD_STEP: "添加步骤",
  RESET_PLAN: "重置计划",
  PLAN_COMPLETED: "所有任务已全部完成",
  TASK_COMPLETED: "任务完成",
  SHARE: "分享",
  TYPE_YOUR_MESSAGE_HERE: "在这里输入信息",
  ARGUMENTS: "参数",
  PROCESS: "过程",
  RESPONSE: "响应",
  CONFIRMING_PLAN_TIPS: "根据你的需求，我已制定如下计划：",
  PAUSE_THE_TASK: "暂停任务",
  RESUME_THE_TASK: "恢复任务",
  CANCEL_THE_TASK: "取消任务",
  CONFIRM_TO_CANCEL_THE_TASK_TITLE: "确定取消任务吗？",
  CONFIRM_TO_CANCEL_THE_TASK_CONTENT: "任务取消后将无法再恢复运行。",
  cmdb_create_app_system: "创建应用系统",
  cmdb_create_service_set: "创建服务集",
  cmdb_append_host_to_service_set: "将主机添加到服务集",
  cmdb_create_agent_scan_job: "创建 agent 扫描任务",
  cmdb_service_node_clustering: "服务节点聚类",
  ask_human: "询问用户",
  ask_human_confirming_plan: "询问用户确认计划",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
