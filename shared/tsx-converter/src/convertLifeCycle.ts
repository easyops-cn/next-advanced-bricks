import type { BrickLifeCycle } from "@next-core/types";
import type { Component } from "@next-shared/tsx-parser";
import type { ConvertOptions } from "./interfaces.js";
import { convertEventHandlers } from "./convertEvents.js";

export function convertLifeCycle(
  component: Component,
  options: ConvertOptions
) {
  const lifeCycle: BrickLifeCycle = {};
  for (const [event, handler] of Object.entries(component.lifeCycle ?? {})) {
    switch (event) {
      case "onMount":
      case "onUnmount": {
        const action = convertEventHandlers(handler, options);
        if (action) {
          lifeCycle[event] = action;
        }
        break;
      }
    }
  }
  return Object.keys(lifeCycle).length > 0 ? lifeCycle : undefined;
}
