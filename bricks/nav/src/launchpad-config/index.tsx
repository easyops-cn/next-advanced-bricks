import React, { useMemo } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { auth } from "@next-core/easyops-runtime";
import "@next-core/theme";
import type {
  ConfigMenuGroup,
  ConfigMenuItem,
  ConfigMenuItemApp,
  ConfigMenuItemCustom,
  ConfigMenuItemDir,
  ConfigVariant,
  MenuAction,
  MenuActionEventDetail,
} from "./interfaces";
import { MenuGroup } from "./MenuGroup";
import styleText from "./styles.shadow.css";

const { defineElement, property, event } = createDecorators();

const BASE_PATH = "/next/";

/**
 * 进行 Launchpad 配置。
 *
 * 也可用于菜单自定义显示产品功能清单。
 *
 * @insider
 */
export
@defineElement("nav.launchpad-config", {
  styleTexts: [styleText],
})
class LaunchpadConfig extends ReactNextElement implements LaunchpadConfigProps {
  @property({ attribute: false })
  accessor menuGroups: ConfigMenuGroup[] | undefined;

  @property({ attribute: false })
  accessor actions: MenuAction[] | undefined;

  /**
   * @default "launchpad-config"
   */
  @property()
  accessor variant: ConfigVariant | undefined;

  /**
   * 菜单项 APP 类型的链接模板，例如可配置为 `/app/{{ id }}`。
   *
   * 注：仅用于 variant: "menu-config"。
   */
  @property()
  accessor urlTemplate: string | undefined;

  /**
   * 菜单项自定义类型的链接模板，例如可配置为 `/custom?url={{ __pathname }}`。
   *
   * 注：仅用于 variant: "menu-config"。
   *    外链菜单链接会设置为禁用。
   *    `__pathname` 是运行时变量，表示 url 解析后的 pathname。
   */
  @property()
  accessor customUrlTemplate: string | undefined;

  /**
   * 屏蔽的 URL 列表，例如可配置为 `["/app/1", "/app/2"]`。
   *
   * 注：仅用于 variant: "blacklist-config"。
   */
  @property({ attribute: false })
  accessor blacklist: string[] | undefined;

  @event({ type: "action.click" })
  accessor #actionClickEvent!: EventEmitter<MenuActionEventDetail>;

  #onActionClick = (detail: MenuActionEventDetail) => {
    this.#actionClickEvent.emit(detail);
  };

  render() {
    return (
      <LaunchpadConfigComponent
        menuGroups={this.menuGroups}
        actions={this.actions}
        variant={this.variant ?? "launchpad-config"}
        urlTemplate={this.urlTemplate}
        customUrlTemplate={this.customUrlTemplate}
        blacklist={this.blacklist}
        onActionClick={this.#onActionClick}
      />
    );
  }
}

export interface LaunchpadConfigProps {
  menuGroups?: ConfigMenuGroup[];
  actions?: MenuAction[];
  variant?: ConfigVariant;
  urlTemplate?: string;
  customUrlTemplate?: string;
  blacklist?: string[];
}

export interface LaunchpadConfigComponentProps extends LaunchpadConfigProps {
  variant: ConfigVariant;
  onActionClick?: (detail: MenuActionEventDetail) => void;
}

export function LaunchpadConfigComponent({
  menuGroups,
  actions,
  variant,
  urlTemplate,
  customUrlTemplate,
  blacklist,
  onActionClick,
}: LaunchpadConfigComponentProps) {
  const processedMenuGroup = useMemo<ConfigMenuGroup[] | undefined>(() => {
    if (variant === "blacklist-config") {
      return menuGroups?.map((group) => {
        const items = group.items.map((item) =>
          getMenuItemWithBlockInfo(item, blacklist)
        );
        const blockable = items.some((item) => item.blockable);
        const hasBlocked = blockable && items.some((item) => item.hasBlocked);
        const hasUnblocked =
          blockable && items.some((item) => item.hasUnblocked);
        const allBlocked =
          items.length > 0 && items.every((item) => item.allBlocked);
        const blockableUrls = items.flatMap((item) =>
          item.blockable
            ? ((item as ConfigMenuItemDir).blockableUrls ??
              (item as ConfigMenuItemCustom).blockableUrl ??
              (item as ConfigMenuItemApp).url)
            : []
        );
        return {
          ...group,
          type: "group",
          items,
          blockable,
          hasBlocked,
          hasUnblocked,
          allBlocked,
          blockableUrls,
        };
      });
    } else if (variant === "launchpad-config") {
      return getMenuGroupsWithoutBlockedItems(menuGroups)?.filter(Boolean);
    } else {
      return menuGroups;
    }
  }, [variant, menuGroups, blacklist]);

  return (
    <ul className="menu-groups">
      {processedMenuGroup?.map((group) => (
        <MenuGroup
          key={group.instanceId}
          data={group}
          actions={actions}
          variant={variant}
          urlTemplate={urlTemplate}
          customUrlTemplate={customUrlTemplate}
          onActionClick={onActionClick}
        />
      ))}
    </ul>
  );
}

function getMenuGroupsWithoutBlockedItems<T extends ConfigMenuGroup>(
  menuGroups: T[] | undefined
): T[] | undefined {
  return menuGroups
    ?.map<T | null>((group) => {
      const items = group.items
        .map((item) => getMenuItemWithoutBlockedItems(item))
        .filter(Boolean) as ConfigMenuItem[];
      return items.length > 0 ? { ...group, items } : null;
    })
    .filter(Boolean) as T[];
}

function getMenuItemWithoutBlockedItems<T extends ConfigMenuItem>(
  item: T
): T | null {
  if (item.type === "dir") {
    const subItems = item.items
      .map((subItem) => getMenuItemWithoutBlockedItems(subItem))
      .filter(Boolean) as T[];
    return subItems.length > 0 ? { ...item, items: subItems } : null;
  }
  if (item.type === "app") {
    return item.url && auth.isBlockedPath(item.url) ? null : item;
  }
  return item.url && auth.isBlockedHref(item.url) ? null : item;
}

function getMenuItemWithBlockInfo<T extends ConfigMenuItem>(
  item: T,
  blacklist: string[] | undefined
): T {
  if (item.type === "dir") {
    const subItems = item.items.map((subItem) =>
      getMenuItemWithBlockInfo(subItem, blacklist)
    );
    const blockable = subItems.some((subItem) => subItem.blockable);
    const hasBlocked = subItems.some((subItem) => subItem.hasBlocked);
    const hasUnblocked =
      blockable && subItems.some((subItem) => subItem.hasUnblocked);
    const allBlocked =
      subItems.length > 0 && subItems.every((subItem) => subItem.allBlocked);
    const blockableUrls = subItems.flatMap((subItem) =>
      subItem.blockable ? subItem.url : []
    );
    return {
      ...item,
      items: subItems,
      blockable,
      hasBlocked,
      hasUnblocked,
      allBlocked,
      blockableUrls,
    };
  }

  if (item.type === "app") {
    const blockable = !!item.url;
    const hasBlocked = blockable && blacklist?.includes(item.url);
    const hasUnblocked = blockable && !hasBlocked;
    return {
      ...item,
      blockable,
      hasBlocked,
      hasUnblocked,
      allBlocked: hasBlocked,
    };
  }

  const blockable = !!item.url?.startsWith(BASE_PATH);
  const blockableUrl = blockable
    ? item.url.substring(BASE_PATH.length - 1)
    : undefined;
  const hasBlocked = blockable && blacklist?.includes(blockableUrl!);
  const hasUnblocked = blockable && !hasBlocked;
  return {
    ...item,
    blockable,
    hasBlocked,
    hasUnblocked,
    allBlocked: hasBlocked,
    blockableUrl,
  };
}
