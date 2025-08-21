import { i18n } from "@next-core/i18n";

export enum K {
  YES = "YES",
  NO = "NO",
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
  BACK_TO_CENTER = "BACK_TO_CENTER",
  ZOOM_IN = "ZOOM_IN",
  ZOOM_OUT = "ZOOM_OUT",
  FULLSCREEN = "FULLSCREEN",
  REPLAYING = "REPLAYING",
  REPLAY_COMPLETED = "REPLAY_COMPLETED",
  SKIP_TO_RESULTS = "SKIP_TO_RESULTS",
  WATCH_AGAIN = "WATCH_AGAIN",
  SEND_MESSAGE = "SEND_MESSAGE",
  UNTITLED = "UNTITLED",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX = "FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX = "FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX",
  DOWNLOAD = "DOWNLOAD",
}

const en: Locale = {
  YES: "Yes",
  NO: "No",
  PLAN_COMPLETED: "All jobs done",
  TASK_COMPLETED: "Task completed",
  SHARE: "Share",
  TYPE_YOUR_MESSAGE_HERE: "Type your message here",
  ARGUMENTS: "Arguments",
  PROCESS: "Process",
  RESPONSE: "Response",
  CONFIRMING_PLAN_TIPS:
    "According to the request, I have made the following plan:",
  PAUSE_THE_TASK: "Pause the task",
  RESUME_THE_TASK: "Resume the task",
  CANCEL_THE_TASK: "Cancel the task",
  CONFIRM_TO_CANCEL_THE_TASK_TITLE: "Are you sure to cancel the task?",
  CONFIRM_TO_CANCEL_THE_TASK_CONTENT:
    "The task can not be resumed after been canceled.",
  BACK_TO_CENTER: "Back to center",
  ZOOM_IN: "Zoom in",
  ZOOM_OUT: "Zoom out",
  FULLSCREEN: "Fullscreen",
  REPLAYING: "Task is replaying...",
  REPLAY_COMPLETED: "Task replay completed.",
  SKIP_TO_RESULTS: "Skip to results",
  WATCH_AGAIN: "Watch again",
  SEND_MESSAGE: "Send message",
  UNTITLED: "Untitled",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX:
    "This file is unpreviewable currently, you can",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX: "and view it locally.",
  DOWNLOAD: "Download",
};

const zh: Locale = {
  YES: "是",
  NO: "否",
  PLAN_COMPLETED: "所有任务已全部完成",
  TASK_COMPLETED: "任务完成",
  SHARE: "分享",
  TYPE_YOUR_MESSAGE_HERE: "在这里输入信息",
  ARGUMENTS: "参数",
  PROCESS: "过程",
  RESPONSE: "响应",
  CONFIRMING_PLAN_TIPS: "根据需求，我已制定如下计划：",
  PAUSE_THE_TASK: "暂停任务",
  RESUME_THE_TASK: "恢复任务",
  CANCEL_THE_TASK: "取消任务",
  CONFIRM_TO_CANCEL_THE_TASK_TITLE: "确定取消任务吗？",
  CONFIRM_TO_CANCEL_THE_TASK_CONTENT: "任务取消后将无法再恢复运行。",
  BACK_TO_CENTER: "回中",
  ZOOM_IN: "放大",
  ZOOM_OUT: "缩小",
  FULLSCREEN: "全屏",
  REPLAYING: "任务正在回放中...",
  REPLAY_COMPLETED: "任务回放完成。",
  SKIP_TO_RESULTS: "跳转到结果",
  WATCH_AGAIN: "重新观看",
  SEND_MESSAGE: "发送消息",
  UNTITLED: "未命名",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_PREFIX: "该类型文件暂不支持预览，您可以",
  FILE_PREVIEW_UNPREVIEWABLE_TIP_SUFFIX: "查看。",
  DOWNLOAD: "下载",
};

export const NS = "bricks/ai-portal/cruise-canvas";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
