import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import styleText from "./workbench-sidebar.shadow.css";

interface WorkbenchSidebarProps {
  titleLabel: string;
  refCallback: (element: HTMLDivElement) => void;
}
interface WorkbenchSidebarChildElement extends HTMLElement {
  active?: boolean;
  activeFlex?: string;
}

const { defineElement, property } = createDecorators();

/**
 * 工作台侧边栏容器，包含标题栏和面板容器，自动管理子面板（workbench-pane）的展开/折叠布局
 * @insider
 */
@defineElement("visual-builder.workbench-sidebar", {
  styleTexts: [styleText],
})
class WorkbenchSidebar extends ReactNextElement {
  /** 侧边栏标题文本 */
  @property() accessor titleLabel: string | undefined;

  #getPaneSlot = (): HTMLSlotElement => {
    return this.shadowRoot?.querySelector("slot:not([name])");
  };

  #reflowPanes = (): void => {
    const slot = this.#getPaneSlot();
    const panes = slot.assignedNodes() as WorkbenchSidebarChildElement[];

    for (const pane of panes) {
      if (pane.active) {
        pane.style.flex = String(pane.activeFlex ?? "1");
      } else {
        pane.style.flex = "initial";
      }
    }
  };

  #onPanesSlotChange = (event: Event): void => {
    const slot = event.target as HTMLSlotElement;
    const panes = slot.assignedNodes();
    for (const pane of panes) {
      pane.addEventListener("active.change", this.#reflowPanes);
    }
  };

  refCallback = () => {
    this.#reflowPanes();
    const panesSlots = this.#getPaneSlot();

    panesSlots?.addEventListener("slotchange", (e) => {
      this.#onPanesSlotChange(e);
    });
  };

  render() {
    return (
      <WorkbenchSidebarComponent
        titleLabel={this.titleLabel}
        refCallback={this.refCallback}
      />
    );
  }
}

function WorkbenchSidebarComponent({
  titleLabel,
  refCallback,
}: WorkbenchSidebarProps) {
  return (
    <div className="sidebar" ref={refCallback}>
      <div className="title-container">
        <div className="title-label">{titleLabel}</div>
        <slot name="titleToolbar" />
      </div>
      <div className="pane-container">
        <slot />
      </div>
    </div>
  );
}

export { WorkbenchSidebar };
