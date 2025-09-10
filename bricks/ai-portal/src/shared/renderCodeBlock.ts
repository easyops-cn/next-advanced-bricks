import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime, type Options } from "hast-util-to-jsx-runtime";
import { toString } from "hast-util-to-string";
import type { Element } from "hast";
import { highlighter } from "@next-shared/shiki";
import { CodeBlock } from "../cruise-canvas/CodeBlock/CodeBlock";

const production = { Fragment, jsx, jsxs } as Options;

export function renderCodeBlock(source: string, language: string) {
  const hast = highlighter.codeToHast(source, {
    lang: language,
    theme: "light-plus",
    transformers: [
      {
        pre(node) {
          const string = toString(node);
          if (/^(?:`{3,})mermaid\b/.test(string)) {
            const root = this.codeToHast(string, {
              lang: "mermaid",
              theme: "light-plus",
            });
            const pre = root.children.find(
              (child) => child.type === "element" && child.tagName === "pre"
            ) as Element;
            return pre;
          }
        },
      },
    ],
  });
  return toJsxRuntime(hast, {
    ...production,
    components: {
      pre: CodeBlock,
    },
  });
}
