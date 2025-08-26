import type { BrickConf } from "@next-core/types";
import type { Component } from "../interfaces.js";

export default function convertToolbar(_component: Component): BrickConf {
  return {
    brick: "eo-flex-layout",
    properties: {
      gap: "0.5em",
      alignItems: "center",
    },
  };
}
