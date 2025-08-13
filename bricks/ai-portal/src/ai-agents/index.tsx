import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

const DEFAULT_TOOL_ICON: GeneralIconProps = {
  lib: "antd",
  icon: "tool",
};

initializeI18n(NS, locales);

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");

const { defineElement, property } = createDecorators();

export interface AIAgentsProps {
  list?: Agent[];
}

export interface Agent {
  name: string;
  description: string;
  icon?: GeneralIconProps;
  tags?: string[];
}

/**
 * 构件 `ai-portal.ai-agents`
 */
export
@defineElement("ai-portal.ai-agents", {
  styleTexts: [styleText],
})
class AIAgents extends ReactNextElement implements AIAgentsProps {
  @property({ attribute: false })
  accessor list: Agent[] | undefined;

  render() {
    return <AIAgentsComponent list={this.list} />;
  }
}

function AIAgentsComponent({ list }: AIAgentsProps) {
  return (
    <div className="container">
      <h1>{t(K.AGENTS)}</h1>
      <ul className="list">
        {list?.map((item, index) => (
          <li key={index} className="item">
            <div className="heading">
              <div className="icon">
                <WrappedIcon
                  {...(item.icon ?? DEFAULT_TOOL_ICON)}
                  fallback={DEFAULT_TOOL_ICON}
                />
              </div>
              <div className="title">{item.name}</div>
            </div>
            <div className="tags">
              {item.tags?.map((tag, tagIndex) => (
                <span key={tagIndex} className="tag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="description">{item.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
