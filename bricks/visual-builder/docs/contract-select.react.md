---
tagName: visual-builder.contract-select
displayName: WrappedVisualBuilderContractSelect
description: 契约选择构件，提供契约名称和版本的联动选择，格式为 `contractName@namespace:version`，支持在表单中使用
category: ""
source: "@next-bricks/visual-builder"
---

# WrappedVisualBuilderContractSelect

> 契约选择构件，提供契约名称和版本的联动选择，格式为 `contractName@namespace:version`，支持在表单中使用

## 导入

```tsx
import { WrappedVisualBuilderContractSelect } from "@easyops/wrapped-components";
```

## Props

| 属性     | 类型                                                       | 必填 | 默认值 | 说明                                                      |
| -------- | ---------------------------------------------------------- | ---- | ------ | --------------------------------------------------------- |
| name     | `string`                                                   | 否   | -      | 表单字段名                                                |
| required | `boolean`                                                  | 否   | -      | 是否为必填项                                              |
| label    | `string`                                                   | 否   | -      | 表单项标签                                                |
| value    | `any`                                                      | 否   | -      | 当前选中的契约值，格式为 `contractName@namespace:version` |
| suffix   | `{ useBrick: UseSingleBrickConf \| UseSingleBrickConf[] }` | 否   | -      | 输入框后缀内容，使用 useBrick 自定义渲染                  |

## Events

| 事件     | detail                                                                 | 说明                 |
| -------- | ---------------------------------------------------------------------- | -------------------- |
| onChange | `string` — 选中的契约值字符串，格式为 `contractName@namespace:version` | 契约选择值变化时触发 |

## Examples

### Basic

展示契约选择构件的基本用法，搜索并选择契约名称和版本。

```tsx
<WrappedVisualBuilderContractSelect
  label="契约"
  name="contract"
  onChange={(e) => console.log(e.detail)}
/>
```

### Required Field

在表单中设置必填校验。

```tsx
<WrappedEoForm onValidateSuccess={(e) => console.log(e.detail)}>
  <WrappedVisualBuilderContractSelect
    label="契约"
    name="contract"
    required={true}
  />
  <WrappedEoSubmitButtons submitText="提交" />
</WrappedEoForm>
```

### With Value

设置初始契约值。

```tsx
<WrappedVisualBuilderContractSelect
  label="契约"
  name="contract"
  value="easyops.api.cmdb.instance@instance.GetDetail:1.0.0"
  onChange={(e) => console.log(e.detail)}
/>
```

### With Suffix

在选择器后添加自定义后缀内容。

```tsx
<WrappedVisualBuilderContractSelect
  label="契约"
  name="contract"
  suffix={{
    useBrick: {
      brick: "eo-button",
      properties: {
        icon: { lib: "antd", icon: "question-circle" },
        type: "text",
      },
    },
  }}
/>
```
