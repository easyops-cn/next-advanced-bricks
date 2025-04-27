import { UseSingleBrickConf } from "@next-core/types";
import { Layout } from "react-grid-layout";

export type WorkbenchComponent = {
  position: Layout;
  key: string;
  title: string;
  style?: React.CSSProperties;
  useBrick: UseSingleBrickConf;
};
