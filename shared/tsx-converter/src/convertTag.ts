import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";
import type { TagProps } from "../lib/components.js";

export default function convertTag(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as TagProps & {
    textContent?: string;
  };
  return {
    brick: "eo-tag",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
