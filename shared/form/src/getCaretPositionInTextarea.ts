import { getMirroredStyle } from "./utils/getMirroredStyle.js";

let hiddenElement: HTMLDivElement | undefined;

export function getCaretPositionInTextarea(
  textarea: HTMLTextAreaElement,
  index: number
) {
  if (!hiddenElement) {
    hiddenElement = document.createElement("div");
    hiddenElement.setAttribute("tab-index", "-1");
    hiddenElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(hiddenElement);
  }

  hiddenElement.setAttribute("style", getMirroredStyle(textarea));
  hiddenElement.textContent = textarea.value.slice(0, index);

  const span = document.createElement("span");
  span.textContent = "\u200b"; // 占位符
  hiddenElement.appendChild(span);

  const rect = span.getBoundingClientRect();
  span.remove();
  return {
    top: rect.top,
    left: rect.left,
  };
}
