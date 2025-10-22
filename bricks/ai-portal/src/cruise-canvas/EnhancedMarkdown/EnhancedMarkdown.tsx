import React, { useCallback, useContext, useRef } from "react";
import {
  MarkdownComponent,
  type MarkdownComponentProps,
} from "@next-shared/markdown";
import { CanvasContext } from "../CanvasContext";
import { MarkdownPre } from "../../shared/MarkdownPre";
import { RenderView } from "../../shared/RenderView/RenderView";
import { rehypeRenderView } from "../../shared/RenderView/rehypeRenderView";

const components: MarkdownComponentProps["components"] = {
  pre: MarkdownPre,
  "elevo-render-view": RenderView,
} as any;

const shikiOptions: MarkdownComponentProps["shiki"] = {
  theme: "light-plus",
};

const rehypePluginsWithRenderView = [rehypeRenderView];

export interface EnhancedMarkdownProps extends MarkdownComponentProps {
  className?: string;
  withRenderView?: boolean;
}

export function EnhancedMarkdown({
  className,
  withRenderView,
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
        rehypePlugins={withRenderView ? rehypePluginsWithRenderView : undefined}
      />
    </div>
  );
}
