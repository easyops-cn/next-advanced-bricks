import React from "react";
import type { LineTextClipPath, RenderedLineLabel } from "./interfaces";

export interface ClipPathComponentProps {
  clipPathPrefix: string;
  clipPath: LineTextClipPath;
  renderedLineLabels: RenderedLineLabel[];
}

export function ClipPathComponent({
  clipPath,
  clipPathPrefix,
  renderedLineLabels,
}: ClipPathComponentProps): JSX.Element | null {
  const { x0, y0, w, h, id } = clipPath;
  const lineText = renderedLineLabels.find((item) => item.id === id);
  if (!lineText) {
    return null;
  }
  const { left, top, right, bottom } = lineText.lineRect;
  // https://css-tricks.com/cutting-inner-part-element-using-clip-path/
  return (
    <clipPath key={id} id={`${clipPathPrefix}${id}`}>
      <polygon
        points={[
          `${x0},${y0 + h}`,
          `${x0 + w},${y0 + h}`,
          `${x0 + w},${y0}`,
          `${x0},${y0}`,
          `${x0},${top}`,
          `${right},${top}`,
          `${right},${bottom}`,
          `${left},${bottom}`,
          `${left},${top}`,
          `${x0},${top}`,
        ].join(" ")}
      />
    </clipPath>
  );
}