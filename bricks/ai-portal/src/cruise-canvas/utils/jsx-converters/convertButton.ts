import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";

export default function convertButton(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as {
    textContent: string;
    icon?: unknown;
    type?: string;
  };
  return {
    brick: "eo-button",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
