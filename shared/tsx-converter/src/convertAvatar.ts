import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-types";
import type { AvatarProps } from "../lib/components.js";

export default function convertAvatar(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as AvatarProps;
  return {
    brick: "eo-avatar",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
