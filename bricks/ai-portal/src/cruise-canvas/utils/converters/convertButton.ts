import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

export default function convertButton(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as {
    textContent: string;
    icon?: unknown;
  };
  return {
    brick: "eo-button",
    properties: {
      textContent: props.textContent,
      icon: props.icon,
    },
  };
}
