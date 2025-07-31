import type { AppLocales, MicroApp } from "@next-core/types";
import type { LegacyAntdIcon, MenuIcon } from "@next-shared/general/types";

export interface MenuGroupData {
  name: string;
  localeName?: string;
  locales?: AppLocales;
  instanceId: string;
  items: MenuItemData[];
}

export type MenuItemData = MenuItemDataNormal | MenuItemDataDir;

export type MenuItemDataNormal = MenuItemDataApp | MenuItemDataCustom;

export type SidebarMenuItemData = MenuItemDataNormal | MenuItemDataLink;

export interface MicroAppWithInstanceId extends MicroApp {
  instanceId: string;
}

export interface MenuItemDataBase {
  type: string;
  name: string;
  localeName?: string;
  locales?: AppLocales;
  id: string;
}

export interface MenuItemDataApp extends MenuItemDataBase {
  type: "app";
  instanceId: string;
  url: string;
  description?: string;
  menuIcon?: Exclude<MenuIcon, LegacyAntdIcon>;
}

export interface MenuItemDataCustom extends MenuItemDataBase {
  type: "custom";
  instanceId: string;
  url: string;
  description?: string;
  menuIcon?: Exclude<MenuIcon, LegacyAntdIcon>;
}

export interface MenuItemDataDir extends MenuItemDataBase {
  type: "dir";
  items: MenuItemDataNormal[];
}

export interface MenuItemDataLink {
  type: "link";
  favoriteId: string;
  name: string;
  url: string;
  menuIcon?: Exclude<MenuIcon, LegacyAntdIcon>;
}

export interface StoredMenuItem {
  type: "app" | "custom";
  id: string;
}

export interface FavMenuItem {
  favoriteId?: string;
  type: "app" | "custom" | "link";
  name: string;
  id: string;
  instanceId: string;
  url: string;
  menuIcon?: MenuIcon;
}

export interface PlatformCategoryItem {
  instanceId?: string;
  id: string;
  name: string;
  icon: Exclude<MenuIcon, LegacyAntdIcon>;
  items: MenuItemDataNormal[];
}
