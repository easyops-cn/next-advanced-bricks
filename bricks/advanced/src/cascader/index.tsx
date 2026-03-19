import React, { CSSProperties, useMemo } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { Cascader, ConfigProvider, theme } from "antd";
import {
  CascaderProps as AntdCascaderProps,
  DefaultOptionType,
} from "antd/lib/cascader";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import type { FormItem, FormItemProps } from "@next-bricks/form/form-item";
import { FormItemElementBase } from "@next-shared/form";
import { useCurrentTheme } from "@next-core/react-runtime";
import styleText from "./styles.shadow.css";

const { defineElement, property, event } = createDecorators();

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedFormItem = wrapBrick<FormItem, FormItemProps>("eo-form-item");

export type CascaderBrickProps = Omit<CascaderProps, "shadowRoot" | "onChange">;

export interface CascaderProps
  extends Pick<
    AntdCascaderProps,
    "options" | "fieldNames" | "value" | "expandTrigger" | "size"
  > {
  shadowRoot: ShadowRoot | null;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  limit?: number;
  suffixIcon?: GeneralIconProps;
  popupPlacement?: AntdCascaderProps["placement"];
  cascaderStyle?: CSSProperties;
  maxTagCount?: number | "responsive";
  onChange?: (
    value: AntdCascaderProps["value"],
    selectedOptions: DefaultOptionType[] | DefaultOptionType[][]
  ) => void;
}

export interface CascaderChangeEventDetail {
  value: AntdCascaderProps["value"];
  selectedOptions: DefaultOptionType[] | DefaultOptionType[][];
}

export interface CascaderEventsMap {
  "cascader.change": CustomEvent<CascaderChangeEventDetail>;
}

export interface CascaderEventsMapping {
  onCascaderChange: "cascader.change";
}

/**
 * 级联选择器
 * @author nlicroshan
 * @category form-input-basic
 */
export
@defineElement("eo-cascader", {
  alias: ["advanced.general-cascader"],
  styleTexts: [styleText],
})
class CascaderBrick extends FormItemElementBase implements CascaderBrickProps {
  /** 表单字段名 */
  @property()
  accessor name: string | undefined;

  /** 表单字段标签 */
  @property()
  accessor label: string | undefined;

  /** 是否为必填项 */
  @property({
    type: Boolean,
  })
  accessor required: boolean | undefined;

  /** 可选项数据源 */
  @property({
    attribute: false,
  })
  accessor options: AntdCascaderProps["options"];

  /** 自定义字段名，指定 label、value、children 对应的字段 */
  @property({
    attribute: false,
  })
  accessor fieldNames: AntdCascaderProps["fieldNames"] = {
    label: "label",
    value: "value",
    children: "children",
  };

  /** 当前选中的值 */
  @property({
    attribute: false,
  })
  accessor value: AntdCascaderProps["value"];

  /** 输入框占位文本 */
  @property()
  accessor placeholder: string | undefined;

  /** 是否支持多选 */
  @property({
    type: Boolean,
  })
  accessor multiple: boolean | undefined;

  /** 是否禁用 */
  @property({
    type: Boolean,
  })
  accessor disabled: boolean | undefined;

  /** 是否支持清除 */
  @property({
    type: Boolean,
  })
  accessor allowClear: boolean | undefined = true;

  /** 是否支持搜索，开启后可通过输入关键字过滤选项 */
  @property({
    type: Boolean,
  })
  accessor showSearch: boolean | undefined = true;

  /** 自定义下拉箭头图标 */
  @property({
    attribute: false,
  })
  accessor suffixIcon: GeneralIconProps | undefined;

  /** 次级菜单的展开方式，可选 click 或 hover */
  @property()
  accessor expandTrigger: AntdCascaderProps["expandTrigger"] = "click";

  /** 浮层预设位置，可选 bottomLeft、bottomRight、topLeft、topRight */
  @property()
  accessor popupPlacement: AntdCascaderProps["placement"] = "bottomLeft";

  /** 输入框大小，可选 large、middle、small */
  @property()
  accessor size: AntdCascaderProps["size"];

  /** 搜索结果的最大条数，0 表示不限制 */
  @property({
    type: Number,
  })
  accessor limit: number | undefined = 50;

  /** 多选模式下最多显示的 tag 数量，设为 responsive 时会自适应宽度 */
  @property({
    attribute: false,
  })
  accessor maxTagCount: number | "responsive" | undefined;

  /** 级联选择器的内联样式 */
  @property({
    attribute: false,
  })
  accessor cascaderStyle: CSSProperties | undefined;

  /**
   * @detail { value: 选择的值, selectedOptions: 选择的值所对应的 options }
   * @description 级联选择项输入变化时触发
   */
  @event({ type: "cascader.change" })
  accessor #changeEvent!: EventEmitter<CascaderChangeEventDetail>;

  handleOnChange = (
    value: AntdCascaderProps["value"],
    selectedOptions: DefaultOptionType[] | DefaultOptionType[][]
  ): void => {
    this.value = value;
    Promise.resolve().then(() => {
      this.#changeEvent.emit({ value, selectedOptions });
    });
  };

  render() {
    return (
      <WrappedFormItem
        exportparts="message"
        curElement={this as HTMLElement}
        formElement={this.getFormElement()}
        name={this.name}
        label={this.label}
        required={this.required}
        notRender={this.notRender}
        trigger="handleOnChange"
      >
        <CascaderElement
          shadowRoot={this.shadowRoot}
          options={this.options}
          fieldNames={this.fieldNames}
          value={this.value}
          multiple={this.multiple}
          placeholder={this.placeholder}
          disabled={this.disabled}
          allowClear={this.allowClear}
          showSearch={this.showSearch}
          expandTrigger={this.expandTrigger}
          suffixIcon={this.suffixIcon}
          size={this.size}
          limit={this.limit}
          popupPlacement={this.popupPlacement}
          maxTagCount={this.maxTagCount}
          cascaderStyle={this.cascaderStyle}
          onChange={this.handleOnChange}
        />
      </WrappedFormItem>
    );
  }
}

function CascaderElement(props: CascaderProps): React.ReactElement {
  const {
    shadowRoot,
    options,
    fieldNames,
    value,
    placeholder,
    disabled,
    multiple,
    allowClear,
    showSearch,
    expandTrigger,
    size,
    limit,
    popupPlacement,
    cascaderStyle,
    suffixIcon,
    maxTagCount,
    onChange,
  } = props;

  const currentTheme = useCurrentTheme();

  const cache = useMemo(() => {
    return createCache();
  }, []);

  const filter = (inputValue: string, path: DefaultOptionType[]): boolean => {
    const label = fieldNames?.label || "label";
    const filterValues = inputValue
      .split(" ")
      .filter((item) => item)
      .map((item) => item.toLocaleLowerCase());
    for (let j = 0; j < filterValues.length; j++) {
      if (
        !path.some((option) =>
          (option[label] as string).toLowerCase().includes(filterValues[j])
        )
      ) {
        return false;
      }
    }
    return true;
  };

  return (
    <ConfigProvider
      theme={{
        algorithm:
          /* istanbul ignore next */
          currentTheme === "dark-v2"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
      }}
    >
      <StyleProvider
        container={shadowRoot as ShadowRoot}
        cache={cache}
        // Set hashPriority to "high" to disable `:where()` usage for compatibility
        hashPriority="high"
      >
        <Cascader
          getPopupContainer={(trigger) => trigger.parentElement}
          allowClear={allowClear}
          disabled={disabled}
          multiple={multiple as true | undefined}
          expandTrigger={expandTrigger}
          fieldNames={fieldNames}
          placeholder={placeholder}
          size={size}
          showSearch={showSearch && { limit, filter }}
          placement={popupPlacement}
          style={cascaderStyle}
          suffixIcon={suffixIcon && <WrappedIcon {...suffixIcon} />}
          maxTagCount={maxTagCount}
          value={value as any}
          options={options}
          onChange={
            ((
              value: AntdCascaderProps["value"],
              selectedOptions: DefaultOptionType[] | DefaultOptionType[][]
            ) => onChange?.(value, selectedOptions)) as any
          }
        />
      </StyleProvider>
    </ConfigProvider>
  );
}
