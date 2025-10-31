import React, { useState, useEffect, useRef, useMemo } from "react";
import { createDecorators } from "@next-core/element";
import {
  FormItemElementBase,
  MessageBody,
  FormItemProps,
} from "@next-shared/form";
import { ReactUseMultipleBricks } from "@next-core/react-runtime";
import "@next-core/theme";
import classNames from "classnames";
import type { ComponentSize, Layout } from "../interface.js";
import {
  convertToItemColName,
  calcWrapperColOffsetWithoutLabel,
} from "./convertToItemColName.js";
import type { Form } from "../form/index.js";
import styleText from "./FormItem.shadow.less";

export type { FormItemProps };

const { defineElement, property } = createDecorators();

/**
 * 通用输入框构件
 * @author sailor
 * @slot - 表单项内容
 * @category form-input-basic
 * @insider
 */
@defineElement("eo-form-item", {
  styleTexts: [styleText],
  alias: ["form.general-form-item"],
})
class FormItem extends FormItemElementBase implements FormItemProps {
  @property({
    attribute: false,
  })
  accessor formElement: Form | undefined;

  @property({
    attribute: false,
  })
  accessor curElement: HTMLElement | undefined;

  /**
   * 字段名称
   */
  @property() accessor name: string | undefined;

  @property() accessor label: string | undefined;

  @property() accessor pattern: string | undefined;

  @property({
    attribute: false,
  })
  accessor message: Record<string, string> | undefined;

  @property() accessor type: string | undefined;

  @property({
    type: Number,
  })
  accessor max: number | undefined;

  @property({
    type: Number,
  })
  accessor min: number | undefined;

  /**
   * 表单项是否为必填
   * @group basicFormItem
   */
  @property({
    type: Boolean,
  })
  accessor required: boolean | undefined;

  /**
   * 初始值
   */
  @property() accessor value: string | undefined;

  @property() accessor valuePropsName: string | undefined;

  @property() accessor layout: Layout | undefined;

  @property() accessor size: ComponentSize | undefined;

  /**
   * 是否自动去除前后的空白字符
   * @default true
   * @group advancedFormItem
   */
  @property({
    type: Boolean,
  })
  accessor trim = true;

  /**
   * 事件触发方法名
   */
  @property()
  accessor trigger!: string;

  /**
   * 表单项校验方法
   */
  @property({
    attribute: false,
  })
  accessor validator: ((value: any) => MessageBody) | undefined;

  /**
   * 值变化时是否主动出发校验
   */
  @property({
    type: Boolean,
  })
  accessor needValidate: boolean | undefined;

  disconnectedCallback(): void {
    const name = this.name;
    const formInstance = this.formElement?.formStore;
    if (formInstance && name) {
      formInstance.removeField(name);
      formInstance.unsubscribe(`${name}.validate`);
      formInstance.unsubscribe(`${name}.init.value`);
      formInstance.unsubscribe(`${name}.reset.fields`);
      formInstance.unsubscribe(`${name}.scroll.to`);
      formInstance.unsubscribe(`reset.fields`);
      formInstance.unsubscribe("reset.validate");
    }

    super.disconnectedCallback();
  }

  render() {
    return (
      <FormItemComponent
        formElement={this.formElement}
        curElement={this.curElement}
        label={this.label}
        name={this.name}
        required={this.required}
        pattern={this.pattern}
        type={this.type}
        min={this.min}
        max={this.max}
        message={this.message}
        size={this.size || this.formElement?.size}
        layout={this.layout || this.formElement?.layout}
        trigger={this.trigger}
        notRender={this.notRender}
        labelCol={this.labelCol}
        wrapperCol={this.wrapperCol}
        helpBrick={this.helpBrick}
        labelBrick={this.labelBrick}
        valuePropsName={this.valuePropsName}
        needValidate={this.needValidate}
        validator={this.validator}
      />
    );
  }
}

export { FormItem };

export function FormItemComponent(props: FormItemProps) {
  const {
    name,
    label,
    required,
    pattern,
    type,
    max,
    min,
    message,
    formElement,
    curElement,
    valuePropsName = "value",
    size,
    trigger = "onChange",
    layout = "horizontal",
    helpBrick,
    labelBrick,
    needValidate = true,
    notRender,
    validator,
  } = props;
  const formInstance = formElement?.formStore;

  const labelCol = props.labelCol ?? formElement?.labelCol;
  const wrapperCol = props.wrapperCol ?? formElement?.wrapperCol;

  const finalWrapperCol = useMemo(() => {
    if (labelCol && wrapperCol && !label) {
      return calcWrapperColOffsetWithoutLabel(labelCol, wrapperCol);
    }

    return wrapperCol;
  }, [wrapperCol, label, labelCol]);

  const defaultValidateState = useRef<MessageBody>({
    message: "",
    type: "normal",
  });
  const [validateState, setValidateState] = useState<MessageBody>(
    defaultValidateState.current
  );

  useEffect(() => {
    if (!formInstance || !name || !curElement || curElement.$bindFormItem)
      return;
    const originTrigger = curElement[trigger];
    curElement[trigger] = (...args: any[]) =>
      formInstance.onWatch(name, args, originTrigger, {
        needValidate,
      });
    curElement.$bindFormItem = true;

    formInstance.subscribe(`${name}.validate`, (_, detail) => {
      setValidateState(detail);
      curElement.validateState = detail.type;
    });
    formInstance.subscribe(`${name}.init.value`, (_, v) => {
      curElement[valuePropsName] = v;
      curElement.validateState = "";
      setValidateState({
        message: "",
        type: "normal",
      });
    });
    formInstance.subscribe(`${name}.reset.fields`, () => {
      curElement[valuePropsName] = undefined;
    });
    formInstance.subscribe(`${name}.scroll.to`, () => {
      curElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    formInstance.subscribe("reset.fields", () => {
      curElement[valuePropsName] = undefined;
    });
    formInstance.subscribe("reset.validate", () => {
      setValidateState(defaultValidateState.current);
      curElement.validateState = defaultValidateState.current.type;
    });

    formInstance.setFieldsValueByInitData(name);
  }, [curElement, formInstance, name, needValidate, trigger, valuePropsName]);

  useEffect(() => {
    if (!formInstance || !name || !curElement) return;
    formInstance.setField(name, {
      name,
      label,
      notRender,
      validate: {
        required,
        pattern,
        type,
        max,
        min,
        message,
        validator,
      },
    });
    if (layout === "inline") curElement.style.display = "inline-block";
    if (size) {
      curElement.size = formElement.size || size;
    }
  }, [
    curElement,
    formElement?.size,
    notRender,
    formInstance,
    label,
    layout,
    type,
    max,
    message,
    min,
    name,
    pattern,
    required,
    size,
    validator,
  ]);

  return (
    <div className={classNames("form-item", layout)}>
      {label && (
        <div
          className={classNames(
            "form-item-label-wrapper",
            convertToItemColName(labelCol, layout)
          )}
        >
          <div className="form-item-label">
            <label>
              {required && <span className="required">*</span>}
              {label}
            </label>
            {labelBrick?.useBrick ? (
              <ReactUseMultipleBricks {...labelBrick}></ReactUseMultipleBricks>
            ) : null}
          </div>
        </div>
      )}
      <div
        className={classNames(
          "form-item-wrapper",
          convertToItemColName(finalWrapperCol, layout)
        )}
      >
        <div
          className={classNames("form-item-control", {
            [`align-${helpBrick?.placement ?? "bottom"}`]: helpBrick,
          })}
        >
          <slot></slot>
          <div className="help-brick">
            {typeof helpBrick === "string" || typeof helpBrick === "number" ? (
              helpBrick
            ) : helpBrick?.useBrick ? (
              <ReactUseMultipleBricks {...helpBrick}></ReactUseMultipleBricks>
            ) : null}
          </div>
        </div>
        {formElement ? (
          <div
            className={classNames("message", {
              error: validateState.type === "error",
            })}
            part="message"
          >
            {validateState?.type !== "normal" && validateState.message}
          </div>
        ) : null}
      </div>
    </div>
  );
}
