import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

export default function convertForm(_component: Component): BrickConf {
  return {
    brick: "eo-form",
    properties: {
      style: {
        marginBottom: "-22px",
      },
    },
  };
}
