import { getMirroredStyle } from "./utils/getMirroredStyle.js";

let hiddenElement: HTMLDivElement | undefined;

export function getContentRectsInTextarea(
  textarea: HTMLTextAreaElement,
  prefix: string,
  measureContent: string
): DOMRect[] {
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

  const fullRect = span.getBoundingClientRect();
  span.remove();

  if (measureContent.length <= 1) {
    return [fullRect];
  }

  const leadingChar = measureContent[0];
  const leadingSpan = document.createElement("span");
  leadingSpan.textContent = leadingChar;
  hiddenElement.appendChild(leadingSpan);
  const leadingRect = leadingSpan.getBoundingClientRect();
  leadingSpan.remove();

  hiddenElement.textContent = `${prefix}${measureContent.slice(0, -1)}`;
  const trailingChar = measureContent[measureContent.length - 1];
  const trailingSpan = document.createElement("span");
  trailingSpan.textContent = trailingChar;
  hiddenElement.appendChild(trailingSpan);
  const trailingRect = trailingSpan.getBoundingClientRect();
  trailingSpan.remove();

  if (leadingRect.top === trailingRect.top) {
    return [fullRect];
  }

  const rects: DOMRect[] = [];

  // Leading rect
  rects.push(
    new DOMRect(
      leadingRect.left,
      leadingRect.top,
      fullRect.right - leadingRect.left,
      leadingRect.bottom - leadingRect.top
    )
  );

  // Middle rect
  const height = trailingRect.top - leadingRect.bottom;
  if (height >= 10) {
    rects.push(
      new DOMRect(fullRect.left, leadingRect.bottom, fullRect.width, height)
    );
  }

  // Trailing rect
  rects.push(
    new DOMRect(
      fullRect.left,
      trailingRect.top,
      trailingRect.right - fullRect.left,
      trailingRect.bottom - trailingRect.top
    )
  );

  return rects;
}
