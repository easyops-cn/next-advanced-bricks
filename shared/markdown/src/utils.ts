import type { RefractorElement } from "refractor";

export function getCodeLanguage(node: RefractorElement) {
  const className = (node.properties.className as string[]) || [];

  for (const classListItem of className) {
    if (classListItem.slice(0, 9) === "language-") {
      return classListItem.slice(9).toLowerCase();
    }
  }

  return null;
}
