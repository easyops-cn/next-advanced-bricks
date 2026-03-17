import React, { useMemo } from "react";
import { Select, Avatar, Tooltip } from "antd";
import { SelectValue } from "antd/lib/select";
import {
  debounce,
  get,
  compact,
  castArray,
  defaults,
  isEqual,
  difference,
  isNil,
  trim,
} from "lodash";

import { handleHttpError } from "@next-core/runtime";
import { ReactUseMultipleBricks, useProvider } from "@next-core/react-runtime";
import { UseBrickConfOrRenderFunction } from "@next-core/react-runtime";
import { InstanceApi_postSearchV3 } from "@next-api-sdk/cmdb-sdk";
import classNames from "classnames";

import { i18n, initializeI18n } from "@next-core/i18n";
import { K, NS, locales } from "./i18n.js";

import style from "./CmdbInstanceSelect.module.css";

initializeI18n(NS, locales);

// 从 @shared/cmdb-utils 迁移过来的工具函数
export const getInstanceNameKey = (objectId: string | number) =>
  objectId === "HOST" ? "hostname" : "name";

export function parseTemplate(
  template: string,
  data: Record<string, any>,
  skipUndefined = false
) {
  return template.replace(
    /#{([#A-Za-z_$][\w$]*(?:(?:\.[A-Za-z_$][\w$]*)|(?:\[[0-9]+\]))*)}/g,
    (match: string, key: string) => {
      const value = get(data, key);

      return value === undefined
        ? skipUndefined === true
          ? match
          : ""
        : value;
    }
  );
}

export interface CmdbInstanceSelectProps {
  /** 模型对象 ID，必填，指定要查询的模型 */
  objectId: string;
  /** 选择模式，支持 "default"（单选）、"multiple"（多选）、"tags"（标签模式） */
  mode?: string;
  /** 每页加载的实例数量，默认值通常为 20 */
  pageSize?: number;
  /** 实例查询条件，支持 CMDB 查询语法（如 { name: { $like: "%test%" } }） */
  instanceQuery?: any;
  /** 输入框占位文本，如"请选择"或"请输入搜索关键词" */
  placeholder?: string;
  /** 自定义字段配置，用于指定显示哪些字段以及如何显示 */
  fields?: Partial<ComplexOption<string>>;
  /** 是否为首次渲染，用于控制初始化行为 */
  firstRender?: boolean;
  /** 最少输入字符数才触发搜索，设置为 0 表示无限制 */
  minimumInputLength?: number;
  /** 当前选中值，单选时为字符串或数字，多选时为数组 */
  value?: any;
  /** 值变更回调函数，参数为新选中的值和对应的选项对象 */
  onChange?: (value: string, option?: ComplexOption) => void;
  /** 选项列表变更回调，当选项数据加载完成时触发 */
  optionsChange?: (options: ComplexOption[]) => void;
  /** 是否显示清除按钮 */
  allowClear?: boolean;
  /** 输入框自定义样式 */
  inputBoxStyle?: React.CSSProperties;
  /** 额外的搜索字段 ID 数组，用于在多个字段中搜索关键词 */
  extraSearchKey?: string[];
  /** 额外要查询的字段 ID 数组，用于在返回数据中包含更多字段 */
  extraFields?: string[];
  /** 弹出层定位类型，"default" 为相对于触发元素，"parent" 为相对于父容器 */
  popoverPositionType?: "default" | "parent";
  /** 是否启用多标签显示模式 */
  isMultiLabel?: boolean;
  /** 是否显示搜索提示文本 */
  showSearchTip?: boolean;
  /** 显示标签的模板字符串（如 "{{name}} ({{ip}})"），使用 {{fieldId}} 占位符 */
  labelTemplate?: string;
  /** 是否禁用选择器 */
  disabled?: boolean;
  /** 权限控制数组，可包含 "read"、"update"、"operate" 等权限值 */
  permission?: Array<"read" | "update" | "operate">;
  /** 是否在选项文本超长时显示 Tooltip */
  showTooltip?: boolean;
  /** 是否忽略字段缺失错误（当查询的字段在模型中不存在时不报错） */
  ignoreMissingFieldError?: boolean;
  /** 是否显示关键字段（通常是 instanceId） */
  showKeyField?: boolean;
  /** 下拉菜单宽度是否跟随选择框宽度 */
  dropdownMatchSelectWidth?: boolean;
  /** 下拉菜单自定义样式 */
  dropdownStyle?: React.CSSProperties;
  /** 值变化后是否自动失焦（关闭下拉菜单） */
  blurAfterValueChanged?: boolean;
  /** 排序配置数组，如 [{ name: 1 }] 表示按 name 字段升序排序 */
  sort?: Array<Record<string, number | string>>;
  /** 后缀自定义构件配置，用于在选择器后面添加自定义元素 */
  suffix?: {
    useBrick: UseBrickConfOrRenderFunction;
  };
  /** 是否使用构件可见性控制 */
  useBrickVisible?: boolean;
  /** 是否使用外部 CMDB API */
  useExternalCmdbApi?: boolean;
  /** 外部数据源 ID */
  externalSourceId?: string;
  /** 自定义弹出层容器 */
  getPopupContainer?: (node: HTMLElement) => HTMLElement;
}

export interface ComplexOption<T = string | number> {
  label: string[] | string;
  value: T;
  user_icon?: string; // objectId为USER的时候显示用户头像
}

export function formatUserQuery(instanceQuery: any): any[] {
  const arr = Array.isArray(instanceQuery) ? instanceQuery : [instanceQuery];

  return compact(arr);
}

/**
 * CMDB 实例下拉选择器组件
 *
 * 基于 Ant Design Select 的 CMDB 实例选择器，支持搜索、分页加载、
 * 单选和多选模式。自动调用 CMDB API 获取实例列表。
 *
 * 主要特性：
 * - 支持关键词搜索（搜索防抖 300ms）
 * - 支持分页加载（滚动到底部自动加载下一页）
 * - 支持单选和多选模式
 * - 支持自定义查询条件（instanceQuery）
 * - 支持自定义显示字段（labelTemplate）
 * - USER 模型特殊处理（显示用户头像）
 * - 支持权限控制（permission）
 * - 支持外部 CMDB 数据源
 * - 支持自定义后缀内容
 */
export const CmdbInstanceSelect = React.forwardRef(function CmdbInstanceSelect(
  props: CmdbInstanceSelectProps,
  ref: any
): React.ReactElement {
  const {
    showKeyField,
    // 默认显示 label 为模型的 name/hostname, value 为 instanceId
    // 当showKeyField时，实例展示是用showKey里的数据展示
    fields = {
      label: [showKeyField ? "#showKey" : getInstanceNameKey(props.objectId)],
      value: "instanceId",
    },
    firstRender = true,
    minimumInputLength = 0,
    extraSearchKey = [],
    extraFields = [],
    mode,
    placeholder,
    allowClear,
    pageSize = 30,
    isMultiLabel = true,
    showSearchTip,
    permission,
    ignoreMissingFieldError,
    dropdownMatchSelectWidth = true,
    blurAfterValueChanged,
    suffix,
    useExternalCmdbApi,
    externalSourceId,
  } = props;
  const userQuery = formatUserQuery(props.instanceQuery);
  //istanbul ignore else
  if (!fields.value) {
    fields.value = "instanceId";
  }

  const [value, setValue] = React.useState<unknown>();
  const [objectId, setObjectId] = React.useState<string>();
  const [options, setOptions] = React.useState<ComplexOption[]>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<ComplexOption[]>(
    []
  );
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // 用于外部调用的接口, 当useExternalCmdbApi为true，才调用这些接口
  const externalPostSearchV3 = useProvider(
    "easyops.api.cmdb.topo_center@ProxyPostSearchV3:1.0.1",
    { cache: false }
  );

  // useExternalCmdbApi为true，外部接口参数
  const externalRequestParams = useMemo(() => {
    return {
      objectId: props.objectId,
      sourceId: props.externalSourceId,
    };
  }, [props.objectId, externalSourceId]);
  const computeFields = () => {
    const result = [
      fields.value,
      ...(Array.isArray(fields.label) ? fields.label : [fields.label]),
      ...extraSearchKey,
      ...extraFields,
    ];

    if (props.objectId === "USER") {
      result.push("user_icon");
    }
    return result;
  };

  const handleChange = (newValue: any): void => {
    let selected: any | any[];
    if (mode === "multiple") {
      const valueSet = new Set(newValue);
      selected = options.filter((item) => valueSet.has(item.value));
      const oldValueSet = new Set(
        difference(
          newValue,
          (selected as any[]).map((item) => item.value)
        )
      );
      selected = selected.concat(
        selectedOptions.filter((item) => oldValueSet.has(item.value))
      );
    } else {
      selected = options.find((item) => item.value === newValue);
    }

    if (blurAfterValueChanged) {
      const selectNodes = document.getElementsByClassName(
        "formsCmdbInstSelect"
      );
      for (let i = 0; i < selectNodes.length; i++) {
        selectNodes[i].getElementsByTagName("input")?.[0]?.blur();
      }
    }
    setValue(newValue);
    setSelectedOptions(selected);
    props.onChange && props.onChange(newValue, selected);
  };
  //istanbul ignore else
  const handleSearch = async (
    q: string,
    extraQuery: any,
    forceSearch = false,
    pageSizeQuery?: number
  ): Promise<ComplexOption[]> => {
    if (forceSearch || q.length >= minimumInputLength) {
      try {
        let list = [];
        if (!props.objectId) {
          return [];
        }
        setLoading(true);
        const fieldsQuery = Array.isArray(fields.label)
          ? fields.label
              .filter((label) => !!label)
              .map((label) => ({ [label]: { $like: `%${q}%` } }))
          : fields.label
            ? [{ [fields.label]: { $like: `%${q}%` } }]
            : [];
        const paramQuery = {
          query: {
            $and: [
              {
                $or: [
                  ...fieldsQuery,
                  ...extraSearchKey.map((key) => ({
                    [key]: { $like: `%${q}%` },
                  })),
                ],
              },

              ...extraQuery,
            ],
          },
          ...(permission ? { permission } : {}),
          fields: computeFields().filter((f): f is string => !!f),
          page: 1,
          page_size: pageSizeQuery || pageSize,
          ignore_missing_field_error: ignoreMissingFieldError,
          sort: props.sort,
        };
        const data = useExternalCmdbApi
          ? await externalPostSearchV3.query([
              {
                ...paramQuery,
                ...externalRequestParams,
              },
            ])
          : await InstanceApi_postSearchV3(props.objectId, paramQuery);

        list = data.list;
        setTotal(data.total);
        // 根据用户设置路径显示特定的 label 和 value
        const option = list.map((item: any) => ({
          ...item,
          label: Array.isArray(fields.label)
            ? fields.label.map((label) =>
                label ? get(item, label) : undefined
              )
            : fields.label
              ? get(item, fields.label)
              : undefined,
          value: fields.value ? get(item, fields.value) : undefined,
          ...(props.objectId === "USER"
            ? {
                user_icon: get(item, "user_icon", "defaultIcon"),
              }
            : {}),
        }));
        setOptions(option);
        props.optionsChange?.(option);
        return option;
      } catch (e) {
        handleHttpError(e);
        return [];
      } finally {
        setLoading(false);
      }
    }
    return [];
  };
  const fetchInstanceData = async (): Promise<void> => {
    await handleSearch("", userQuery);
  };
  const getLabelOptions = (op: any) => {
    if (props.labelTemplate) {
      return parseTemplate(props.labelTemplate, op);
    } else {
      const label = op.label;
      if (Array.isArray(label)) {
        const firstKey = label[0];
        const resKey = label.slice(1, label.length).join(",");
        if (Array.isArray(firstKey) && props.showKeyField) {
          const subFirstKey = firstKey[0];
          const subResKey = firstKey.slice(1, firstKey.length).join(",");
          return subResKey && isMultiLabel
            ? `${subFirstKey}(${subResKey})`
            : (subFirstKey ?? "");
        }
        return resKey && isMultiLabel
          ? `${firstKey ?? " - "}(${resKey})`
          : (firstKey ?? "");
      } else {
        return label;
      }
    }
  };

  React.useEffect(() => {
    // 初始化时通过用户的 value 得出首次 label 的值
    // 由于value的不确定性，可能存在首次查询的值不唯一，初始化时也添加instanceQuery
    if (
      props.objectId &&
      !isNil(props.value) &&
      (!isEqual(props.objectId, objectId) || !isEqual(props.value, value))
    ) {
      (async () => {
        const option = await handleSearch(
          "",
          [
            {
              [fields.value || "instanceId"]: {
                $in: castArray(props.value),
              },
            },

            ...userQuery,
          ],
          true,
          props.value?.length >= pageSize ? props.value.length : pageSize
        );
        setSelectedOptions(option);
      })();
    }
    const _value =
      props.mode === "multiple" && !trim(props.value) ? [] : props.value;
    setValue(_value);
    setObjectId(props.objectId);
  }, [props.value, props.objectId]);

  React.useEffect(() => {
    if (!firstRender) {
      const resetVal: [] | "" = mode === "multiple" ? [] : "";
      setValue(resetVal);
    }
  }, [props.objectId]);
  //istanbul ignore else
  const debounceSearch = debounce(
    (q: string) => handleSearch(q, userQuery),
    500
  );

  return (
    <Select
      ref={ref}
      loading={loading}
      className="formsCmdbInstSelect"
      allowClear={allowClear}
      style={defaults(props.inputBoxStyle, { width: "100%" })}
      showSearch
      filterOption={false}
      value={value as SelectValue}
      mode={mode as "multiple" | "tags"}
      placeholder={placeholder || i18n.t(`${NS}:${K.BACKGROUND_SEARCH}`)}
      onChange={handleChange}
      onSearch={debounceSearch}
      onFocus={fetchInstanceData}
      disabled={props.disabled}
      dropdownStyle={{ padding: "2px", ...props.dropdownStyle }}
      dropdownMatchSelectWidth={dropdownMatchSelectWidth}
      dropdownRender={(menu) => {
        return (
          <div>
            {menu}
            {showSearchTip && total > pageSize && (
              <div className={style.moreChoices}>
                仅显示前{pageSize}项，更多结果请搜索
              </div>
            )}
          </div>
        );
      }}
      {...(props.popoverPositionType === "parent"
        ? { getPopupContainer: (triggerNode) => triggerNode.parentElement }
        : { getPopupContainer: props.getPopupContainer })}
    >
      {options.map((op, index) => {
        const optionLabel = getLabelOptions(op);
        return (
          <Select.Option key={index} value={op.value} label={optionLabel}>
            <Tooltip title={props.showTooltip ? optionLabel : undefined}>
              <div className={classNames(style.optionDiv)}>
                {op.user_icon && (
                  <span>
                    <Avatar
                      src={op.user_icon}
                      size={24}
                      className={classNames(style.avatar, {
                        [style.defaultIcon]: op.user_icon === "defaultIcon",
                      })}
                    >
                      {op.user_icon === "defaultIcon" && op.label?.slice(0, 2)}
                    </Avatar>
                  </span>
                )}
                <span
                  className={classNames(style.optionSpan)}
                  data-testid="option-label"
                >
                  {optionLabel}
                </span>
                {suffix?.useBrick && (
                  <div className={style.suffixContainer}>
                    <ReactUseMultipleBricks
                      useBrick={suffix.useBrick}
                      data={op}
                    />
                  </div>
                )}
              </div>
            </Tooltip>
          </Select.Option>
        );
      })}
    </Select>
  );
});
