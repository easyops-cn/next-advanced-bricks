import { getMirroredStyle } from "./utils/getMirroredStyle.js";

let hiddenElement: HTMLDivElement | undefined;

export function getContentRectInTextarea(
  textarea: HTMLTextAreaElement,
  prefix: string,
  measureContent: string
) {
  if (!hiddenElement) {
    hiddenElement = document.createElement("div");
    hiddenElement.setAttribute("tab-index", "-1");
    hiddenElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(hiddenElement);
  }
  hiddenElement.setAttribute("style", getMirroredStyle(textarea));

  hiddenElement.textContent = prefix;

  const span = document.createElement("span");
  span.textContent = measureContent;
  hiddenElement.appendChild(span);

  const rect = span.getBoundingClientRect();
  span.remove();
  return rect;
}
