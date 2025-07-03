import type { BrickConf } from "@next-core/types";
import type { Component } from "./interfaces.js";

interface FormItemBase {
  name: string;
  label?: string;
  required?: boolean;
}

interface Option {
  label: string;
  value: string;
}

interface FormItemSearch {
  type: "search";
  placeholder?: string;
}

interface FormItemInput extends FormItemBase {
  type: "input";
  placeholder?: string;
}

interface FormItemNumberInput extends FormItemBase {
  type: "number-input";
  min?: number;
  max?: number;
  placeholder?: string;
}

interface FormItemTextarea extends FormItemBase {
  type: "textarea";
  placeholder?: string;
}

interface FormItemSelect extends FormItemBase {
  type: "select";
  options: Option[];
  placeholder?: string;
}

interface FormItemRadio extends FormItemBase {
  type: "radio";
  options: Option[];
}

interface FormItemCheckbox extends FormItemBase {
  type: "checkbox";
  options: Option[];
}

interface FormItemSwitch extends FormItemBase {
  type: "switch";
}

interface FormItemDatePicker extends FormItemBase {
  type: "date-picker";
}

interface FormItemTimePicker extends FormItemBase {
  type: "time-picker";
}

type FormItem =
  | FormItemSearch
  | FormItemInput
  | FormItemNumberInput
  | FormItemTextarea
  | FormItemSelect
  | FormItemRadio
  | FormItemCheckbox
  | FormItemSwitch
  | FormItemDatePicker
  | FormItemTimePicker;

export default function convertFormItem(component: Component): BrickConf {
  const { properties } = component;
  const { type, ...restProps } = properties as {
    type: FormItem["type"];
  };

  let brick: string;
  let props = restProps;

  switch (type) {
    case "search":
      brick = "eo-search";
      props = {
        ...restProps,
        trim: true,
      };
      break;
    case "input":
      brick = "eo-input";
      break;
    case "number-input":
      brick = "eo-input";
      props = {
        type: "number",
        ...restProps,
      };
      break;
    case "textarea":
      brick = "eo-textarea";
      break;
    case "select":
      brick = "eo-select";
      break;
    case "radio":
      brick = "eo-radio-group";
      break;
    case "checkbox":
      brick = "eo-checkbox-group";
      break;
    case "switch":
      brick = "eo-switch";
      break;
    case "date-picker":
      brick = "eo-date-picker";
      break;
    case "time-picker":
      brick = "eo-time-picker";
      break;
    default:
      throw new Error(`Unsupported form item type: ${type}`);
  }

  return {
    brick,
    properties: props,
  };
}
