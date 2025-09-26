import React, { useMemo } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { useCurrentTheme } from "@next-core/react-runtime";
import "@next-core/theme";
import {
  MarkdownComponent,
  type MarkdownComponentProps,
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
    />
  );
}
