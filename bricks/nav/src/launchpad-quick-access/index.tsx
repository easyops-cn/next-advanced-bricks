import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import { useLaunchpadInfo } from "../launchpad-button-v2/useLaunchpadInfo";
import { LaunchpadsContext } from "../launchpad-button-v2/LaunchpadContext";
import { SidebarMenuItem } from "../launchpad-button-v2/MenuGroup";
import { SidebarMenuItemData } from "../launchpad-button-v2/interfaces";
import { Target } from "@next-bricks/basic/link";

const { defineElement, property } = createDecorators();

/**
 * 快捷访问
 * @insider
 */
export
@defineElement("eo-launchpad-quick-access", {
  styleTexts: [styleText],
})
class EoLaunchpadQuickAccess extends ReactNextElement {
  /**
   * 是否为只读模式（隐藏收藏切换按钮）
   */
  @property({
    type: Boolean,
  })
  accessor readonly: boolean | undefined;

  /**
   * 菜单项链接打开的目标
   */
  @property()
  accessor target: Target | undefined;

  render() {
    return (
      <EoLaunchpadQuickAccessComponent
        readonly={this.readonly}
        target={this.target}
      />
    );
  }
}

interface EoLaunchpadQuickAccessComponentProps {
  readonly?: boolean;
  target?: Target;
}

export function EoLaunchpadQuickAccessComponent({
  readonly,
  target,
}: EoLaunchpadQuickAccessComponentProps) {
  const {
    favorites,
    loadingFavorites,
    pushRecentVisit,
    toggleStar,
    isStarred,
  } = useLaunchpadInfo(true);

  return (
    <LaunchpadsContext.Provider
      value={{
        searching: false,
        loadingFavorites,
        readonly,
        pushRecentVisit,
        toggleStar,
        isStarred,
      }}
    >
      <ul className="quick-access-list">
        {favorites.map((item, index) => (
          <SidebarMenuItem
            key={index}
            target={target}
            item={item as SidebarMenuItemData}
          />
        ))}
      </ul>
    </LaunchpadsContext.Provider>
  );
}
