import { i18n } from "@next-core/i18n";

export enum K {
  YES = "YES",
  NO = "NO",
  PLAN_COMPLETED = "PLAN_COMPLETED",
  TASK_COMPLETED = "TASK_COMPLETED",
  SHARE = "SHARE",
  TYPE_YOUR_MESSAGE_HERE = "TYPE_YOUR_MESSAGE_HERE",
  ARGUMENTS = "ARGUMENTS",
  RESPONSE = "RESPONSE",
  cmdb_create_app_system = "cmdb_create_app_system",
  cmdb_create_service_set = "cmdb_create_service_set",
  cmdb_append_host_to_service_set = "cmdb_append_host_to_service_set",
  cmdb_create_agent_scan_job = "cmdb_create_agent_scan_job",
  cmdb_service_node_clustering = "cmdb_service_node_clustering",
  ask_human = "ask_human",
}

const en: Locale = {
  YES: "Yes",
  NO: "No",
  PLAN_COMPLETED: "All jobs done",
  TASK_COMPLETED: "Task completed",
  SHARE: "Share",
  TYPE_YOUR_MESSAGE_HERE: "Type your message here",
  ARGUMENTS: "Arguments",
  RESPONSE: "Response",
  cmdb_create_app_system: "Create app system",
  cmdb_create_service_set: "Create service set",
  cmdb_append_host_to_service_set: "Append host to service set",
  cmdb_create_agent_scan_job: "Create agent scan job",
  cmdb_service_node_clustering: "Service node clustering",
  ask_human: "Ask user",
};

const zh: Locale = {
  YES: "是",
  NO: "否",
  PLAN_COMPLETED: "所有任务已全部完成",
  TASK_COMPLETED: "任务完成",
  SHARE: "分享",
  TYPE_YOUR_MESSAGE_HERE: "在这里输入信息",
  ARGUMENTS: "参数",
  RESPONSE: "响应",
  cmdb_create_app_system: "创建应用系统",
  cmdb_create_service_set: "创建服务集",
  cmdb_append_host_to_service_set: "将主机添加到服务集",
  cmdb_create_agent_scan_job: "创建 agent 扫描任务",
  cmdb_service_node_clustering: "服务节点聚类",
  ask_human: "询问用户",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
