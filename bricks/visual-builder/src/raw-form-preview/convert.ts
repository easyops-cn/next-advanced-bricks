import type { BrickConf } from "@next-core/types";
import type { FormConfig } from "./raw-form-interfaces";
import { getMemberAccessor } from "../shared/getMemberAccessor";

export function convertToForm(
  config: FormConfig,
  attr: string,
  values?: unknown
): BrickConf | null {
  return lowLevelConvertToForm(config, getMemberAccessor(attr), values);
}

export function lowLevelConvertToForm(
  config: FormConfig,
  attrAccessor: string,
  values?: unknown
): BrickConf | null {
  switch (config.component) {
    case "input":
    case "textarea":
    case "switch":
      return {
        brick: `eo-${config.component}`,
        errorBoundary: true,
        properties: {
          value: `<% DATA${attrAccessor} %>`,
        },
      };
    case "number-input":
      return {
        brick: "eo-input",
        errorBoundary: true,
        properties: {
          value: `<% DATA${attrAccessor} %>`,
          type: "number",
          min: config.min,
          max: config.max,
        },
      };
    case "select":
    case "radio":
    case "checkbox":
      return {
        brick: `eo-${config.component}`,
        errorBoundary: true,
        properties: {
          value: `<% DATA${attrAccessor} %>`,
          options: values,
          multiple: config.component === "select" ? config.multiple : undefined,
        },
      };
    case "date-picker":
    case "time-picker":
      return {
        brick: `eo-${config.component}`,
        errorBoundary: true,
        properties: {
          value: `<% DATA${attrAccessor} %>`,
        },
      };
  }

  return null;
}
