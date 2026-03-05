import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import styleText from "./styles.shadow.css";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";

initializeI18n(NS, locales);

const { defineElement, property } = createDecorators();
const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

export interface ChatPanelWelcomeProps {
  text?: string;
}

/**
 * 构件 `ai-portal.chat-panel-welcome`
 *
 * 聊天面板欢迎语构件，展示带有 Elevo 头像的欢迎消息。
 */
export
@defineElement("ai-portal.chat-panel-welcome", {
  styleTexts: [styleText],
})
class ChatPanelWelcome
  extends ReactNextElement
  implements ChatPanelWelcomeProps
{
  /** 欢迎语文本内容 */
  @property()
  accessor text: string | undefined;

  render() {
    return <ChatPanelWelcomeComponent text={this.text} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ChatPanelWelcomeComponentProps extends ChatPanelWelcomeProps {}

function ChatPanelWelcomeComponent({ text }: ChatPanelWelcomeComponentProps) {
  return (
    <div className="welcome-container">
      <div className="header">
        <WrappedIcon
          icon="elevo-avatar-png"
          lib="easyops"
          category="image"
          className="avatar"
        />
        <span className="title">Elevo</span>
      </div>
      <div className="content">{text}</div>
    </div>
  );
}
