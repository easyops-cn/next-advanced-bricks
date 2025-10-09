import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

/**
 * 构件 `ai-portal.home-container`
 */
export
@defineElement("ai-portal.home-container", {
  styleTexts: [styleText],
})
class HomeContainer extends ReactNextElement {
  @property({ type: Boolean, render: false })
  accessor sticky: boolean | undefined;

  render() {
    return <HomeContainerComponent />;
  }
}

export function HomeContainerComponent() {
  return <slot />;
}
