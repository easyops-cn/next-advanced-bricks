import React, { use, useMemo } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime, type Options } from "hast-util-to-jsx-runtime";
import { toString } from "hast-util-to-string";
import type { Element } from "hast";
import { codeToHast } from "@next-shared/shiki";
import { httpErrorToString } from "@next-core/runtime";
import { CodeBlock } from "../cruise-canvas/CodeBlock/CodeBlock";

const production = { Fragment, jsx, jsxs } as Options;

const THEME = "light-plus";

export interface CodeDisplayProps {
  language: string;
  source: string;
  disabled?: boolean;
}

export function CodeDisplay({ source, language }: CodeDisplayProps) {
  const renderPromise = useMemo(
    () =>
      renderCodeBlock(source, language).catch((error) => (
        <div style={{ color: "var(--color-error)" }}>
          {httpErrorToString(error)}
        </div>
      )),
    [language, source]
  );

  return use(renderPromise);
}

async function renderCodeBlock(source: string, language: string) {
  const isMarkdown = language === "markdown" || language === "md";
  const hast = await codeToHast(source, {
    lang: language,
    theme: THEME,
    transformers: isMarkdown
      ? [
          {
            pre(node) {
              const string = toString(node);
              if (/^(?:`{3,})mermaid\b/.test(string)) {
                const root = this.codeToHast(string, {
                  lang: "mermaid",
                  theme: THEME,
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
      pre: CodeBlock,
    },
  });
}
