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
 * @part tabs - The tab list container
 * @part tab - The individual tab
 */
export
@defineElement("ai-portal.tab-list", {
  styleTexts: [styleText],
})
class TabList extends ReactNextElement implements TabListProps {
  @property({ attribute: false })
  accessor tabs: Tab[] | undefined;

  @property({ attribute: false })
  accessor activeTab: string | undefined;

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
