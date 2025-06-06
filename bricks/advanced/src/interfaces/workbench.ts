import { UseSingleBrickConf } from "@next-core/types";
import { Layout } from "react-grid-layout";

export type WorkbenchComponent = {
  position: Layout;
  key: string;
  title: string;
  thumbnail: string;
  style?: React.CSSProperties;
  useBrick: UseSingleBrickConf;
};

/**
 * 卡片相关配置
 */
export type CardStyleConfig = {
  cardWidth?: number;
  showMoreIcon?: boolean;
  cardBorderStyle?: string;
  cardTitleFontSize?: number;
  cardBorderWidth?: number;
  cardBorderRadius?: number;
  cardTitleColor?: string;
  cardBorderColor?: string;
  cardData?: any;
  cardTitle?: string;
  moreIconLink?: string;
  moreIconText?: string;
  cardBackground?: string;
  cardBgType?: string;
  timeRange?: Record<string, any>;
  isCreatedBySystemAdmin?: boolean;
  type?: string;
};

export type ExtraLayout = Layout & CardStyleConfig;
