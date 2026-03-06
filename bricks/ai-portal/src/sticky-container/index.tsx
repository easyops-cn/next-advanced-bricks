import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface StickyContainerProps {
  variant?: StickyContainerVariant;
}

export type StickyContainerVariant = "default" | "home";

/**
 * 构件 `ai-portal.sticky-container`
 *
 * 粘性容器构件，使内容在页面滚动时固定在顶部。
 *
 * @slot - 内容
 * @slot header - 头部
 * @slot toolbar - 工具栏
 */
export
@defineElement("ai-portal.sticky-container", {
  styleTexts: [styleText],
})
class StickyContainer extends ReactNextElement implements StickyContainerProps {
  /**
   * 变体风格，通过 CSS attribute selector 控制样式，不触发重新渲染
   * @default "default"
   */
  @property({ render: false })
  accessor variant: StickyContainerVariant | undefined;

  render() {
    return <StickyContainerComponent />;
  }
}

function StickyContainerComponent() {
  return <slot />;
}
