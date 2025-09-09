import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-types";
import type { CardProps } from "../lib/components.js";

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
      background: "#fff",
      outline: "background",
      ...(textContent ? { textContent } : null),
    },
  };
}
