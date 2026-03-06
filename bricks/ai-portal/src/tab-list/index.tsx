import React from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import classNames from "classnames";
import styleText from "./styles.shadow.css";

const { defineElement, property, event } = createDecorators();

export interface TabListProps {
  tabs?: Tab[];
  activeTab?: string;
}

export interface Tab {
  id: string;
  label: string;
}

export interface TabListEvents {
  "tab.click": CustomEvent<Tab>;
}

export interface TabListMapping {
  onTabClick: "tab.click";
}

/**
 * 构件 `ai-portal.tab-list`
 *
 * 标签页列表构件，展示可切换的标签页，点击后触发事件并自动更新选中状态。
 *
 * @part tabs - The tab list container
 * @part tab - The individual tab
 */
export
@defineElement("ai-portal.tab-list", {
  styleTexts: [styleText],
})
class TabList extends ReactNextElement implements TabListProps {
  /** 标签页配置列表，每项包含 id 和 label */
  @property({ attribute: false })
  accessor tabs: Tab[] | undefined;

  /** 当前激活的标签页 id */
  @property({ attribute: false })
  accessor activeTab: string | undefined;

  /**
   * @description 点击标签页时触发，同时自动更新 activeTab
   * @detail { id: 标签页ID, label: 标签页标题 }
   */
  @event({ type: "tab.click" })
  accessor #tabClick!: EventEmitter<Tab>;

  #handleTabClick = (tab: Tab) => {
    this.activeTab = tab.id;
    this.#tabClick.emit(tab);
  };

  render() {
    return (
      <TabListComponent
        tabs={this.tabs}
        activeTab={this.activeTab}
        onTabClick={this.#handleTabClick}
      />
    );
  }
}

interface TabListComponentProps extends TabListProps {
  onTabClick: (tab: Tab) => void;
}

function TabListComponent({
  tabs,
  activeTab,
  onTabClick,
}: TabListComponentProps) {
  return (
    <ul className="tabs" part="tabs">
      {tabs?.map((tab) => (
        <li
          key={tab.id}
          part="tab"
          className={classNames("tab", { active: tab.id === activeTab })}
        >
          <a onClick={() => onTabClick(tab)}>{tab.label}</a>
        </li>
      ))}
    </ul>
  );
}
