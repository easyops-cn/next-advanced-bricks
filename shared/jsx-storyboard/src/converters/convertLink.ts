import type { BrickConf } from "@next-core/types";
import type { Component } from "../interfaces.js";
import type { LinkProps } from "../../lib/components.js";

export default function convertLink(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as LinkProps & {
    textContent?: string;
  };
  return {
    brick: "eo-link",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
