import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import { refractor, type RefractorElement } from "refractor";
import jsx from "refractor/lang/jsx.js";
import mermaid from "refractor/lang/mermaid.js";
import { getCodeLanguage } from "./utils.js";

refractor.register(jsx);
refractor.register(mermaid);

// Reference https://github.com/mapbox/rehype-prism
export function rehypePrism() {
  function visitor(
    node: RefractorElement,
    _index: number | undefined,
    parent: RefractorElement | undefined
  ) {
    if (!parent || parent.tagName !== "pre" || node.tagName !== "code") {
      return;
    }

    const lang = getCodeLanguage(node);

    if (lang === null || lang === "mermaid") {
      return;
    }

    let result;
    try {
      parent.properties.className = (
        (parent.properties.className as string[]) || []
      ).concat("language-" + lang);
      result = refractor.highlight(toString(node), lang);
    } catch {
      return;
    }

    node.children = result.children;
  }
  return (tree: RefractorElement) => {
    visit(tree, "element", visitor);
  };
}
