export const MODULE_SOURCE = "next-tsx";

export const CALL_API_LIST = [
  "callApi",
  "callHttp",
  "callTool",
  "callProvider",
  "copyText",
  "showDialog",
] as const;

export type CallApiType = (typeof CALL_API_LIST)[number];

export const HISTORY_METHODS = [
  "push",
  "replace",
  "reload",
  "pushQuery",
  "replaceQuery",
] as const;

export type HistoryMethodType = (typeof HISTORY_METHODS)[number];
