import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

export default function convertForm(component: Component): BrickConf {
  const { properties } = component;
  const { values } = (properties ?? {}) as {
    values?: unknown;
  };

  return {
    brick: "eo-form",
    properties: {
      values: values ?? {},
      themeVariant: "elevo",
    },
  };
}
