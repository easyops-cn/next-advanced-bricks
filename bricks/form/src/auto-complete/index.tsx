import React, { useEffect, useRef, useMemo, useState } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import { wrapBrick } from "@next-core/react-element";
import { formatOptions } from "../utils/formatOptions.js";
import { cloneDeep, isEqual, toLower } from "lodash";
import type {
  Input,
  InputEvents,
  InputEventsMap,
  InputProps,
} from "../input/index.jsx";
import classNames from "classnames";
import {
  FormItemElementBase,
  MessageBody,
  pickFormItemProps,
} from "@next-shared/form";
import type { FormItem, FormItemProps } from "../form-item/index.jsx";

const { defineElement, property, event } = createDecorators();
const WrappedFormItem = wrapBrick<FormItem, FormItemProps>("eo-form-item");

const WrappedInput = wrapBrick<Input, InputProps, InputEvents, InputEventsMap>(
  "eo-input",
  {
    onChange: "change",
  }
);

export interface AutoCompleteProps extends FormItemProps {
  curElement?: HTMLElement;
  value?: string;
  options?: string[] | OptionType[];
  placeholder?: string;
  inputStyle?: React.CSSProperties;
  disabled?: boolean;
  filterByCaption?: boolean;
  validateState?: string;
  onChange?: (v: any) => void;
}

export interface AutoCompleteEvents {
  change: CustomEvent<string>;
}

export interface AutoCompleteEventsMap {
  onChange: "change";
}
export interface Option {
  label: string;
  caption?: string;
  value: any;
}

export interface OptionGroup {
  label: string;
  options: Option[];
}

export type OptionType = Option | OptionGroup;

/**
 * 带候选项的输入框
 * @author zhendonghuang
 *
 * @category form-input-basic
 */
export
@defineElement("eo-auto-complete", {
  styleTexts: [styleText],
})
class AutoComplete extends FormItemElementBase {
  /**
   * 字段名称
   */
  @property() accessor name: string | undefined;

  /**
   * 占位说明
   */
  @property() accessor placeholder: string | undefined;

  /**
   * 字段文本
   */
  @property() accessor label: string | undefined;

  /**
   * 输入框样式
   */
  @property({
    attribute: false,
  })
  accessor inputStyle: React.CSSProperties | undefined;

  /**
   * 是否禁用
   */
  @property({ type: Boolean })
  accessor disabled: boolean | undefined;

  /**
   * 是否必填
   */
  @property({ type: Boolean }) accessor required: boolean | undefined;

  @property()
  accessor value: string | undefined;

  /**
   * 选项列表
   * @required
   */
  @property({ attribute: false })
  accessor options: string[] | OptionType[] | undefined;

  /**
   * 搜索时是否根据caption过滤options
   */
  @property({ type: Boolean }) accessor filterByCaption: boolean | undefined;

  /**
   * 表单项校验方法
   */
  @property({
    attribute: false,
  })
  accessor validator: ((value: any) => MessageBody) | undefined;

  /**
   * 正则校验规则
   */
  @property() accessor pattern: string | undefined;

  /**
   * 校验文本信息
   */
  @property({ attribute: false }) accessor message:
    | Record<string, string>
    | undefined;

  /**
   * 值改变事件
   */
  @event({ type: "change" })
  accessor #changeEvent!: EventEmitter<string>;
  handleInputChange = (value: string) => {
    this.value = value;
    this.#changeEvent.emit(value);
  };

  render() {
    return (
      <EoAutoCompleteComponent
        curElement={this}
        formElement={this.getFormElement()}
        name={this.name}
        label={this.label}
        placeholder={this.placeholder}
        disabled={this.disabled}
        inputStyle={this.inputStyle}
        required={this.required}
        message={this.message}
        value={this.value}
        options={this.options}
        labelBrick={this.labelBrick}
        helpBrick={this.helpBrick}
        notRender={this.notRender}
        validator={this.validator}
        pattern={this.pattern}
        filterByCaption={this.filterByCaption}
        validateState={this.validateState}
        trigger="handleInputChange"
        onChange={this.handleInputChange}
      />
    );
  }
}

export function EoAutoCompleteComponent(props: AutoCompleteProps) {
  const {
    onChange,
    inputStyle,
    disabled,
    placeholder,
    filterByCaption,
    validateState,
  } = props;
  const [options, setOptions] = useState(props.options || []);
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [active, setActive] = useState(false);
  const [value, setValue] = useState<string>("");
  const inputRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);

  const originalOptions: OptionType[] = useMemo(() => {
    const walkOptions = (options: (OptionType | string)[]): OptionType[] => {
      return formatOptions(options)?.map((op) => {
        if ("options" in op && Array.isArray(op.options)) {
          return { ...op, options: walkOptions(op.options) } as OptionGroup;
        } else {
          return op;
        }
      });
    };

    return walkOptions(options);
  }, [options]);

  const handleChange = (e: CustomEvent<string>) => {
    setValue(e.detail);
    const search = (options: OptionType[]) => {
      for (let i = options.length - 1; i >= 0; i--) {
        const option = options[i] as OptionGroup;
        if (option.options?.length) {
          search(option.options);
        }
        if (
          !option.options?.length &&
          !toLower(option.label).includes(toLower(e.detail)) &&
          (!filterByCaption ||
            !toLower((option as any).caption).includes(toLower(e.detail)))
        ) {
          options.splice(i, 1);
        }
      }
      return options;
    };
    const result = search(cloneDeep(originalOptions));
    setFilteredOptions(result);
    onChange?.(e.detail);
  };
  useEffect(() => {
    if (!isEqual(props.options, options)) {
      setOptions(props.options || []);
    }
  }, [props.options]);

  useEffect(() => {
    setValue(props.value || "");
  }, [props.value]);

  useEffect(() => {
    setFilteredOptions(originalOptions);
  }, [originalOptions]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      e.stopPropagation();
      const path = e.composedPath();
      const containerElement = containerRef.current;
      if (containerElement && path.includes(containerElement)) return;
      setActive(false);
      inputRef.current?.blur();
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const renderLabel = (option: Option, index: number) => {
    return (
      <div
        key={`${option.label}_${index}`}
        className={classNames("option-container", {
          "selected-option": value === option.value,
        })}
        onClick={() => {
          setValue(option.value);
          setActive(false);
          onChange?.(option.value);
        }}
      >
        <div className="label">{option.label}</div>
        {option.caption && <div className="caption">{option.caption}</div>}
      </div>
    );
  };

  return (
    <WrappedFormItem exportparts="message" {...pickFormItemProps(props)}>
      <div className="complete-container" ref={containerRef}>
        <WrappedInput
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          inputStyle={inputStyle}
          validateState={validateState}
          onFocus={() => {
            setActive(true);
          }}
          onChange={handleChange as any}
        />
        {active && filteredOptions.length ? (
          <div className="dropdown-wrapper">
            <div className="dropdown-list">
              {filteredOptions.map((f: any, index) =>
                f.options?.length ? (
                  <div key={`${f.label}_${index}`} className="group-wrapper">
                    <div className="group-item">{f.label}</div>
                    {f.options.map((option: any, i: number) =>
                      renderLabel(option, i)
                    )}
                  </div>
                ) : (
                  renderLabel(f, index)
                )
              )}
            </div>
            <slot name="options-toolbar"></slot>
          </div>
        ) : null}
      </div>
    </WrappedFormItem>
  );
}
