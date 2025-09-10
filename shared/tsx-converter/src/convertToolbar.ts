import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";

export default function convertToolbar(_component: Component): BrickConf {
  return {
    brick: "eo-flex-layout",
    properties: {
      gap: "0.5em",
      alignItems: "center",
    },
  };
}
