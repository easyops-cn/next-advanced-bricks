import { UseBrickConfOrRenderFunction } from "@next-core/react-runtime";
import type { AbstractForm, ColProps } from "./Form";
import type { MessageBody } from "./FormStore";

type ComponentSize = "large" | "medium" | "small" | "xs";

type Layout = "horizontal" | "vertical" | "inline";

type FormItemElement = HTMLElement & {
  size?: ComponentSize;
  validateState?: MessageBody | string;
  [key: string]: any;
};

export interface FormItemProps {
  formElement?: AbstractForm | null;
  curElement?: FormItemElement;
  name?: string;
  label?: string;
  current?: HTMLElement;
  required?: boolean;
  pattern?: string;
  type?: string;
  min?: number;
  max?: number;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  message?: Record<string, string>;
  layout?: Layout;
  size?: ComponentSize;
  trigger?: string;
  valuePropsName?: string;
  notRender?: boolean;
  helpBrick?: {
    useBrick: UseBrickConfOrRenderFunction;
    placement?: "right" | "bottom";
  };
  labelBrick?: {
    useBrick: UseBrickConfOrRenderFunction;
  };
  needValidate?: boolean;
  validator?: (value: any) => MessageBody | string;
}
