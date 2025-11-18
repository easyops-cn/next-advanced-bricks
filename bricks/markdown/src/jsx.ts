import type { DetailedHTMLProps, HTMLAttributes } from "react";
import type { MarkdownDisplay, MarkdownDisplayProps } from "./markdown-display";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "eo-markdown-display": DetailedHTMLProps<
        HTMLAttributes<MarkdownDisplay>,
        MarkdownDisplay
      > &
        MarkdownDisplayProps;
    }
  }
}
