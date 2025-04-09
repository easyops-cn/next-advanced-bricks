import type React from "react";

const HIDDEN_TEXTAREA_STYLE = `
  min-height: 0!important;
  max-height: none!important;
  height: 0!important;
  visibility: hidden!important;
  overflow: hidden!important;
  position: absolute!important;
  z-index: -1000!important;
  top: 0!important;
  right: 0!important;
  pointer-events: none!important;
`;

const SIZING_STYLE = [
  "letter-spacing",
  "line-height",
  "padding-top",
  "padding-bottom",
  "font-family",
  "font-weight",
  "font-size",
  "font-variant",
  "text-rendering",
  "text-transform",
  "width",
  "text-indent",
  "padding-left",
  "padding-right",
  "border-width",
  "box-sizing",
  "word-break",
  "white-space",
];

let hiddenTextarea: HTMLTextAreaElement | undefined;

/**
 * 计算 textarea 高度
 * https://github.com/react-component/textarea/blob/1c0026fbe30e5f7dff1fca695b2cf262246381ca/src/calculateNodeHeight.tsx
 */
export default function calculateAutoSizeStyle(
  uiTextNode: HTMLTextAreaElement,
  minRows: number | null = null,
  maxRows: number | null = null
): React.CSSProperties {
  if (!hiddenTextarea) {
    hiddenTextarea = document.createElement("textarea");
    hiddenTextarea.setAttribute("tab-index", "-1");
    hiddenTextarea.setAttribute("aria-hidden", "true");
    document.body.appendChild(hiddenTextarea);
  }

  const uiTextNodeStyle = window.getComputedStyle(uiTextNode);
  const sizingStyle = SIZING_STYLE.map(
    (name) => `${name}:${uiTextNodeStyle.getPropertyValue(name)}`
  ).join(";");

  // equal style
  hiddenTextarea.setAttribute(
    "style",
    `${sizingStyle};${HIDDEN_TEXTAREA_STYLE}`
  );
  hiddenTextarea.value = uiTextNode.value || uiTextNode.placeholder || "";

  let minHeight: number | undefined;
  let maxHeight: number | undefined;
  let overflowY: React.CSSProperties["overflowY"];

  const borderSize = 2;
  const paddingSize = 8;
  let height = hiddenTextarea.scrollHeight + borderSize;

  if (minRows !== null || maxRows !== null) {
    const singleRowHeight = parseFloat(
      window.getComputedStyle(hiddenTextarea).getPropertyValue("line-height")
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
