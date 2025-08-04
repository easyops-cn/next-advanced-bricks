import type { BrickConf } from "@next-core/types";
import type { Component } from "@next-shared/jsx-storyboard";

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
  type: "eo-search";
  placeholder?: string;
}

interface FormItemInput extends FormItemBase {
  type: "eo-input";
  placeholder?: string;
}

interface FormItemNumberInput extends FormItemBase {
  type: "eo-number-input";
  min?: number;
  max?: number;
  placeholder?: string;
}

interface FormItemTextarea extends FormItemBase {
  type: "eo-textarea";
  placeholder?: string;
}

interface FormItemSelect extends FormItemBase {
  type: "eo-select";
  options: Option[];
  placeholder?: string;
}

interface FormItemRadio extends FormItemBase {
  type: "eo-radio";
  options: Option[];
}

interface FormItemCheckbox extends FormItemBase {
  type: "eo-checkbox";
  options: Option[];
}

interface FormItemSwitch extends FormItemBase {
  type: "eo-switch";
}

interface FormItemDatePicker extends FormItemBase {
  type: "eo-date-picker";
}

interface FormItemTimePicker extends FormItemBase {
  type: "eo-time-picker";
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

export default function convertFormItem(
  component: Component,
  type: FormItem["type"]
): BrickConf {
  const { properties } = component;

  let brick = type;
  let props: Record<string, unknown> = {
    ...properties,
    themeVariant: "elevo",
  };

  switch (brick) {
    case "eo-search":
      props = {
        ...props,
        trim: true,
      };
      break;
    case "eo-number-input":
      brick = "eo-input";
      props = {
        type: "number",
        ...props,
      };
      break;
  }

  return {
    brick,
    properties: props,
  };
}
