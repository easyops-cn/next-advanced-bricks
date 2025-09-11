import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime, type Options } from "hast-util-to-jsx-runtime";
import { toString } from "hast-util-to-string";
import type { Element } from "hast";
import { codeToHast } from "@next-shared/shiki";
import { CodeBlock } from "../cruise-canvas/CodeBlock/CodeBlock";
import type { AsyncResult } from "./interfaces";

const production = { Fragment, jsx, jsxs } as Options;

const THEME = "light-plus";

export interface UseCodeBlockOptions {
  language: string;
  source: string;
  disabled?: boolean;
}

export function useCodeBlock({
  language,
  source,
  disabled,
}: UseCodeBlockOptions): AsyncResult<JSX.Element | null> {
  const [data, setData] = useState<JSX.Element | null>(null);
  const [status, setStatus] = useState<"pending" | "error" | "success">(
    disabled ? "success" : "pending"
  );
  const [error, setError] = useState<unknown>();
  useEffect(() => {
    setData(null);
    setError(undefined);
    if (disabled) {
      setStatus("success");
      return;
    }
    setStatus("pending");
    let ignore = false;
    (async () => {
      try {
        const rendered = await renderCodeBlock(source, language);
        if (!ignore) {
          setData(rendered);
          setStatus("success");
        }
      } catch (e) {
        if (!ignore) {
          setError(e);
          setStatus("error");
          // eslint-disable-next-line no-console
          console.error("Render code block failed:", e);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [language, source, disabled]);

  return { data, status, error };
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
