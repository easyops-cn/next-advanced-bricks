import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";

export default function convertText(component: Component): BrickConf {
  const { properties } = component;
  const { textContent } = properties as {
    textContent?: string;
  };
  return {
    brick: "span",
    portal: true,
    properties: {
      textContent,
    },
  };
}
