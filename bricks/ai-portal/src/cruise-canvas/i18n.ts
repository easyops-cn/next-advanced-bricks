import { i18n } from "@next-core/i18n";

export enum K {
  YES = "YES",
  NO = "NO",
  TASK_COMPLETED = "TASK_COMPLETED",
  SHARE = "SHARE",
  TYPE_YOUR_MESSAGE_HERE = "TYPE_YOUR_MESSAGE_HERE",
  ARGUMENTS = "ARGUMENTS",
  PROCESS = "PROCESS",
  RESPONSE = "RESPONSE",
  SWITCH_TO_CHAT = "SWITCH_TO_CHAT",
  BACK_TO_CENTER = "BACK_TO_CENTER",
  ZOOM_IN = "ZOOM_IN",
  ZOOM_OUT = "ZOOM_OUT",
  FULLSCREEN = "FULLSCREEN",
  SEND_MESSAGE = "SEND_MESSAGE",
  UNTITLED = "UNTITLED",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX = "FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX = "FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX",
  DOWNLOAD = "DOWNLOAD",
  START_SERVICE_FLOW = "START_SERVICE_FLOW",
  START_SERVICE_FLOW_ACTIVITY = "START_SERVICE_FLOW_ACTIVITY",
}

const en: Locale = {
  YES: "Yes",
  NO: "No",
  TASK_COMPLETED: "Task completed",
  SHARE: "Share",
  TYPE_YOUR_MESSAGE_HERE: "Type your message here",
  ARGUMENTS: "Arguments",
  PROCESS: "Process",
  RESPONSE: "Response",
  SWITCH_TO_CHAT: "Switch to chat",
  BACK_TO_CENTER: "Back to center",
  ZOOM_IN: "Zoom in",
  ZOOM_OUT: "Zoom out",
  FULLSCREEN: "Fullscreen",
  SEND_MESSAGE: "Send message",
  UNTITLED: "Untitled",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX:
    "This file is unpreviewable currently, you can",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX: "and view it locally.",
  DOWNLOAD: "Download",
  START_SERVICE_FLOW: "Start service flow: {{ name }}",
  START_SERVICE_FLOW_ACTIVITY: "Start service flow activity: {{ name }}",
};

const zh: Locale = {
  YES: "是",
  NO: "否",
  TASK_COMPLETED: "任务完成",
  SHARE: "分享",
  TYPE_YOUR_MESSAGE_HERE: "在这里输入信息",
  ARGUMENTS: "参数",
  PROCESS: "过程",
  RESPONSE: "响应",
  SWITCH_TO_CHAT: "切换为聊天",
  BACK_TO_CENTER: "回中",
  ZOOM_IN: "放大",
  ZOOM_OUT: "缩小",
  FULLSCREEN: "全屏",
  SEND_MESSAGE: "发送消息",
  UNTITLED: "未命名",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX: "该类型文件暂不支持预览，您可以",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX: "查看。",
  DOWNLOAD: "下载",
  START_SERVICE_FLOW: "开始业务流：{{ name }}",
  START_SERVICE_FLOW_ACTIVITY: "开始业务流活动：{{ name }}",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
