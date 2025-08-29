import React, { useEffect } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { getRuntime } from "@next-core/runtime";
import "@next-core/theme";
import type { Link, LinkProps } from "@next-bricks/basic/link";
import styleText from "./styles.shadow.css";

export const WrappedLink = wrapBrick<Link, LinkProps>("eo-link");

const { defineElement, property } = createDecorators();

export interface PageContainerProps {
  pageTitle?: string;
  breadcrumbs?: Breadcrumb[];
  size?: "medium" | "small";
}

export interface Breadcrumb {
  text: string;
  url: string;
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

  @property({ attribute: false })
  accessor breadcrumbs: Breadcrumb[] | undefined;

  @property({ render: false })
  accessor size: "medium" | "small" | undefined;

  render() {
    return (
      <PageContainerComponent
        pageTitle={this.pageTitle}
        breadcrumbs={this.breadcrumbs}
      />
    );
  }
}

function PageContainerComponent({
  breadcrumbs,
  pageTitle,
}: PageContainerProps) {
  useEffect(() => {
    if (typeof pageTitle === "string") {
      getRuntime().applyPageTitle(pageTitle);
    }
  }, [pageTitle]);

  return (
    <div className="container">
      {pageTitle || breadcrumbs?.length ? (
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
      ) : null}
      <slot />
    </div>
  );
}
