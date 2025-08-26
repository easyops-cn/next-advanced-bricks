import type { BrickConf } from "@next-core/types";
import type { Component } from "../interfaces.js";

export default function convertFormItem(
  component: Component,
  type: string
): BrickConf {
  const { properties } = component;

  let brick = type;
  let props: Record<string, unknown> = {
    ...properties,
    themeVariant: "elevo",
  };

  switch (brick) {
    case "eo-search":
      props = {
        ...props,
        trim: true,
      };
      break;
    case "eo-number-input":
      brick = "eo-input";
      props = {
        type: "number",
        ...props,
      };
      break;
  }

  return {
    brick,
    properties: props,
  };
}
