import { i18n } from "@next-core/i18n";

export enum K {
  MCP_TOOL_HUB = "MCP_TOOL_HUB",
  ALL = "ALL",

  SERVER_cmdb = "SERVER_cmdb",
  SERVER_alert = "SERVER_alert",
  SERVER_web_builder = "SERVER_web_builder",
  SERVER_host_troubleshooting = "SERVER_host_troubleshooting",
  SERVER_system_inspection = "SERVER_system_inspection",
}

const en: Locale = {
  [K.MCP_TOOL_HUB]: "MCP Tool Hub",
  [K.ALL]: "All",

  [K.SERVER_cmdb]: "CMDB",
  [K.SERVER_alert]: "Alert",
  [K.SERVER_web_builder]: "View",
  [K.SERVER_host_troubleshooting]: "Host Troubleshooting",
  [K.SERVER_system_inspection]: "System Inspection",
};

const zh: Locale = {
  [K.MCP_TOOL_HUB]: "MCP 工具中心",
  [K.ALL]: "全部",

  [K.SERVER_cmdb]: "CMDB",
  [K.SERVER_alert]: "告警",
  [K.SERVER_web_builder]: "视图",
  [K.SERVER_host_troubleshooting]: "主机故障排查",
  [K.SERVER_system_inspection]: "系统巡检",
};

export const NS = "bricks/ai-portal/mcp-tools";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
