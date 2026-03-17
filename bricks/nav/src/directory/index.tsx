import React from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import classNames from "classnames";
import type { EoTooltip, ToolTipProps } from "@next-bricks/basic/tooltip";
import { UseBrickConfOrRenderFunction } from "@next-core/react-runtime";

const { defineElement, property, event } = createDecorators();
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedTooltip = wrapBrick<EoTooltip, ToolTipProps>("eo-tooltip");

/**
 * 目录
 */
export
@defineElement("eo-directory", {
  styleTexts: [styleText],
})
class EoDirectory extends ReactNextElement implements EoDirectoryProps {
  /**
   * 设置定位方式：静态定位或固定定位。
   *
   * @default "fixed"
   */
  @property()
  accessor position: "static" | "fixed" = "fixed";

  /**
   * 目录标题
   */
  @property()
  accessor directoryTitle: string | undefined;

  /**
   * 菜单数据
   * @default []
   * @required
   */
  @property({ attribute: false })
  accessor menuItems: MenuItem[] = [];

  /**
   * 是否隐藏右边线
   */
  @property({ type: Boolean })
  accessor hideRightBorder: boolean = false;

  /**
   * 后缀 useBrick
   */
  @property({
    attribute: false,
  })
  accessor suffixBrick: { useBrick: UseBrickConfOrRenderFunction } | undefined;

  /**
   * 默认选中高亮的菜单项
   */
  @property({ attribute: false })
  accessor defaultSelectedKeys: string[] | undefined;
  /**
   * @description 菜单项点击时触发
   * @detail { groupKey: 对应分组的 key（仅分组子项有值）, data: 被点击的菜单项 }
   */
  @event({ type: "menu.item.click" })
  accessor #menuItemClickEvent!: EventEmitter<MenuItemClickEventDetail>;
  /**
   * @description 点击菜单项后缀图标时触发
   * @detail { key: 对应菜单项或分组的 key }
   */
  @event({ type: "suffix.icon.click" })
  accessor #suffixIconClickEvent!: EventEmitter<{ key: string }>;

  #menuItemClick = (data: MenuItemClickEventDetail) => {
    this.#menuItemClickEvent.emit(data);
  };
  #suffixIconClick = (key: string) => {
    this.#suffixIconClickEvent.emit({ key });
  };

  render() {
    return (
      <EoDirectoryComponent
        menuItems={this.menuItems}
        directoryTitle={this.directoryTitle}
        hideRightBorder={this.hideRightBorder}
        suffixIconClick={this.#suffixIconClick}
        menuItemClick={this.#menuItemClick}
        defaultSelectedKeys={this.defaultSelectedKeys}
        suffixBrick={this.suffixBrick}
      />
    );
  }
}
export interface EoDirectoryProps {
  position?: "static" | "fixed";
  suffixBrick?: { useBrick: UseBrickConfOrRenderFunction };
  directoryTitle: string | undefined;
  menuItems: MenuItem[];
  hideRightBorder?: boolean;
  menuItemClick?: (data: MenuItemClickEventDetail) => void;
  suffixIconClick?: (key: string) => void;
  defaultSelectedKeys?: string[] | undefined;
}

export interface EoDirectoryEventsMapping {
  onMenuItemClick: "menu.item.click";
  onSuffixIconClick: "suffix.icon.click";
}
interface MenuChildrenItem {
  title: string;
  key: string;
  [key: string]: any;
}
interface MenuItem {
  title: string;
  key: string;
  type: "group" | "item";
  children?: MenuChildrenItem[];
  suffixIcon?: GeneralIconProps;
  suffixIconTooltip?: string;
  suffixIconDisabled?: boolean;
}
interface MenuItemClickEventDetail {
  data: MenuChildrenItem;
  groupKey?: string;
}

export function EoDirectoryComponent(props: EoDirectoryProps) {
  const {
    menuItems,
    directoryTitle,
    hideRightBorder,
    menuItemClick,
    suffixIconClick,
    defaultSelectedKeys,
    suffixBrick,
  } = props;

  return (
    <div
      className={classNames("directory-container", {
        "directory-container-not-border": hideRightBorder,
      })}
    >
      {directoryTitle && (
        <div className="directory-title" title={directoryTitle}>
          {directoryTitle}
        </div>
      )}
      <div className="directory-menu-list">
        {menuItems.map((item, index) => {
          return (
            <div
              className={classNames("menu-item", `menu-item-${item.type}`)}
              key={`${item.key}-${index}`}
            >
              <div
                className={classNames(`menu-item-title-${item.type}`)}
                onClick={() =>
                  item.type === "item" && menuItemClick?.({ data: item })
                }
              >
                <span
                  className={classNames("menu-title-text", {
                    "menu-title-text-active": defaultSelectedKeys?.includes(
                      item.key
                    ),
                  })}
                >
                  {item.title}
                </span>
                {suffixBrick?.useBrick ? (
                  <ReactUseMultipleBricks
                    useBrick={suffixBrick.useBrick}
                    data={{ data: item }}
                  />
                ) : null}
                {item.suffixIcon && (
                  <WrappedTooltip
                    content={item.suffixIconTooltip}
                    placement="top"
                  >
                    <WrappedIcon
                      {...(item.suffixIcon as GeneralIconProps)}
                      className={classNames("menu-item-title-suffix-icon", {
                        "menu-item-title-suffix-icon-disabled":
                          item.suffixIconDisabled,
                      })}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.suffixIconDisabled) {
                          e.preventDefault();
                        } else {
                          suffixIconClick?.(item.key);
                        }
                      }}
                    />
                  </WrappedTooltip>
                )}
              </div>
              {item.type === "group" &&
                !!item.children?.length &&
                item.children.map((child, i) => {
                  return (
                    <div
                      className="menu-item-title-item"
                      onClick={() =>
                        menuItemClick?.({ data: child, groupKey: item.key })
                      }
                      key={`${child.key}-${i}`}
                    >
                      <span
                        className={classNames("menu-title-text", {
                          "menu-title-text-active":
                            defaultSelectedKeys?.includes(child.key),
                        })}
                      >
                        {child.title}
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
