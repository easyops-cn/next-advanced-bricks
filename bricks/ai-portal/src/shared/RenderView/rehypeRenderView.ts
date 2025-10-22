import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Element } from "hast";
import { getCodeLanguage } from "@next-shared/markdown";

interface DataWithMeta {
  meta?: string;
}

export function rehypeRenderView() {
  return (tree: Element) => {
    visit(tree, "element", (node, index, parent) => {
      const children = node.children;
      const firstChild = children[0];
      if (
        !parent ||
        node.type !== "element" ||
        node.tagName !== "pre" ||
        children.length !== 1 ||
        firstChild.type !== "element" ||
        firstChild.tagName !== "code" ||
        (firstChild.data as DataWithMeta)?.meta !== 'render="view"' ||
        getCodeLanguage(firstChild) !== "tsx"
      ) {
        return;
      }

      parent.children[index!] = {
        type: "element",
        tagName: "elevo-render-view",
        properties: {
          value: toString(firstChild),
        },
        children: [],
      };
    });
  };
}
