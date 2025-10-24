import { i18n } from "@next-core/i18n";

export enum K {
  SWITCH_TO_CANVAS = "SWITCH_TO_CANVAS",
  START_SERVICE_FLOW = "START_SERVICE_FLOW",
  START_SERVICE_FLOW_ACTIVITY = "START_SERVICE_FLOW_ACTIVITY",
  SERVICE_FLOW = "SERVICE_FLOW",
  SERVICE_FLOW_ACTIVITY = "SERVICE_FLOW_ACTIVITY",
}

const en: Locale = {
  SWITCH_TO_CANVAS: "Switch to canvas",
  START_SERVICE_FLOW: "Start service flow: {{ name }}",
  START_SERVICE_FLOW_ACTIVITY: "Start service flow activity: {{ name }}",
  SERVICE_FLOW: "Service flow: {{ name }}",
  SERVICE_FLOW_ACTIVITY: "Service flow activity: {{ name }}",
};

const zh: Locale = {
  SWITCH_TO_CANVAS: "切换为画布",
  START_SERVICE_FLOW: "开始业务流：{{ name }}",
  START_SERVICE_FLOW_ACTIVITY: "开始业务流活动：{{ name }}",
  SERVICE_FLOW: "业务流：{{ name }}",
  SERVICE_FLOW_ACTIVITY: "业务流活动：{{ name }}",
};

export const NS = "bricks/ai-portal/chat-stream";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
