import type { BrickConf } from "@next-core/types";
import type { Component, ParsedModule } from "@next-shared/tsx-parser";
import type { LinkProps } from "../lib/components.js";
import type { ConvertState } from "./interfaces.js";

export default function convertLink(
  component: Component,
  mod: ParsedModule,
  state: ConvertState
): BrickConf {
  const { properties } = component;
  const props = properties as LinkProps & {
    textContent?: string;
    to?: string;
  };
  return {
    brick: "eo-link",
    properties: {
      ...props,
      inApp: state.app.appType === "app",
      themeVariant: "elevo",
    },
  };
}
