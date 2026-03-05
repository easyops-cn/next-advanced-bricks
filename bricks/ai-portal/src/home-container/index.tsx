import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface HomeContainerProps {
  sticky?: boolean;
}

/**
 * AI Portal 首页容器，通过 sticky 属性控制顶部吸附行为，内容通过默认插槽传入。
 *
 * @category layout-component
 * @slot default - 页面内容区域
 */
export
@defineElement("ai-portal.home-container", {
  styleTexts: [styleText],
})
class HomeContainer extends ReactNextElement implements HomeContainerProps {
  @property({ type: Boolean, render: false })
  accessor sticky: boolean | undefined;

  render() {
    return <HomeContainerComponent />;
  }
}

export function HomeContainerComponent() {
  return <slot />;
}
