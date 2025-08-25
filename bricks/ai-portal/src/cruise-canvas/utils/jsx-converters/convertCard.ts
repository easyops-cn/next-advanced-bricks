import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";
import type { CardProps } from "@next-shared/jsx-storyboard/lib/components.js";

export default function convertCard(component: Component): BrickConf {
  const { properties } = component;
  const { title, textContent } = properties as CardProps & {
    textContent?: string;
  };
  return {
    brick: "eo-card",
    properties: {
      themeVariant: "elevo",
      cardTitle: title,
      background: false,
      ...(textContent ? { textContent } : null),
    },
  };
}
