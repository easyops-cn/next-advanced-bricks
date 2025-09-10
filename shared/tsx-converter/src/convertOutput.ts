import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";

export default function convertOutput(component: Component): BrickConf {
  const { properties } = component;
  const { textContent } = properties as {
    textContent?: string;
  };

  return {
    brick: "pre",
    properties: {
      textContent,
      style: {
        background: "hsl(230, 1%, 98%)",
        color: "hsl(230, 8%, 24%)",
        fontFamily:
          '"Fira Code", "Fira Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
        direction: "ltr",
        textAlign: "left",
        whiteSpace: "pre",
        wordSpacing: "normal",
        wordBreak: "normal",
        lineHeight: "1.5",
        tabSize: "2",
        hyphens: "none",
        fontSize: "13px",

        padding: "1em",
        // margin: "0.5em 0",
        margin: "0",
        overflowX: "auto",
        borderRadius: "9px",
      },
    },
  };
}
