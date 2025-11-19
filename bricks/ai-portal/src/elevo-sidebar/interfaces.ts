import type { GeneralIconProps } from "@next-bricks/icons/general-icon";

export interface SidebarLink {
  title: string;
  url: string;
  icon?: GeneralIconProps;
  activeIncludes?: string[];
}
