import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import Logo from "./images/logo@2x.png";
import styleText from "./styles.shadow.css";

const { defineElement } = createDecorators();

/**
 * 构件 `ai-portal.elevo-logo`
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
