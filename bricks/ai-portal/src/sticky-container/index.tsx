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
