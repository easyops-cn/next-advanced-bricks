import React, { useCallback, useContext, useRef } from "react";
import {
  MarkdownComponent,
  type MarkdownComponentProps,
} from "@next-shared/markdown";
import { CodeBlock } from "../CodeBlock/CodeBlock";
import { CanvasContext } from "../CanvasContext";

const components: MarkdownComponentProps["components"] = {
  pre: CodeBlock,
};

const shikiOptions: MarkdownComponentProps["shiki"] = {
  theme: "light-plus",
  addLanguageClass: true,
};

export interface EnhancedMarkdownProps extends MarkdownComponentProps {
  className?: string;
}

export function EnhancedMarkdown({
  className,
  ...props
}: EnhancedMarkdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { setHoverOnScrollableContent } = useContext(CanvasContext);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      let found = false;
      for (const el of e.nativeEvent.composedPath()) {
        if (el === ref.current) {
          break;
        }
        if (
          (el instanceof HTMLTableElement || el instanceof HTMLPreElement) &&
          el.scrollWidth > el.clientWidth
        ) {
          found = true;
          break;
        }
      }
      setHoverOnScrollableContent(found);
    },
    [setHoverOnScrollableContent]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverOnScrollableContent(false);
  }, [setHoverOnScrollableContent]);

  return (
    <div
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <MarkdownComponent
        {...props}
        components={components}
        shiki={shikiOptions}
      />
    </div>
  );
}
