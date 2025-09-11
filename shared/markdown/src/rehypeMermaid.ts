import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Element } from "hast";
import type Mermaid from "mermaid";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { getCodeLanguage } from "./utils.js";

let mermaidPromise: Promise<typeof Mermaid> | undefined;

function loadMermaid() {
  if (mermaidPromise) {
    return mermaidPromise;
  }
  mermaidPromise = doLoadMermaid();
  return mermaidPromise;
}

async function doLoadMermaid() {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      fontSize: "14px",
      lineColor: "#979797",
      primaryColor: "#DCD2F3",
      primaryBorderColor: "#0000001A",
    },
  });
  return mermaid;
}

let count = 0;

const parser = new DOMParser();
const serializer = new XMLSerializer();

// Reference https://github.com/remcohaszing/rehype-mermaid
export function rehypeMermaid() {
  return async (tree: Element) => {
    const promises: Promise<void>[] = [];

    visit(tree, "element", (node, index, parent) => {
      if (
        !parent ||
        parent.type !== "element" ||
        parent.tagName !== "pre" ||
        node.tagName !== "code"
      ) {
        return;
      }

      const lang = getCodeLanguage(node);

      if (lang !== "mermaid") {
        return;
      }

      promises.push(
        (async () => {
          const id = `mermaid-${count++}`;
          let svg: string;
          try {
            const mermaid = await loadMermaid();
            const result = await mermaid.render(id, toString(node));
            svg = result.svg;
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Error rendering mermaid diagram:", error);
            document.getElementById(id)?.remove();
            return;
          }
          const root = parser.parseFromString(svg, "text/html");
          const svgElement = root.querySelector("svg") as SVGSVGElement;

          const defs = root.createElementNS(
            "http://www.w3.org/2000/svg",
            "defs"
          );
          defs.innerHTML = `<linearGradient id="linear-gradient-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stop-color="#F0EBFA" />
  <stop offset="75%" stop-color="#DED4F4" />
  <stop offset="100%" stop-color="#C5C7FA" />
</linearGradient>`;
          svgElement.prepend(defs);

          const style = root.createElementNS(
            "http://www.w3.org/2000/svg",
            "style"
          );
          style.textContent = `
#${id} .node rect,
#${id} .node circle,
#${id} .node ellipse,
#${id} .node polygon,
#${id} .node path {
  fill: url(#linear-gradient-${id});
}
#${id} .node rect {
  rx: 4;
  ry: 4;
}
#${id} .labelBkg {
  background-color: #f5f8ff;
}
#${id} .edgeLabel,
#${id} .edgeLabel p {
  background-color: transparent;
}
#${id} .edgeLabel {
  color: #8c8c8c;
  font-size: 12px;
}
`;
          svgElement.appendChild(style);

          const modifiedSvg = serializer.serializeToString(svgElement);

          const replacements = fromHtmlIsomorphic(modifiedSvg, {
            fragment: true,
          }).children as Element[];
          parent.children.splice(index!, 1, ...replacements);
          parent.properties.className = (
            (parent.properties.className as string[]) || []
          ).concat("mermaid");
        })()
      );
    });

    await Promise.all(promises);
  };
}
