import type { BrickConf } from "@next-core/types";
import type { Component } from "../interfaces.js";

export default function convertText(component: Component): BrickConf {
  const { properties } = component;
  const { textContent } = properties as {
    textContent?: string;
  };
  return {
    brick: "span",
    properties: {
      textContent,
    },
  };
}
