import { BrickConf } from "@next-core/types";
import type { ConvertViewOptions } from "@next-shared/tsx-types";

export function withBox(
  children: BrickConf[] | undefined,
  options: ConvertViewOptions
): BrickConf {
  return {
    brick: "div",
    properties: {
      style: options.expanded
        ? {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "16px",
            padding: "24px",
          }
        : {
            background: "var(--elevo-component-background)",
            backdropFilter: "var(--elevo-component-backdrop-filter)",
            borderRadius: "var(--elevo-border-radius)",
            padding: "16px",
          },
    },
    children,
  };
}
