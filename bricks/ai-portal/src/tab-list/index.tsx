import React, { useEffect, useState } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import classNames from "classnames";
import { throttle } from "lodash";
import styleText from "./styles.shadow.css";

const { defineElement, property, event } = createDecorators();

export interface TabListProps {
  tabs?: Tab[];
  activeTab?: string;
  sticky?: boolean;
  stickyThreshold?: number;
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

  @property()
  accessor activeTab: string | undefined;

  @property({ type: Boolean })
  accessor sticky: boolean | undefined;

  /**
   * When the element's bounding client rect top is less than threshold,
   * enabled sticky active style.
   *
   * @default 16
   */
  @property({ type: Number })
  accessor stickyThreshold: number | undefined;

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
        sticky={this.sticky}
        stickyThreshold={this.stickyThreshold}
        onTabClick={this.#handleTabClick}
        root={this}
      />
    );
  }
}

interface TabListComponentProps extends TabListProps {
  root: HTMLElement;
  onTabClick: (tab: Tab) => void;
}

function TabListComponent({
  tabs,
  activeTab,
  sticky,
  stickyThreshold: _stickyThreshold,
  root,
  onTabClick,
}: TabListComponentProps) {
  const [stickyActive, setStickyActive] = useState(false);
  const stickyThreshold = _stickyThreshold ?? 16;

  useEffect(() => {
    setStickyActive(false);
    if (!sticky) {
      return;
    }
    const parent = getVerticalScrollParent(root);
    if (parent) {
      const onScroll = throttle(
        () => {
          const rect = root.getBoundingClientRect();
          setStickyActive(rect.top < stickyThreshold);
        },
        100,
        { leading: false }
      );
      parent.addEventListener("scroll", onScroll);
      return () => {
        parent.removeEventListener("scroll", onScroll);
      };
    }
  }, [sticky, stickyThreshold, root]);

  return (
    <ul className={classNames("tabs", { sticky: stickyActive })} part="tabs">
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

function getVerticalScrollParent(element: Element): Element | null {
  if (!element) return null;

  let parent = element.parentNode;

  while (parent) {
    if (parent instanceof ShadowRoot) {
      parent = parent.host;
    }
    if (!(parent instanceof Element)) {
      break;
    }
    const style = getComputedStyle(parent);
    const overflowY = style.overflowY;
    const isScrollableY = overflowY === "auto" || overflowY === "scroll";

    if (isScrollableY) {
      return parent;
    }
    parent = parent.parentNode;
  }

  // If none found, fallback to window
  return document.scrollingElement || document.documentElement;
}
