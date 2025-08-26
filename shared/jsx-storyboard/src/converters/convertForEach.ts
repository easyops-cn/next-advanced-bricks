import type { BrickConf } from "@next-core/types";
import type { Component } from "../interfaces.js";

export default function convertForEach(component: Component): BrickConf {
  const { properties } = component;
  const { dataSource } = properties as {
    dataSource?: unknown;
  };
  return {
    brick: ":forEach",
    dataSource,
  };
}
