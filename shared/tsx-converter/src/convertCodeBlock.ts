import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";
import type { CodeBlockProps } from "../lib/components.js";

export default function convertCodeBlock(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as Partial<CodeBlockProps>;
  return {
    brick: "eo-code-block",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
