import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import logoImage from "./images/logo@2x.png";
import styleText from "./styles.shadow.css";

const { defineElement } = createDecorators();

/**
 * Elevo Logo
 */
export
@defineElement("ai-portal.elevo-logo", {
  styleTexts: [styleText],
})
class ElevoLogo extends ReactNextElement {
  render() {
    return <ElevoLogoComponent />;
  }
}

function ElevoLogoComponent() {
  return <img src={logoImage} width={81} height={22} />;
}
