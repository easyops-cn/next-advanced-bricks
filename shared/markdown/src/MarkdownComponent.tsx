import { useEffect, useState } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkToRehype from "remark-rehype";
import rehypeReact, { Options as RehypeReactOptions } from "rehype-react";
import type { Components } from "hast-util-to-jsx-runtime";
import { rehypePrism } from "./rehypePrism.js";
import { rehypeMermaid } from "./rehypeMermaid.js";

const production = { Fragment, jsx, jsxs };

export interface MarkdownComponentProps {
  content?: string;
  components?: Partial<Components>;
}

// Reference https://github.com/remarkjs/react-remark/blob/39553e5f5c9e9b903bebf261788ff45130668de0/src/index.ts
export function MarkdownComponent({
  content,
  components,
}: MarkdownComponentProps) {
  const [reactContent, setReactContent] = useState<JSX.Element | null>(null);

  useEffect(() => {
    let ignore = false;
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkToRehype)
      .use([rehypePrism])
      .use(rehypeMermaid)
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
  }, [components, content]);

  return reactContent;
}
