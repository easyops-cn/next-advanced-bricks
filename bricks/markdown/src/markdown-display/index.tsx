import React, { useMemo } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { getBasePath } from "@next-core/runtime";
import { useCurrentTheme } from "@next-core/react-runtime";
import "@next-core/theme";
import {
  MarkdownComponent,
  type Element,
  type MarkdownComponentProps,
  type RehypeExternalLinksOptions,
} from "@next-shared/markdown";
import {
  CodeWrapper,
  type CodeWrapperProps,
} from "@next-bricks/presentational/code-wrapper";
import styleText from "./styles.shadow.css";
import "./host-context.css";

const WrappedCodeWrapper = wrapBrick<CodeWrapper, CodeWrapperProps>(
  "presentational.code-wrapper"
);

const { defineElement, property } = createDecorators();

export interface MarkdownDisplayProps {
  content?: string;
  themeVariant?: "default" | "elevo";
}

const externalLinks: RehypeExternalLinksOptions = {
  target: "_blank",
  rel: ["nofollow", "noopener", "noreferrer"],
  test: (element: Element) => {
    return isExternalLink(element.properties.href);
  },
  content(element) {
    if (containsImg(element)) {
      return;
    }
    return {
      type: "element",
      tagName: "eo-icon",
      properties: {
        lib: "lucide",
        icon: "external-link",
      },
      children: [],
    };
  },
  contentProperties: {
    className: "external-link-icon",
  },
};

/**
 * 用于展示 markdown 内容的构件。
 */
export
@defineElement("eo-markdown-display", {
  styleTexts: [styleText],
})
class MarkdownDisplay extends ReactNextElement implements MarkdownDisplayProps {
  @property()
  accessor content: string | undefined;

  /**
   * 主题变体
   */
  @property()
  accessor themeVariant: "default" | "elevo" | undefined;

  render() {
    return (
      <MarkdownDisplayComponent
        content={this.content}
        themeVariant={this.themeVariant}
      />
    );
  }
}

function MarkdownDisplayComponent({
  content,
  themeVariant,
}: MarkdownDisplayProps) {
  const systemTheme = useCurrentTheme();
  const shikiOptions = useMemo<MarkdownComponentProps["shiki"]>(
    () => ({
      theme: systemTheme === "dark-v2" ? "dark-plus" : "light-plus",
    }),
    [systemTheme]
  );

  const components = useMemo<MarkdownComponentProps["components"]>(
    () => ({
      pre: function Pre({ node, ...props }) {
        return (
          <WrappedCodeWrapper
            preProps={props}
            showCopyButton={!!props.className?.includes("shiki")}
            themeVariant={themeVariant}
            exportparts="pre, copy, mermaid"
          />
        );
      },
    }),
    [themeVariant]
  );

  return (
    <MarkdownComponent
      content={content}
      components={components}
      shiki={shikiOptions}
      externalLinks={externalLinks}
    />
  );
}

function containsImg(element: Element): boolean {
  return element.children.some((child) => {
    if (child.type === "element") {
      return child.tagName === "img" || containsImg(child);
    }
    return false;
  });
}

function isExternalLink(href: unknown): boolean {
  if (typeof href !== "string") {
    return false;
  }
  try {
    const url = new URL(href, `${location.origin}${getBasePath()}`);
    return url.origin !== location.origin;
  } catch {
    return true;
  }
}
