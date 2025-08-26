import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";
import type { ButtonProps } from "@next-shared/jsx-storyboard/lib/components.js";

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
