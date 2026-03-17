import { UseSingleBrickConfOrRenderFunction } from "@next-core/react-runtime";
import { Layout } from "react-grid-layout";

export type WorkbenchComponent = {
  position: Layout;
  key: string;
  title: string;
  thumbnail: string;
  style?: React.CSSProperties;
  useBrick: UseSingleBrickConfOrRenderFunction;
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
  noPadding?: boolean;
};

export type ExtraLayout = Layout & CardStyleConfig;
