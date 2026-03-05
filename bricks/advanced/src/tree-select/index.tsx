import React, { CSSProperties, useMemo } from "react";
import { EventEmitter, createDecorators } from "@next-core/element";
import { wrapBrick } from "@next-core/react-element";
import "@next-core/theme";
import type {
  GeneralIcon,
  GeneralIconProps,
} from "@next-bricks/icons/general-icon";
import { TreeSelect, ConfigProvider, theme } from "antd";
import { TreeSelectProps as AntdTreeSelectProps } from "antd/lib/tree-select";
import { StyleProvider, createCache } from "@ant-design/cssinjs";
import type { FormItem, FormItemProps } from "@next-bricks/form/form-item";
import { FormItemElementBase } from "@next-shared/form";
import { useCurrentTheme } from "@next-core/react-runtime";
import styleText from "./styles.shadow.css";
import classNames from "classnames";

const { defineElement, property, event } = createDecorators();

const WrappedIcon = wrapBrick<GeneralIcon, GeneralIconProps>("eo-icon");
const WrappedFormItem = wrapBrick<FormItem, FormItemProps>("eo-form-item");

export interface TreeSelectProps
  extends Pick<
    AntdTreeSelectProps,
    | "value"
    | "allowClear"
    | "disabled"
    | "fieldNames"
    | "filterTreeNode"
    | "maxTagCount"
    | "multiple"
    | "onSearch"
    | "onSelect"
    | "onChange"
    | "onTreeExpand"
    | "loading"
    | "placeholder"
    | "size"
    | "showSearch"
    | "searchValue"
    | "treeData"
    | "treeDefaultExpandAll"
    | "treeExpandedKeys"
  > {
  shadowRoot: ShadowRoot | null;
  checkable?: boolean;
  suffixIcon?: GeneralIconProps;
  popupPlacement?: AntdTreeSelectProps["placement"];
  dropdownStyle?: CSSProperties;
  maxTagCount?: number | "responsive";
  popupMatchSelectWidth?: boolean;
}

export interface TreeSelectEventsMap {
  change: CustomEvent<{ value: AntdTreeSelectProps["value"] }>;
  search: CustomEvent<string>;
  select: CustomEvent<{ value: AntdTreeSelectProps["value"] }>;
  expand: CustomEvent<{ keys: React.Key[] }>;
}

export interface TreeSelectEventsMapping {
  onChange: "change";
  onSearch: "search";
  onSelect: "select";
  onExpand: "expand";
}

/**
 * 树选择器，支持从树形数据中单选或多选节点
 * @author sailor
 * @category form-input-basic
 */
export
@defineElement("eo-tree-select", {
  styleTexts: [styleText],
})
class TreeSelectBrick extends FormItemElementBase implements TreeSelectProps {
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

  /** 树形数据源 */
  @property({
    attribute: false,
  })
  accessor treeData: AntdTreeSelectProps["treeData"];

  /** 是否默认展开所有树节点 */
  @property({ type: Boolean })
  accessor treeDefaultExpandAll: boolean | undefined;

  /** 受控展开的树节点 key 集合 */
  @property({ attribute: false })
  accessor treeExpandedKeys: string[] | undefined;

  /** 自定义字段名，指定 label、value、children 对应的字段 */
  @property({
    attribute: false,
  })
  accessor fieldNames: AntdTreeSelectProps["fieldNames"];

  /** 当前选中的值 */
  @property({
    attribute: false,
  })
  accessor value: AntdTreeSelectProps["value"];

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

  /** 是否支持勾选树节点（开启后自动开启 multiple 模式） */
  @property({
    type: Boolean,
  })
  accessor checkable: boolean | undefined;

  /** 是否支持清除 */
  @property({
    type: Boolean,
  })
  accessor allowClear: boolean | undefined = true;

  /** 是否显示加载中状态 */
  @property({
    type: Boolean,
  })
  accessor loading: boolean | undefined = false;

  /** 自定义树节点过滤函数 */
  @property({
    attribute: false,
  })
  accessor filterTreeNode: AntdTreeSelectProps["filterTreeNode"];

  /** 是否支持搜索，开启后可通过输入关键字过滤树节点 */
  @property({
    type: Boolean,
  })
  accessor showSearch: boolean | undefined = true;

  /** 自定义下拉箭头图标 */
  @property({
    attribute: false,
  })
  accessor suffixIcon: GeneralIconProps | undefined;

  /** 浮层预设位置，可选 bottomLeft、bottomRight、topLeft、topRight */
  @property()
  accessor popupPlacement: AntdTreeSelectProps["placement"] = "bottomLeft";

  /** 输入框大小，可选 large、middle、small */
  @property()
  accessor size: AntdTreeSelectProps["size"];

  /** 多选模式下最多显示的 tag 数量，设为 responsive 时会自适应宽度 */
  @property({
    attribute: false,
  })
  accessor maxTagCount: number | "responsive" | undefined;

  /** 下拉框的样式 */
  @property({
    attribute: false,
  })
  accessor dropdownStyle: CSSProperties | undefined;

  /** 下拉菜单的宽度是否与选择框相同 */
  @property({
    type: Boolean,
  })
  accessor popupMatchSelectWidth: boolean | undefined = true;

  /**
   * @detail { value: 选择的值 }
   * @description 选中值变化时触发
   */
  @event({ type: "change" })
  accessor #changeEvent!: EventEmitter<{
    value: AntdTreeSelectProps["value"];
  }>;

  handleOnChange = (value: AntdTreeSelectProps["value"]): void => {
    this.value = value;
    this.#changeEvent.emit({ value });
  };

  /**
   * @detail 搜索关键词
   * @description 搜索框值变化时触发
   */
  @event({ type: "search" })
  accessor #searchEvent!: EventEmitter<string>;

  #handleSearch = (value: string): void => {
    this.#searchEvent.emit(value);
  };

  /**
   * @detail { value: 选中的节点值 }
   * @description 选中某一树节点时触发
   */
  @event({ type: "select" })
  accessor #selectEvent!: EventEmitter<{ value: AntdTreeSelectProps["value"] }>;

  #handleSelect = (value: AntdTreeSelectProps["value"]): void => {
    this.#selectEvent.emit({ value });
  };

  /**
   * @detail { keys: 展开的节点 key 数组 }
   * @description 树节点展开/收缩时触发
   */
  @event({ type: "expand" })
  accessor #expandEvent!: EventEmitter<{ keys: React.Key[] }>;

  #handleExpand = (keys: React.Key[]): void => {
    this.#expandEvent.emit({ keys });
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
        <TreeSelectElement
          shadowRoot={this.shadowRoot}
          checkable={this.checkable}
          treeData={this.treeData}
          treeDefaultExpandAll={this.treeDefaultExpandAll}
          fieldNames={this.fieldNames}
          filterTreeNode={this.filterTreeNode}
          value={this.value}
          multiple={this.multiple}
          placeholder={this.placeholder}
          loading={this.loading}
          disabled={this.disabled}
          allowClear={this.allowClear}
          showSearch={this.showSearch}
          suffixIcon={this.suffixIcon}
          size={this.size}
          popupPlacement={this.popupPlacement}
          treeExpandedKeys={this.treeExpandedKeys}
          maxTagCount={this.maxTagCount}
          dropdownStyle={this.dropdownStyle}
          onChange={this.handleOnChange}
          onSearch={this.#handleSearch}
          onSelect={this.#handleSelect}
          onTreeExpand={this.#handleExpand}
          popupMatchSelectWidth={this.popupMatchSelectWidth}
        />
      </WrappedFormItem>
    );
  }
}

interface TreeSelectComponentProps extends TreeSelectProps {
  onChange?: (value: AntdTreeSelectProps["value"]) => void;
}

function TreeSelectElement(
  props: TreeSelectComponentProps
): React.ReactElement {
  const {
    shadowRoot,
    checkable,
    loading,
    treeData,
    treeExpandedKeys,
    treeDefaultExpandAll,
    fieldNames,
    value,
    placeholder,
    disabled,
    multiple,
    allowClear,
    popupPlacement,
    dropdownStyle,
    suffixIcon,
    size,
    maxTagCount,
    onChange,
    onSearch,
    onSelect,
    onTreeExpand,
    showSearch,
    popupMatchSelectWidth,
  } = props;

  const currentTheme = useCurrentTheme();

  const cache = useMemo(() => {
    return createCache();
  }, []);

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
      <StyleProvider container={shadowRoot as ShadowRoot} cache={cache}>
        <TreeSelect
          getPopupContainer={(trigger) => trigger.parentElement}
          allowClear={allowClear}
          loading={loading}
          disabled={disabled}
          multiple={multiple}
          fieldNames={fieldNames}
          placeholder={placeholder}
          placement={popupPlacement}
          dropdownStyle={dropdownStyle}
          suffixIcon={suffixIcon && <WrappedIcon {...suffixIcon} />}
          maxTagCount={maxTagCount}
          value={value}
          size={size}
          treeData={treeData}
          treeCheckable={checkable}
          treeExpandedKeys={treeExpandedKeys}
          treeDefaultExpandAll={treeDefaultExpandAll}
          onChange={onChange}
          onSelect={onSelect}
          onSearch={onSearch}
          onTreeExpand={onTreeExpand}
          virtual={false}
          showSearch={showSearch}
          popupMatchSelectWidth={popupMatchSelectWidth}
          className={classNames({
            notPopupMatchSelectWidth: !popupMatchSelectWidth,
          })}
        />
      </StyleProvider>
    </ConfigProvider>
  );
}
