import React, { useEffect, useState } from "react";
import { createDecorators } from "@next-core/element";
import { ReactNextElement, wrapBrick } from "@next-core/react-element";
import { useCurrentTheme } from "@next-core/react-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime, type Options } from "hast-util-to-jsx-runtime";
import { toString } from "hast-util-to-string";
import type { Element } from "hast";
import { codeToHast } from "@next-shared/shiki";
import { httpErrorToString } from "@next-core/runtime";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import "@next-core/theme";
import type { CodeWrapper, CodeWrapperProps } from "../code-wrapper";
import styleText from "./styles.shadow.css";

const production = { Fragment, jsx, jsxs } as Options;

export const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedCodeWrapper = wrapBrick<CodeWrapper, CodeWrapperProps>(
  "presentational.code-wrapper"
);

const { defineElement, property } = createDecorators();

export interface CodeBlockProps {
  language?: string;
  source?: string;
  theme?: "auto" | "light-plus" | "dark-plus";
  themeVariant?: "default" | "elevo";
  showCopyButton?: boolean;
}

/**
 * 构件 `presentational.code-block`
 *
 * @part pre - 包裹代码内容的 `<pre>` 元素
 * @part copy - 复制按钮
 * @part mermaid - Mermaid 图表
 * @part wrapper - code-wrapper 构件
 */
export
@defineElement("presentational.code-block", {
  styleTexts: [styleText],
})
class CodeBlock extends ReactNextElement implements CodeBlockProps {
  @property()
  accessor language: string | undefined;

  @property()
  accessor source: string | undefined;

  /** @default "auto" */
  @property()
  accessor theme: "auto" | "light-plus" | "dark-plus" | undefined;

  /**
   * 主题变体
   */
  @property()
  accessor themeVariant: "default" | "elevo" | undefined;

  /**
   * 是否展示复制按钮
   * @default true
   */
  @property({ type: Boolean })
  accessor showCopyButton: boolean | undefined;

  render() {
    return (
      <CodeBlockComponent
        language={this.language}
        source={this.source}
        theme={this.theme}
        themeVariant={this.themeVariant}
        showCopyButton={this.showCopyButton}
      />
    );
  }
}

/**
 * NOTE: This component uses React's experimental `use` hook to handle async rendering.
 *
 * Ensure wrapping it with <Suspense> in the parent component.
 */
function CodeBlockComponent({
  language,
  source,
  theme: __theme,
  themeVariant,
  showCopyButton,
}: CodeBlockProps) {
  const [loading, setLoading] = useState(true);
  const [node, setNode] = useState<React.ReactNode>(null);

  const systemTheme = useCurrentTheme();
  const _theme = __theme ?? "auto";
  const theme =
    _theme === "auto"
      ? systemTheme === "dark-v2"
        ? "dark-plus"
        : "light-plus"
      : _theme;

  useEffect(() => {
    let ignore = false;
    (async () => {
      const node = await renderCodeBlock(
        source,
        language,
        theme,
        themeVariant,
        showCopyButton
      ).catch((error) => (
        <div style={{ color: "var(--color-error)" }}>
          {httpErrorToString(error)}
        </div>
      ));
      if (ignore) return;
      setNode(node);
      setLoading(false);
    })();
    return () => {
      ignore = true;
    };
  }, [language, showCopyButton, source, theme, themeVariant]);

  return loading ? (
    <WrappedIcon
      lib="lucide"
      icon="loader-circle"
      className="loading"
      spinning
    />
  ) : (
    node
  );
}

async function renderCodeBlock(
  source: string,
  language: string,
  themeToUse: "light-plus" | "dark-plus",
  themeVariant?: "default" | "elevo",
  showCopyButton?: boolean
) {
  const isMarkdown = language === "markdown" || language === "md";

  const hast = await codeToHast(source, {
    lang: language,
    theme: themeToUse,
    transformers: isMarkdown
      ? [
          {
            pre(node) {
              const string = toString(node);
              if (/^(?:`{3,})mermaid\b/.test(string)) {
                const root = this.codeToHast(string, {
                  lang: "mermaid",
                  theme: themeToUse,
                });
                const pre = root.children.find(
                  (child) => child.type === "element" && child.tagName === "pre"
                ) as Element;
                return pre;
              }
            },
          },
        ]
      : undefined,
  });
  return toJsxRuntime(hast, {
    ...production,
    components: {
      pre: function Pre({ node, ...props }) {
        return (
          <WrappedCodeWrapper
            preProps={props}
            showCopyButton={
              showCopyButton !== false && !!props.className?.includes("shiki")
            }
            themeVariant={themeVariant}
            part="wrapper"
            exportparts="pre, copy, mermaid"
          />
        );
      },
    },
  });
}
