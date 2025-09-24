import React from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import { initializeI18n } from "@next-core/i18n";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { K, NS, locales, t } from "./i18n.js";
import styleText from "./styles.shadow.css";

initializeI18n(NS, locales);

const bgClasses = ["purple", "green", "pink"];

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const { defineElement, property } = createDecorators();

export interface ShowCaseProps {
  caseTitle?: string;
  summary?: string;
  url?: string;
}

/**
 * 构件 `ai-portal.show-case`
 */
export
@defineElement("ai-portal.show-case", {
  styleTexts: [styleText],
})
class ShowCase extends ReactNextElement implements ShowCaseProps {
  @property()
  accessor caseTitle: string | undefined;

  @property()
  accessor summary: string | undefined;

  @property()
  accessor url: string | undefined;

  render() {
    return (
      <ShowCaseComponent
        caseTitle={this.caseTitle}
        summary={this.summary}
        url={this.url}
      />
    );
  }
}

function ShowCaseComponent({ caseTitle, summary, url }: ShowCaseProps) {
  return (
    <WrappedLink
      className={`link ${bgClasses[Math.floor(Math.random() * bgClasses.length)]}`}
      url={url}
    >
      <span className="title">{caseTitle}</span>
      <span className="description">{summary}</span>
      <span className="mask" />
      <span className="button">
        <WrappedIcon lib="easyops" icon="replay" />
        {t(K.WATCH_REPLAY)}
      </span>
    </WrappedLink>
  );
}
