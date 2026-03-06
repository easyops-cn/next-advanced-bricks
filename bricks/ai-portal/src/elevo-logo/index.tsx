import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import Logo from "./images/logo@2x.png";
import styleText from "./styles.shadow.css";

const { defineElement } = createDecorators();

/**
 * Elevo 品牌 Logo 图片组件，固定展示 Elevo logo（95×28px）。
 *
 * @category display-component
 */
export
@defineElement("ai-portal.elevo-logo", {
  styleTexts: [styleText],
})
class ElevoLogo extends ReactNextElement {
  render() {
    return (
      <img className="logo" alt="Elevo" src={Logo} width={95} height={28} />
    );
  }
}
