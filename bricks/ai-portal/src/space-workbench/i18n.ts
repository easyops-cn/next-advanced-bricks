import { i18n } from "@next-core/i18n";

export enum K {
  SPACE_GUIDE_SECTION_TITLE = "SPACE_GUIDE_SECTION_TITLE",
  SPACE_GUIDE_CARD_1_TITLE = "SPACE_GUIDE_CARD_1_TITLE",
  SPACE_GUIDE_CARD_2_TITLE = "SPACE_GUIDE_CARD_2_TITLE",
  SPACE_GUIDE_CARD_3_TITLE = "SPACE_GUIDE_CARD_3_TITLE",
}

const en: Locale = {
  SPACE_GUIDE_SECTION_TITLE: "I can help you with:",
  SPACE_GUIDE_CARD_1_TITLE: "Manage Business Cases",
  SPACE_GUIDE_CARD_2_TITLE: "Initiate Business Flow",
  SPACE_GUIDE_CARD_3_TITLE: "Manage Space Knowledge",
};

const zh: Locale = {
  SPACE_GUIDE_SECTION_TITLE: "我可以协助您完成:",
  SPACE_GUIDE_CARD_1_TITLE: "管理业务案例",
  SPACE_GUIDE_CARD_2_TITLE: "发起业务流",
  SPACE_GUIDE_CARD_3_TITLE: "管理空间知识",
};

export const NS = "bricks/ai-portal/space-workbench";

export const locales = { en, zh };

export const t = i18n.getFixedT(null, NS);

type Locale = { [k in K]: string } & {
  [k in K as `${k}_plural`]?: string;
};
