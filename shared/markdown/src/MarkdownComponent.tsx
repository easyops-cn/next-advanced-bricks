import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToRehype from "remark-rehype";
import rehypeReact, { Options as RehypeReactOptions } from "rehype-react";
import type { Components } from "hast-util-to-jsx-runtime";
import rehypeShikiFromHighlighter, {
  type RehypeShikiCoreOptions,
} from "@shikijs/rehype/core";
import { highlighter } from "@next-shared/shiki";
import { rehypeMermaid } from "./rehypeMermaid.js";

const production = { Fragment, jsx, jsxs };

export interface MarkdownComponentProps {
  content?: string;
  components?: Partial<Components>;
  shiki?: RehypeShikiCoreOptions;
}

// Reference https://github.com/remarkjs/react-remark/blob/39553e5f5c9e9b903bebf261788ff45130668de0/src/index.ts
export function MarkdownComponent({
  content,
  components,
  shiki,
}: MarkdownComponentProps) {
  const [reactContent, setReactContent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    let ignore = false;
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkToRehype)
      .use(rehypeMermaid)
      .use(rehypeShikiFromHighlighter, highlighter as any, {
        theme: "dark-plus",
        ...shiki,
      })
      .use(rehypeReact, {
        ...production,
        passNode: true,
        components,
      } as RehypeReactOptions)
      .process(content)
      .then((vFile) => {
        if (!ignore) {
          setReactContent(vFile.result);
        }
      })
      .catch((error) => {
        if (!ignore) {
          // eslint-disable-next-line no-console
          console.error("Convert markdown failed:", error);
          setReactContent(null);
        }
      });
    return () => {
      ignore = true;
    };
  }, [components, content, shiki]);

  return reactContent;
}
