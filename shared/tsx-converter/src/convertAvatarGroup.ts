import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-types";
import type { AvatarGroupProps } from "../lib/components.js";

export default function convertAvatarGroup(component: Component): BrickConf {
  const { properties } = component;
  const props = properties as AvatarGroupProps;
  return {
    brick: "eo-avatar-group",
    properties: {
      ...props,
      themeVariant: "elevo",
    },
  };
}
