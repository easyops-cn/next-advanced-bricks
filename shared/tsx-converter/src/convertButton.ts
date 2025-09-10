import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";
import type { ButtonProps } from "../lib/components.js";

export default function convertButton(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as ButtonProps & {
    textContent?: string;
  };
  return {
    brick: "eo-button",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
