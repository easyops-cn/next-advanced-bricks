import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";
import type { FormProps } from "@next-shared/jsx-storyboard/lib/components.js";

export default function convertForm(component: Component): BrickConf {
  const { properties } = component;
  const { values } = (properties ?? {}) as FormProps<object>;

  return {
    brick: "eo-form",
    properties: {
      values: values ?? {},
      themeVariant: "elevo",
    },
  };
}
