// istanbul ignore file
import { pick } from "lodash";
import type { FormItemProps } from "./interfaces";

const FORM_ITEM_PROP_NAMES = [
  "formElement",
  "curElement",
  "name",
  "label",
  "current",
  "required",
  "pattern",
  "type",
  "min",
  "max",
  "labelCol",
  "wrapperCol",
  "message",
  "layout",
  "size",
  "trigger",
  "valuePropsName",
  "notRender",
  "helpBrick",
  "labelBrick",
  "needValidate",
  "validator",
] as const;

export function pickFormItemProps<T extends FormItemProps>(
  props: T
): FormItemProps {
  return pick(props, FORM_ITEM_PROP_NAMES);
}

/* ====== Type checks ====== */
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type cases = [
  Expect<Equal<keyof FormItemProps, (typeof FORM_ITEM_PROP_NAMES)[number]>>,
];
