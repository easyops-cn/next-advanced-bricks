import type { Element } from "hast";

export function getCodeLanguage(node: Element) {
  const className = (node.properties.className as string[]) || [];

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === "language-") {
      return classListItem.slice(9).toLowerCase();
    }
  }

  return null;
}
