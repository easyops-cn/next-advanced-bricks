import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";

export default function convertFlexLayout(_component: Component): BrickConf {
  return {
    brick: "eo-flex-layout",
    properties: {
      gap: "0.5em",
    },
  };
}
