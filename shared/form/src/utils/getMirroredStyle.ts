const HIDDEN_STYLE = `
  min-height: 0!important;
  max-height: none!important;
  height: 0!important;
  visibility: hidden!important;
  overflow: hidden!important;
  position: absolute!important;
  z-index: -1000!important;
  top: 0!important;
  left: 0!important;
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

/**
 * 创建一个镜像元素，用于计算光标位置或文本尺寸。
 */
export function getMirroredStyle(element: HTMLElement) {
  const uiTextNodeStyle = window.getComputedStyle(element);
  const sizingStyle = SIZING_STYLE.map(
    (name) => `${name}:${uiTextNodeStyle.getPropertyValue(name)}`
  ).join(";");
  return `${sizingStyle};${HIDDEN_STYLE}`;
}
