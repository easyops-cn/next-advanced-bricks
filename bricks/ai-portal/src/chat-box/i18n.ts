import { i18n } from "@next-core/i18n";

export enum K {
  HOW_CAN_I_HELP = "HOW_CAN_I_HELP"
}

const en: Locale = {
  [K.HOW_CAN_I_HELP]: "How can I help?",
};

const zh: Locale = {
  [K.HOW_CAN_I_HELP]: "有什么可以帮您的？",
};

export const NS = "bricks/ai-portal/chat-box";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
