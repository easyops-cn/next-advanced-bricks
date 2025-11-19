import React, { useEffect } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { getRuntime } from "@next-core/runtime";
import "@next-core/theme";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import styleText from "./styles.shadow.css";
import type {
  StickyContainer,
  StickyContainerProps,
} from "../sticky-container/index.js";

const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");
const WrappedStickyContainer = wrapBrick<StickyContainer, StickyContainerProps>(
  "ai-portal.sticky-container"
);

const { defineElement, property } = createDecorators();

export interface PageContainerProps {
  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
  size?: "medium" | "small" | "full";
  variant?: "default" | "form";
  sticky?: boolean;
}

export interface Breadcrumb {
  text: string;
  url: string;
}

/**
 * 构件 `ai-portal.page-container`
 *
 * @slot - 内容
 * @slot toolbar - 工具栏
 */
export
@defineElement("ai-portal.page-container", {
  styleTexts: [styleText],
})
class PageContainer extends ReactNextElement implements PageContainerProps {
  @property()
  accessor pageTitle: string | undefined;

  @property({ attribute: false })
  accessor breadcrumbs: Breadcrumb[] | undefined;

  @property({ render: false })
  accessor size: "medium" | "small" | "full" | undefined;

  @property({ render: false })
  accessor variant: "default" | "form" | undefined;

  @property({ type: Boolean })
  accessor sticky: boolean | undefined;

  render() {
    return (
      <PageContainerComponent
        pageTitle={this.pageTitle}
        breadcrumbs={this.breadcrumbs}
        sticky={this.sticky}
      />
    );
  }
}

function PageContainerComponent({
  breadcrumbs,
  pageTitle,
  sticky,
}: PageContainerProps) {
  useEffect(() => {
    if (typeof pageTitle === "string") {
      getRuntime().applyPageTitle(pageTitle);
    }
  }, [pageTitle]);

  const header =
    pageTitle || breadcrumbs?.length ? (
      <div className="header">
        <nav>
          {breadcrumbs?.length ? (
            <ul className="breadcrumbs">
              {breadcrumbs.map((item, index) => (
                <li key={index}>
                  <WrappedLink url={item.url}>{item.text}</WrappedLink>
                </li>
              ))}
            </ul>
          ) : null}
          {pageTitle ? <h1>{pageTitle}</h1> : null}
        </nav>
        <div className="toolbar">
          <slot name="toolbar" />
        </div>
      </div>
    ) : null;

  return (
    <div className="container">
      {header && sticky ? (
        <WrappedStickyContainer className="sticky-header">
          {header}
        </WrappedStickyContainer>
      ) : (
        <div className="non-sticky-header">{header}</div>
      )}
      <slot />
    </div>
  );
}
