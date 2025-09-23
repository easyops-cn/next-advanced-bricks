// istanbul ignore file
import type React from "react";
import { getMirroredStyle } from "./getMirroredStyle.js";

let hiddenTextarea: HTMLTextAreaElement | undefined;

export interface AutoSizeOptions {
  minRows?: number | null;
  maxRows?: number | null;
  borderSize?: number;
  paddingSize?: number;
}

/**
 * 计算 textarea 高度
 * https://github.com/react-component/textarea/blob/1c0026fbe30e5f7dff1fca695b2cf262246381ca/src/calculateNodeHeight.tsx
 */
export default function calculateAutoSizeStyle(
  uiTextNode: HTMLTextAreaElement,
  options?: AutoSizeOptions
): React.CSSProperties {
  const {
    minRows = null,
    maxRows = null,
    borderSize = 2,
    paddingSize = 8,
  } = options ?? {};

  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement("textarea");
    hiddenTextarea.setAttribute("tab-index", "-1");
    hiddenTextarea.setAttribute("aria-hidden", "true");
    document.body.appendChild(hiddenTextarea);
  }

  // equal style
  hiddenTextarea.setAttribute("style", getMirroredStyle(uiTextNode));
  hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || "";

  let minHeight: number | undefined;
  let maxHeight: number | undefined;
  let overflowY: React.CSSProperties["overflowY"];

  let height = hiddenTextarea.scrollHeight + borderSize;

  if (minRows !== null || maxRows !== null) {
    const singleRowHeight =
      process.env.NODE_ENV === "test"
        ? 22
        : parseFloat(
            window
              .getComputedStyle(hiddenTextarea)
              .getPropertyValue("line-height")
          );
    if (minRows !== null) {
      minHeight = singleRowHeight * minRows + paddingSize + borderSize;
      height = Math.max(minHeight, height);
    }
    if (maxRows !== null) {
      maxHeight = singleRowHeight * maxRows + paddingSize + borderSize;
      if (height <= maxHeight) {
        overflowY = "hidden";
      }
      height = Math.min(maxHeight, height);
    }
  }

  const style: React.CSSProperties = {
    height,
    overflowY,
    resize: "none",
  };

  if (minHeight) {
    style.minHeight = minHeight;
  }
  if (maxHeight) {
    style.maxHeight = maxHeight;
  }

  return style;
}
