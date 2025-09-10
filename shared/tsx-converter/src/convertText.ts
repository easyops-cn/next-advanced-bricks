import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";

export default function convertText(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as {
    textContent?: string;
  };
  return {
    brick: "span",
    properties: {
      ...props,
    },
  };
}
