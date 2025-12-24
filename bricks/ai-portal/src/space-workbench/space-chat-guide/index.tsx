import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import { SpaceGuide } from "./SpaceGuide.js";
import styleText from "./styles.shadow.css";

import { SpaceDetail } from "../interfaces.js";

initializeI18n(NS, locales);

const { defineElement, property } = createDecorators();

export interface SpaceChatGuideProps {
  spaceDetail: SpaceDetail;
}

/**
 * 构件 `ai-portal.space-chat-guide`
 */
export
@defineElement("ai-portal.space-chat-guide", {
  styleTexts: [styleText],
})
class SpaceChatGuide extends ReactNextElement implements SpaceChatGuideProps {
  @property({ attribute: false })
  accessor spaceDetail!: SpaceDetail;

  render() {
    return <SpaceGuide spaceDetail={this.spaceDetail} />;
  }
}
