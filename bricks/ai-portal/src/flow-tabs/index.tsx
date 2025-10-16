import React, { useEffect, useRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import classNames from "classnames";
import ResizeObserver from "resize-observer-polyfill";
import styleText from "./styles.shadow.css";
import drawBg from "./drawBg";

const { defineElement, property, event } = createDecorators();

export interface FlowTabsProps {
  tabs?: Tab[];
  activeTab?: string;
}

export interface Tab {
  id: string;
  label: string;
}

type SizeTuple = [width: number, height: number];

/**
 * 构件 `ai-portal.flow-tabs`
 */
export
@defineElement("ai-portal.flow-tabs", {
  styleTexts: [styleText],
})
class FlowTabs extends ReactNextElement implements FlowTabsProps {
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
      <FlowTabsComponent
        tabs={this.tabs}
        activeTab={this.activeTab}
        onTabClick={this.#handleTabClick}
      />
    );
  }
}

interface FlowTabsComponentProps extends FlowTabsProps {
  onTabClick: (tab: Tab) => void;
}

function FlowTabsComponent({
  tabs,
  activeTab,
  onTabClick,
}: FlowTabsComponentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const tabsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = bgRef.current;
    const nav = tabsRef.current;
    if (!root || !canvas || !nav || !tabs?.length) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rootSize: SizeTuple | undefined;

    let requestId: number | undefined;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === root) {
          const width = getContentBoxSize(entry, "width");
          const height = getContentBoxSize(entry, "height");
          rootSize = [width, height];
        }
      }

      const firstTabWidth = nav
        .querySelector(".tab")!
        .getBoundingClientRect().width;
      const tabElements = Array.from(nav.querySelectorAll(".tab"));
      const activeTabElement = tabElements.find((tab) =>
        tab.classList.contains("active")
      );
      const activeTabIndex = activeTabElement
        ? tabElements.indexOf(activeTabElement)
        : 0;
      const isFirstTab = activeTabIndex === 0;
      let tabOffset = 0;
      if (!isFirstTab) {
        const tabsOffset = nav.getBoundingClientRect().left;
        const activeTabOffset = activeTabElement!.getBoundingClientRect().left;
        tabOffset = activeTabOffset - tabsOffset;
      }

      if (requestId) {
        cancelAnimationFrame(requestId);
      }
      requestId = requestAnimationFrame(() => {
        if (rootSize) {
          drawBg(
            canvas,
            ctx,
            rootSize[0],
            rootSize[1],
            isFirstTab,
            tabOffset,
            firstTabWidth
          );
        }
      });
    });
    observer.observe(root);
    observer.observe(nav);
    return () => {
      observer.disconnect();
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [tabs, activeTab]);

  return (
    <div className="container" ref={rootRef}>
      <canvas className="bg" ref={bgRef} />
      <div className="header">
        <ul className="tabs" ref={tabsRef}>
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
        <div className="toolbar">
          <slot name="toolbar" />
        </div>
      </div>
      <div className="body">
        <slot />
      </div>
    </div>
  );
}

// istanbul ignore next: compatibility code
function getContentBoxSize(
  entry: ResizeObserverEntry,
  type: "width" | "height"
): number {
  const boxSizeType = type === "height" ? "blockSize" : "inlineSize";
  const size = entry.contentBoxSize
    ? entry.contentBoxSize[0]
      ? entry.contentBoxSize[0][boxSizeType]
      : (entry.contentBoxSize as unknown as ResizeObserverSize)[boxSizeType]
    : entry.contentRect[type];
  return size;
}
