import React, { useEffect } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import { getRuntime } from "@next-core/runtime";
import "@next-core/theme";
import styleText from "./styles.shadow.css";

const { defineElement, property } = createDecorators();

export interface PageContainerProps {
  pageTitle?: string;
  size?: "medium" | "small";
}

/**
 * 构件 `ai-portal.page-container`
 *
 * @slot - 内容
 */
export
@defineElement("ai-portal.page-container", {
  styleTexts: [styleText],
})
class PageContainer extends ReactNextElement implements PageContainerProps {
  @property()
  accessor pageTitle: string | undefined;

  @property({ render: false })
  accessor size: "medium" | "small" | undefined;

  render() {
    return <PageContainerComponent pageTitle={this.pageTitle} />;
  }
}

function PageContainerComponent({ pageTitle }: PageContainerProps) {
  useEffect(() => {
    if (typeof pageTitle === "string") {
      getRuntime().applyPageTitle(pageTitle);
    }
  }, [pageTitle]);

  return (
    <div className="container">
      {pageTitle ? <h1>{pageTitle}</h1> : null}
      <slot />
    </div>
  );
}
