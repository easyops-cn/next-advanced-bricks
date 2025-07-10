import React, { createRef, forwardRef, useCallback, useRef } from "react";
import { createDecorators, type EventEmitter } from "@next-core/element";
import {
  FormItemElementBase,
  pickFormItemProps,
  TextareaAutoResize,
} from "@next-shared/form";
import { wrapBrick } from "@next-core/react-element";
import classNames from "classnames";
import "@next-core/theme";
import type { FormItem, FormItemProps } from "../form-item/index.jsx";
import styleText from "./textarea.shadow.css";

const WrappedFormItem = wrapBrick<FormItem, FormItemProps>("eo-form-item");

type AutoSize =
  | boolean
  | {
      minRows?: number;
      maxRows?: number;
    };
export interface TextareaComponentRef {
  focus(): void;
}

export interface TextareaProps extends FormItemProps {
  name?: string;
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  textareaStyle?: React.CSSProperties;
  minLength?: number;
  maxLength?: number;
  autoSize?: AutoSize;
  validateState?: string;
  themeVariant?: "default" | "elevo";
}

export interface TextareaComponentProps extends TextareaProps {
  onInputChange: (value: string) => void;
}

const { defineElement, property, event, method } = createDecorators();

/**
 * 通用多行文本输入框构件
 * @author sailor
 * @category form-input-basic
 */
@defineElement("eo-textarea", {
  styleTexts: [styleText],
  alias: ["form.general-textarea"],
})
class Textarea extends FormItemElementBase implements TextareaProps {
  #componentRef = createRef<TextareaComponentRef>();

  /**
   * 字段名称
   */
  @property() accessor name: string | undefined;

  /**
   * 标签文字
   */
  @property() accessor label: string | undefined;

  /**
   * 值
   */
  @property() accessor value: string | undefined;

  /**
   * 占位说明
   */
  @property() accessor placeholder: string | undefined;

  /**
   * 是否禁用
   */
  @property({
    type: Boolean,
  })
  accessor disabled: boolean | undefined;

  /**
   * 最小长度
   */
  @property({
    type: Number,
  })
  accessor minLength: number | undefined;

  /**
   * 最大长度
   */
  @property({
    type: Number,
  })
  accessor maxLength: number | undefined;

  /**
   * 大小自适应
   */
  @property({
    attribute: false,
  })
  accessor autoSize: AutoSize | undefined;

  /**
   * 是否必填
   */
  @property({
    type: Boolean,
  })
  accessor required: boolean | undefined;

  /**
   * 表单校验最大长度
   */
  @property({
    type: Number,
  })
  accessor max: number | undefined;

  /**
   * 表单校验最小长度
   */
  @property({
    type: Number,
  })
  accessor min: number | undefined;

  /**
   * 校验信息
   */
  @property({
    attribute: false,
  })
  accessor message: Record<string, string> | undefined;

  /**
   * 自定义样式
   */
  @property({ attribute: false }) accessor textareaStyle:
    | React.CSSProperties
    | undefined;

  /**
   * 主题变体
   */
  @property({ render: false })
  accessor themeVariant: "default" | "elevo" | undefined;

  /**
   * @detail
   * @description 值改变事件
   */
  @event({ type: "change" })
  accessor #InputChangeEvent!: EventEmitter<string>;

  /**
   * focus
   */
  @method({ bound: true })
  focusTextarea() {
    return this.#componentRef.current?.focus();
  }

  handleInputChange = (value: string) => {
    this.value = value;
    this.#InputChangeEvent.emit(value);
  };

  render() {
    return (
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      <TextareaComponent
        curElement={this}
        formElement={this.getFormElement()}
        name={this.name}
        label={this.label}
        value={this.value}
        required={this.required}
        placeholder={this.placeholder}
        disabled={this.disabled}
        minLength={this.minLength}
        maxLength={this.maxLength}
        autoSize={this.autoSize}
        notRender={this.notRender}
        labelBrick={this.labelBrick}
        helpBrick={this.helpBrick}
        textareaStyle={this.textareaStyle}
        validateState={this.validateState}
        max={this.max}
        min={this.min}
        message={this.message}
        trigger="handleInputChange"
        ref={this.#componentRef}
        onInputChange={this.handleInputChange}
      />
    );
  }
}

export const TextareaComponent = forwardRef<
  TextareaComponentRef,
  TextareaComponentProps
>(function TextareaComponent(props, ref) {
  const {
    name,
    value,
    placeholder,
    disabled,
    textareaStyle,
    minLength,
    maxLength,
    autoSize,
    validateState,
    onInputChange,
  } = props;
  const [minRows, maxRows] = React.useMemo(() => {
    if (autoSize && typeof autoSize === "object") {
      return [autoSize.minRows, autoSize.maxRows];
    }

    return [];
  }, [autoSize]);

  const formItemRef = useRef<FormItem>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onInputChange(e.target.value);
    },
    [onInputChange]
  );

  return (
    <WrappedFormItem
      exportparts="message"
      {...pickFormItemProps(props)}
      ref={formItemRef}
    >
      <TextareaAutoResize
        ref={ref}
        containerRef={formItemRef}
        autoResize={!!autoSize}
        minRows={minRows}
        maxRows={maxRows}
        className={classNames({
          error: validateState === "error",
        })}
        name={name}
        value={value}
        disabled={disabled}
        style={{
          // Use the minimal height when auto-size enabled, prevent layout shift.
          // By default, the height is 22px each row + 10px (padding & border).
          ...(autoSize
            ? {
                height:
                  (typeof autoSize === "object" ? (autoSize.minRows ?? 1) : 1) *
                    22 +
                  10,
              }
            : null),
          ...textareaStyle,
        }}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        onChange={handleChange}
      />
    </WrappedFormItem>
  );
});

export { Textarea };
