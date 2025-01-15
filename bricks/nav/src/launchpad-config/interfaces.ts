import { AppLocales } from "@next-core/types";
import type { LegacyAntdIcon, MenuIcon } from "@next-shared/general/types";
import type { Action } from "@next-bricks/basic/actions";

export interface ConfigMenuGroup extends ConfigMenuBase {
  type?: "group";
  order?: number;
  items: ConfigMenuItem[];
  blockableUrls?: string[];
}

export type ConfigMenuItem = ConfigMenuItemNormal | ConfigMenuItemDir;
export type ConfigMenuItemNormal = ConfigMenuItemApp | ConfigMenuItemCustom;

export interface ConfigMenuItemApp extends ConfigMenuItemBase {
  type: "app";
  url: string;
  locales?: AppLocales;
}

export interface ConfigMenuItemCustom extends ConfigMenuItemBase {
  type: "custom";
  url: string;
  blockableUrl?: string;
}

export interface ConfigMenuItemDir extends ConfigMenuItemBase {
  type: "dir";
  items: ConfigMenuItemNormal[];
  blockableUrls?: string[];
}

interface ConfigMenuItemBase extends ConfigMenuBase {
  type: "app" | "custom" | "dir";
  menuIcon?: Exclude<MenuIcon, LegacyAntdIcon>;
  position?: number;
}

interface ConfigMenuBase {
  id: string;
  name: string;
  instanceId: string;
  /** 有可屏蔽的 */
  blockable?: boolean;
  /** 有可屏蔽且已屏蔽的 */
  hasBlocked?: boolean;
  /** 有可屏蔽且未屏蔽的 */
  hasUnblocked?: boolean;
  /** 全部被屏蔽了 */
  allBlocked?: boolean;
}

export type MenuAction = Action & {
  if?: unknown;
};

export interface MenuActionEventDetail {
  data: ConfigMenuGroup | ConfigMenuItem;
  action: MenuAction;
}

export type ConfigVariant =
  | "launchpad-config"
  | "menu-config"
  | "blacklist-config";
