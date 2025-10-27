import { i18n } from "@next-core/i18n";

export enum K {
  SWITCH_TO_CANVAS = "SWITCH_TO_CANVAS",
  INITIATING_SERVICE_FLOW = "INITIATING_SERVICE_FLOW",
  STARTING_SERVICE_FLOW_ACTIVITY = "STARTING_SERVICE_FLOW_ACTIVITY",
  HIL_TIPS = "HIL_TIPS",
}

const en: Locale = {
  SWITCH_TO_CANVAS: "Switch to canvas",
  INITIATING_SERVICE_FLOW: "Initiating service flow: {{ name }}",
  STARTING_SERVICE_FLOW_ACTIVITY: "Starting service flow activity: {{ name }}",
  HIL_TIPS: "Triggered HIL rule, waiting for {{ name }} to process.",
};

const zh: Locale = {
  SWITCH_TO_CANVAS: "切换为画布",
  INITIATING_SERVICE_FLOW: "发起业务流：{{ name }}",
  STARTING_SERVICE_FLOW_ACTIVITY: "开始业务流活动：{{ name }}",
  HIL_TIPS: "触发 HIL 规则，等待 {{ name }} 处理。",
};

export const NS = "bricks/ai-portal/chat-stream";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
