import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { RefractorElement } from "refractor";
import mermaid from "mermaid";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { getCodeLanguage } from "./utils.js";

let count = 0;

mermaid.initialize({
  startOnLoad: false,
  themeVariables: {
    fontSize: "14px",
  },
});

// Reference https://github.com/remcohaszing/rehype-mermaid
export function rehypeMermaid() {
  return async (tree: RefractorElement) => {
    const promises: Promise<void>[] = [];

    function visitor(
      node: RefractorElement,
      index: number | undefined,
      parent: RefractorElement | undefined
    ) {
      if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
        return;
      }

      const lang = getCodeLanguage(node);

      if (lang !== "mermaid") {
        return;
      }

      promises.push(
        (async () => {
          const id = `mermaid-${count++}`;

          const { svg } = await mermaid.render(id, toString(node));
          const replacements = fromHtmlIsomorphic(svg, { fragment: true })
            .children as RefractorElement[];
          parent.children.splice(index!, 1, ...replacements);
          parent.properties.className = (
            (parent.properties.className as string[]) || []
          ).concat("mermaid");
        })()
      );
    }

    visit(tree, "element", visitor);

    await Promise.all(promises);
  };
}
