import React, { useMemo } from "react";
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
  const bgClass = useMemo(() => {
    // Get a deterministic class based on the caseTitle
    if (!caseTitle) return bgClasses[0];
    let hash = 0;
    for (let i = 0; i < caseTitle.length; i++) {
      hash = caseTitle.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % bgClasses.length;
    return bgClasses[index];
  }, [caseTitle]);

  return (
    <WrappedLink className={`link ${bgClass}`} url={url}>
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
