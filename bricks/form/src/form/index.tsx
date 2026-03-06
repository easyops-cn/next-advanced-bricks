import React, { useMemo } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import { ReactNextElement } from "@next-core/react-element";
import {
  AbstractForm,
  FormStore,
  MessageBody,
  ColProps,
} from "@next-shared/form";
import { ComponentSize, Layout } from "../interface.js";

const { defineElement, property, event, method } = createDecorators();

interface FormProps {
  values?: Record<string, any>;
  layout?: Layout;
  size?: ComponentSize;
  autoScrollToInvalidFields?: boolean;
}

export interface FormEvents {
  valuesChange?: Event;
  validateSuccess?: Event;
  validateError?: Event;
}

export interface FormMapEvents {
  onValuesChange: "values.change";
  onValidateSuccess: "validate.success";
  onValidateError: "validate.error";
}

export interface EoFormEventsMap {
  "values.change": CustomEvent<Record<string, unknown>>;
  "validate.success": CustomEvent<Record<string, unknown>>;
  "validate.error": CustomEvent<(MessageBody & { name: string })[]>;
}

export interface EoFormEventsMapping {
  onValuesChange: "values.change";
  onValidateSuccess: "validate.success";
  onValidateError: "validate.error";
}

/**
 * 表单构件
 * @author sailor
 * @slot - 表单内容
 * @category form-input-basic
 */
@defineElement("eo-form", {
  alias: ["form.general-form"],
})
class Form extends ReactNextElement implements FormProps, AbstractForm {
  formStore: FormStore;
  #values!: Record<string, unknown>;
  defaultEmitValuesChange = true;

  constructor() {
    super();
    this.formStore = FormStore.getInstance({
      onValuesChanged: this.handleValuesChange,
    });
  }

  get isFormElement(): true {
    return true;
  }

  set values(value: Record<string, unknown>) {
    this.#values = value;

    this.#setInitValue(value);
  }
  get values(): Record<string, unknown> {
    return this.#values;
  }

  #setInitValue(values: Record<string, unknown>) {
    this.formStore.setInitValue(values, this.defaultEmitValuesChange);
  }

  /**
   * 静态附加值，在表单验证成功时会合并到 validate.success 事件的 detail 中
   */
  @property({
    attribute: false,
  })
  accessor staticValues: Record<string, unknown> | undefined;

  /**
   * 布局方式(默认 vertical 布局)
   * @default vertical
   */
  @property() accessor layout: Layout = "vertical";

  /**
   * 表单组件尺寸
   */
  @property() accessor size: ComponentSize | undefined;

  /**
   * 标签列布局样式（仅当 layout="horizontal" 时有效）
   */
  @property({
    attribute: false,
  })
  accessor labelCol: ColProps = {
    sm: {
      span: 24,
    },
    md: {
      span: 24,
    },
    lg: {
      span: 7,
    },
    xl: {
      span: 5,
    },
    xxl: {
      span: 4,
    },
  };

  /**
   * 输入控件列布局样式（仅当 layout="horizontal" 时有效）
   */
  @property({
    attribute: false,
  })
  accessor wrapperCol: ColProps = {
    sm: {
      span: 18,
    },
    md: {
      span: 18,
    },
    lg: {
      span: 13,
    },
    xl: {
      span: 16,
    },
    xxl: {
      span: 18,
    },
  };

  /**
   * 是否在验证失败时自动滚动到第一个错误字段
   */
  @property({ render: false, type: Boolean })
  accessor autoScrollToInvalidFields: boolean | undefined;

  /**
   * 表单值变更事件
   * @detail 当前所有表单字段的值
   */
  @event({ type: "values.change" }) accessor #valuesChangeEvent!: EventEmitter<
    Record<string, unknown>
  >;
  handleValuesChange = (values: Record<string, unknown>) => {
    this.#valuesChangeEvent.emit(values);
  };

  /**
   * 表单验证成功时触发事件
   * @detail 表单所有字段的值，包含合并后的 staticValues
   */
  @event({ type: "validate.success" }) accessor #successEvent!: EventEmitter<
    Record<string, unknown>
  >;
  /**
   * 表单验证报错时触发事件
   * @detail 校验失败的字段信息列表，每项包含 name（字段名）及错误消息
   */
  @event({ type: "validate.error" }) accessor #errorEvent!: EventEmitter<
    (MessageBody & { name: string })[]
  >;

  /**
   * 表单校验方法
   */
  @method()
  validate(): boolean | Record<string, unknown> {
    return this.formStore.validateFields((err, values) => {
      if (err) {
        this.#errorEvent.emit(values);
        if (this.autoScrollToInvalidFields && values.length > 0) {
          this.formStore.scrollToField(values[0].name);
        }
      } else {
        this.#successEvent.emit({
          ...(this.staticValues ?? {}),
          ...values,
        });
      }
    });
  }

  /**
   * 表单设置值方法
   * @param values - 要设置的表单字段值
   * @param options - 可选配置，支持 runInMicrotask（微任务中执行）和 runInMacrotask（宏任务中执行）
   */
  @method()
  setInitValue(
    values: Record<string, unknown>,
    options?: { runInMacrotask?: boolean; runInMicrotask?: boolean }
  ): void {
    if (options) {
      options.runInMicrotask &&
        queueMicrotask(() => {
          this.values = values;
        });
      options.runInMacrotask &&
        setTimeout(() => {
          this.values = values;
        });
    } else {
      this.values = values;
    }
  }

  /**
   * 表单重置值方法
   * @param name - 要重置的字段名，不传则重置所有字段
   */
  @method()
  resetFields(name?: string): void {
    this.formStore.resetFields(typeof name === "string" ? name : undefined);
  }

  /**
   * 获取表单值方法
   * @param name - 要获取的字段名，不传则获取所有字段的值
   * @returns 指定字段的值，或所有字段值的对象
   */
  @method()
  getFieldsValue(name?: string): Record<string, unknown> | unknown {
    return this.formStore.getFieldsValue(
      typeof name === "string" ? name : undefined
    );
  }

  /**
   * 表单自定义样式
   */
  @property({
    attribute: false,
  })
  accessor formStyle: React.CSSProperties | undefined;

  /**
   * 校验表单字段方法
   * @param name - 要校验的字段名
   */
  @method()
  validateField(name: string): void {
    this.formStore.validateField(name);
  }

  /**
   * 重置表单校验状态方法
   */
  @method()
  resetValidateState(): void {
    this.formStore.resetValidateState();
  }

  render() {
    return (
      <FormComponent
        layout={this.layout}
        size={this.size}
        labelCol={this.labelCol}
        wrapperCol={this.wrapperCol}
        formStyle={this.formStyle}
      />
    );
  }
}

interface FormComponentProps extends FormProps {
  formStyle?: React.CSSProperties;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  onValuesChange?: (value: Record<string, any>) => void;
  onValidateSuccess?: () => void;
  onValidateError?: () => void;
}

export function FormComponent({
  layout = "vertical",
  formStyle,
}: FormComponentProps) {
  const computedStyle = useMemo((): React.CSSProperties => {
    switch (layout) {
      case "vertical":
      case "horizontal": {
        return {
          display: "flex",
          flexDirection: "column",
        };
      }
      case "inline": {
        return {
          display: "flex",
          gap: 10,
        };
      }
      default:
        return {};
    }
  }, [layout]);

  return (
    <form>
      <slot
        style={{
          ...computedStyle,
          ...(formStyle ? formStyle : {}),
        }}
      />
    </form>
  );
}

export { Form, FormProps };
