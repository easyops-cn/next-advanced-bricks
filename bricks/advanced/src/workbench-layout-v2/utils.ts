import { CardStyleConfig } from "../interfaces";

export const defaultCardConfig: CardStyleConfig = {
  cardWidth: 2,
  showMoreIcon: false,
  cardBorderStyle: "solid",
  cardTitleFontSize: 16,
  cardBorderWidth: 1,
  cardBorderRadius: 6,
  cardTitleColor: "#262626",
  cardBorderColor: "#e8e8e8",
  cardBgType: "none",
};

export const getLayoutDefaultCardConfig = (
  cardType: string
): CardStyleConfig => {
  const moreLinkByCardTypeMap: Record<string, CardStyleConfig> = {
    "notice-card": {
      moreIconLink: "/announcement-management",
      showMoreIcon: true,
    },
    "cmdb-object-collect-card": {
      moreIconLink: "/cmdb-model-management",
      showMoreIcon: true,
    },
    "itsm-todos": {
      moreIconLink: "/itsc-workbench/workbench?activeKey=run",
      showMoreIcon: true,
    },
  };
  return {
    ...defaultCardConfig,
    ...(moreLinkByCardTypeMap?.[cardType] ?? {}),
  };
};
