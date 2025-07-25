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
  cardType: string,
  customDefaultCardConfigMap?: Record<string, CardStyleConfig>
): CardStyleConfig => {
  const moreLinkByCardTypeMap: Record<string, CardStyleConfig> = {
    "notice-card": {
      moreIconLink: "/announcement-management",
      showMoreIcon: true,
      moreIconText: "更多",
    },
    "cmdb-object-collect-card": {
      moreIconLink: "/cmdb-model-management",
      showMoreIcon: true,
      moreIconText: "更多",
    },
    "itsm-todos": {
      moreIconLink: "/itsc-workbench/workbench?activeKey=run",
      showMoreIcon: true,
      moreIconText: "更多",
    },
    abnormalResourceInspectionResults: {
      moreIconLink: "/automatic-inspection/suites",
      showMoreIcon: true,
      moreIconText: "更多",
    },
    abnormalSystemInspectionResults: {
      moreIconLink: "/automatic-inspection/system/list",
      showMoreIcon: true,
      moreIconText: "更多",
    },
    ...(customDefaultCardConfigMap ?? {}),
  };
  return {
    ...defaultCardConfig,
    ...(moreLinkByCardTypeMap?.[cardType] ?? {}),
  };
};
