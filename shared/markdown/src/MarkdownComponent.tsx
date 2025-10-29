import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToRehype from "remark-rehype";
import rehypeReact, { Options as RehypeReactOptions } from "rehype-react";
import type { Components } from "hast-util-to-jsx-runtime";
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { getSingletonHighlighter } from "@next-shared/shiki";
import { rehypeMermaid } from "./rehypeMermaid.js";

const production = { Fragment, jsx, jsxs };

export interface MarkdownComponentProps {
  content?: string;
  components?: Partial<Components>;
  shiki?: {
    /** @default "dark-plus" */
    theme?: "light-plus" | "dark-plus";
  };
}

export async function preloadHighlighter(
  theme: "light-plus" | "dark-plus"
): Promise<void> {
  await getSingletonHighlighter({
    themes: [theme],
  });
}

// Reference https://github.com/remarkjs/react-remark/blob/39553e5f5c9e9b903bebf261788ff45130668de0/src/index.ts
export function MarkdownComponent({
  content,
  components,
  shiki,
}: MarkdownComponentProps): JSX.Element | null {
  const [reactContent, setReactContent] = useState<JSX.Element | null>(null);
  const theme = shiki?.theme ?? "dark-plus";

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const highlighter = await getSingletonHighlighter({
          themes: [theme],
        });
        if (ignore) {
          return;
        }
        const vFile = await unified()
          .use(remarkParse)
          .use(remarkGfm)
          .use(remarkToRehype)
          .use(rehypeMermaid)
          .use(rehypeShikiFromHighlighter, highlighter as any, {
            theme,
            lazy: true,
            defaultLanguage: "text",
          })
          .use(rehypeReact, {
            ...production,
            passNode: true,
            components,
          } as RehypeReactOptions)
          .process(content);
        if (!ignore) {
          setReactContent(vFile.result);
        }
      } catch (error) {
        if (!ignore) {
          // eslint-disable-next-line no-console
          console.error("Convert markdown failed:", error);
          setReactContent(null);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [components, content, theme]);

  return reactContent;
}
