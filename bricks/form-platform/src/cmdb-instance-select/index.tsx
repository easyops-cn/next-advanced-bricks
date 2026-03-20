import React, { useEffect, useMemo, useRef } from "react";
import { createDecorators, EventEmitter } from "@next-core/element";
import { wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import styleText from "./styles.shadow.css";
import { FormItem, FormItemProps } from "@next-bricks/form/form-item";
import { FormItemElementBase, pickFormItemProps } from "@next-shared/form";
import {
  CmdbInstanceSelect,
  ComplexOption,
} from "./CmdbInstanceSelectInternal";
import { isNil } from "lodash";
import { ConfigProvider, theme } from "antd";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import { useCurrentTheme } from "@next-core/react-runtime";
import { i18n, initializeI18n } from "@next-core/i18n";
import { NS, locales } from "./i18n.js";
import enUS from "antd/locale/en_US.js";
import zhCN from "antd/locale/zh_CN.js";
initializeI18n(NS, locales);

const { defineElement, property, event } = createDecorators();
const WrappedFormItem = wrapBrick<FormItem, FormItemProps>("eo-form-item");

export type EoCmdbInstanceSelectProps = Omit<
  EoCmdbInstanceSelectComponentProps,
  "shadowRoot" | "onChange" | "onOptionsChange"
>;

interface EoCmdbInstanceSelectComponentProps extends FormItemProps {
  shadowRoot: ShadowRoot | null;
  objectId: string;
  mode?: string;
  pageSize?: number;
  instanceQuery?: any;
  placeholder?: string;
  fields?: Partial<ComplexOption<string>>;
  minimumInputLength?: number;
  value?: string | string[];
  onChange?: (value: string | string[], option?: ComplexOption) => void;
  onOptionsChange?: (options: ComplexOption[]) => void;
  allowClear?: boolean;
  inputBoxStyle?: React.CSSProperties;
  extraSearchKey?: string[];
  extraFields?: string[];
  popoverPositionType?: "default" | "parent";
  isMultiLabel?: boolean;
  showSearchTip?: boolean;
  labelTemplate?: string;
  disabled?: boolean;
  permission?: Array<"read" | "update" | "operate">;
  showTooltip?: boolean;
  ignoreMissingFieldError?: boolean;
  showKeyField?: boolean;
  dropdownMatchSelectWidth?: boolean;
  dropdownStyle?: React.CSSProperties;
  blurAfterValueChanged?: boolean;
  sort?: Array<Record<string, number | string>>;
  useExternalCmdbApi?: boolean;
  externalSourceId?: string;
  validateState?: string;
  trigger?: string;
}

export interface CmdbInstanceSelectEventsMap {
  change: CustomEvent<string | string[]>;
  "change.v2": CustomEvent<ComplexOption>;
  "options.change": CustomEvent<{ options: ComplexOption[]; name: string }>;
}

export interface CmdbInstanceSelectEventsMapping {
  onChange: "change";
  onChangeV2: "change.v2";
  onOptionsChange: "options.change";
}

/**
 * CMDB 实例选择器
 * @author jo
 * @category form-input-business
 * @insider
 */
export
@defineElement("eo-cmdb-instance-select", {
  styleTexts: [styleText],
})
class EoCmdbInstanceSelect
  extends FormItemElementBase
  implements EoCmdbInstanceSelectProps
{
  /**
   * 字段名称
   */
  @property() accessor name: string | undefined;

  /**
   * 字段说明
   */
  @property() accessor label: string | undefined;

  /**
   * 是否必填
   */
  @property({
    type: Boolean,
  })
  accessor required: boolean | undefined;

  /**
   * 字段placeholder
   */
  @property() accessor placeholder: string | undefined;

  /**
   * 值
   */
  @property({
    attribute: false,
  })
  accessor value: string | string[] | undefined;

  /**
   * 模型 id
   */
  @property()
  accessor objectId!: string;

  /**
   * 是否禁用
   */
  @property({
    type: Boolean,
  })
  accessor disabled: boolean | undefined;

  /**
   * 支持清除选项
   */
  @property({
    type: Boolean,
  })
  accessor allowClear: boolean | undefined;

  /**
   * 多选模式
   */
  @property()
  accessor mode: string | undefined;

  /**
   * 配置搜索接口的pageSize
   */
  @property({
    type: Number,
  })
  accessor pageSize: number | undefined;

  /**
   * 下拉框选项的过滤条件
   */
  @property({
    attribute: false,
  })
  accessor instanceQuery: any;

  /**
   * 自定义 select 下拉选项的 label 和 value 字段
   */
  @property({
    attribute: false,
  })
  accessor fields: Partial<ComplexOption<string>> | undefined;

  /**
   * 输入多少个字符才触发搜索动作
   */
  @property({
    type: Number,
  })
  accessor minimumInputLength: number | undefined;

  /**
   * 配置额外的字段进行搜索
   */
  @property({
    attribute: false,
  })
  accessor extraSearchKey: string[] | undefined;

  /**
   * 配置接口需要返回的额外字段
   */
  @property({
    attribute: false,
  })
  accessor extraFields: string[] | undefined;

  /**
   * 下拉选项的渲染方式
   */
  @property()
  accessor popoverPositionType: "default" | "parent" | undefined;

  /**
   * 控制下拉框中的label显示一个或者多个
   */
  @property({
    type: Boolean,
  })
  accessor isMultiLabel: boolean | undefined;

  /**
   * 下拉列表的最后一行是否显示提示
   */
  @property({
    type: Boolean,
  })
  accessor showSearchTip: boolean | undefined;

  /**
   * 可自定义label显示的模板
   */
  @property()
  accessor labelTemplate: string | undefined;

  /**
   * 输入框样式
   */
  @property({
    attribute: false,
  })
  accessor inputBoxStyle: React.CSSProperties | undefined;

  /**
   * 按照权限过滤实例
   */
  @property({
    attribute: false,
  })
  accessor permission: Array<"read" | "update" | "operate"> | undefined;

  /**
   * 下拉框中是否启用tooltip显示label全称
   */
  @property({
    type: Boolean,
  })
  accessor showTooltip: boolean | undefined;

  /**
   * 是否忽略不存在字段
   */
  @property({
    type: Boolean,
  })
  accessor ignoreMissingFieldError: boolean | undefined;

  /**
   * 实例通过showKey自定义展示
   */
  @property({
    type: Boolean,
  })
  accessor showKeyField: boolean | undefined;

  /**
   * 下拉菜单和选择器同宽
   */
  @property({
    type: Boolean,
  })
  accessor dropdownMatchSelectWidth: boolean | undefined;

  /**
   * 设置下拉框容器的样式
   */
  @property({
    attribute: false,
  })
  accessor dropdownStyle: React.CSSProperties | undefined;

  /**
   * 是否在选完值后取消聚焦
   */
  @property({
    type: Boolean,
  })
  accessor blurAfterValueChanged: boolean | undefined;

  /**
   * 配置接口返回数据的排序规则
   */
  @property({
    attribute: false,
  })
  accessor sort: Array<Record<string, number | string>> | undefined;

  /**
   * 使用外部数据源
   */
  @property({
    type: Boolean,
  })
  accessor useExternalCmdbApi: boolean | undefined;

  /**
   * 外部数据源id
   */
  @property()
  accessor externalSourceId: string | undefined;

  @event({ type: "change" })
  accessor #changeEvent!: EventEmitter<string | string[]>;

  @event({ type: "change.v2" })
  accessor #changeEventV2!: EventEmitter<ComplexOption>;

  @event({ type: "options.change" })
  accessor #optionsChangeEvent!: EventEmitter<{
    options: ComplexOption[];
    name: string;
  }>;

  handleChange = (value: string | string[], option?: ComplexOption) => {
    this.value = value;
    Promise.resolve().then(() => {
      this.#changeEvent.emit(value);
      this.#changeEventV2.emit(option || ({ value } as ComplexOption));
      this.getFormElement()?.resetValidateState();
    });
  };

  handleOptionsChange = (options: ComplexOption[]) => {
    Promise.resolve().then(() => {
      this.#optionsChangeEvent.emit({
        options,
        name: this.name!,
      });
    });
  };

  render() {
    return (
      <EoCmdbInstanceSelectComponent
        formElement={this.getFormElement()}
        curElement={this}
        name={this.name}
        label={this.label}
        required={this.required}
        value={this.value}
        validateState={this.validateState}
        notRender={this.notRender}
        helpBrick={this.helpBrick}
        trigger="handleChange"
        onChange={this.handleChange}
        onOptionsChange={this.handleOptionsChange}
        objectId={this.objectId}
        disabled={this.disabled}
        allowClear={this.allowClear}
        mode={this.mode}
        pageSize={this.pageSize}
        instanceQuery={this.instanceQuery}
        fields={this.fields}
        minimumInputLength={this.minimumInputLength}
        extraSearchKey={this.extraSearchKey}
        extraFields={this.extraFields}
        popoverPositionType={this.popoverPositionType}
        isMultiLabel={this.isMultiLabel}
        showSearchTip={this.showSearchTip}
        labelTemplate={this.labelTemplate}
        inputBoxStyle={this.inputBoxStyle}
        permission={this.permission}
        showTooltip={this.showTooltip}
        ignoreMissingFieldError={this.ignoreMissingFieldError}
        showKeyField={this.showKeyField}
        dropdownMatchSelectWidth={this.dropdownMatchSelectWidth}
        dropdownStyle={this.dropdownStyle}
        blurAfterValueChanged={this.blurAfterValueChanged}
        sort={this.sort}
        useExternalCmdbApi={this.useExternalCmdbApi}
        externalSourceId={this.externalSourceId}
        placeholder={this.placeholder}
        shadowRoot={this.shadowRoot}
      />
    );
  }
}

export function EoCmdbInstanceSelectComponent(
  props: EoCmdbInstanceSelectComponentProps
) {
  const selectRef = useRef<any>();
  const currentTheme = useCurrentTheme();
  const locale =
    i18n.language && i18n.language.split("-")[0] === "en" ? enUS : zhCN;

  useEffect(() => {
    if (!isNil(props.value)) {
      selectRef.current?.setInitValue?.(props.value);
    }
  }, [props.value]);

  const handleChange = (value: string, option?: ComplexOption) => {
    props.onChange?.(value, option);
  };

  const handleOptionsChange = (options: ComplexOption[]) => {
    props.onOptionsChange?.(options);
  };

  const cache = useMemo(() => {
    return createCache();
  }, []);

  return (
    <WrappedFormItem exportparts="message" {...pickFormItemProps(props)}>
      <ConfigProvider
        locale={locale as any}
        theme={{
          algorithm:
            currentTheme === "dark-v2"
              ? theme.darkAlgorithm
              : theme.defaultAlgorithm,
        }}
      >
        <StyleProvider container={props.shadowRoot as ShadowRoot} cache={cache}>
          <CmdbInstanceSelect
            ref={selectRef}
            objectId={props.objectId}
            mode={props.mode}
            pageSize={props.pageSize}
            instanceQuery={props.instanceQuery}
            placeholder={props.placeholder}
            fields={props.fields}
            firstRender={true}
            minimumInputLength={props.minimumInputLength}
            value={props.value}
            onChange={handleChange}
            optionsChange={handleOptionsChange}
            allowClear={props.allowClear}
            inputBoxStyle={props.inputBoxStyle}
            extraSearchKey={props.extraSearchKey}
            extraFields={props.extraFields}
            popoverPositionType={props.popoverPositionType}
            isMultiLabel={props.isMultiLabel}
            showSearchTip={props.showSearchTip}
            labelTemplate={props.labelTemplate}
            disabled={props.disabled}
            permission={props.permission}
            showTooltip={props.showTooltip}
            ignoreMissingFieldError={props.ignoreMissingFieldError}
            showKeyField={props.showKeyField}
            dropdownMatchSelectWidth={props.dropdownMatchSelectWidth}
            dropdownStyle={props.dropdownStyle}
            blurAfterValueChanged={props.blurAfterValueChanged}
            sort={props.sort}
            useExternalCmdbApi={props.useExternalCmdbApi}
            externalSourceId={props.externalSourceId}
            getPopupContainer={(trigger: HTMLElement) => trigger}
          />
        </StyleProvider>
      </ConfigProvider>
    </WrappedFormItem>
  );
}
