---
tagName: eo-icon-select
displayName: WrappedEoIconSelect
description: 图标选择构件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoIconSelect

> 图标选择构件

## 导入

```tsx
import { WrappedEoIconSelect } from "@easyops/wrapped-components";
```

## Props

| 属性         | 类型                     | 必填 | 默认值 | 说明             |
| ------------ | ------------------------ | ---- | ------ | ---------------- |
| name         | `string`                 | 否   | -      | 字段名称         |
| label        | `string`                 | 否   | -      | 字段说明         |
| value        | `Icon`                   | 否   | -      | 值               |
| disabled     | `boolean`                | 否   | -      | 是否禁用         |
| required     | `boolean`                | 否   | -      | 是否必填         |
| message      | `Record<string, string>` | 否   | -      | 校验错误提示信息 |
| themeVariant | `"default" \| "elevo"`   | 否   | -      | 主题变体         |

## Events

| 事件     | detail                                                                                                  | 说明         |
| -------- | ------------------------------------------------------------------------------------------------------- | ------------ |
| onChange | `Icon \| undefined` — { lib: 图标库, icon: 图标名称, category: 图标分类, color: 图标颜色 } \| undefined | 值变化时触发 |

## Examples

### Basic

基础用法，点击图标选择器后打开图标选择弹窗，确认后通过 onChange 事件获取选中的图标。

```tsx
<WrappedEoIconSelect onChange={(e) => console.log(e.detail)} />
```

### With Value

设置初始值，展示已选中的图标。

```tsx
<WrappedEoIconSelect
  value={{ lib: "antd", icon: "star", theme: "filled", color: "#faad14" }}
  onChange={(e) => console.log(e.detail)}
/>
```

### Disabled

设置 disabled 为 true 禁用图标选择器，用户无法打开选择弹窗。

```tsx
<WrappedEoIconSelect
  disabled={true}
  value={{ lib: "antd", icon: "heart", theme: "filled", color: "#ff4d4f" }}
/>
```

### With Form

在表单中使用图标选择器，配合 name、label、required、message 进行表单校验。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoIconSelect
    name="icon"
    label="图标"
    required={true}
    message={{ required: "请选择一个图标" }}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### ThemeVariant

通过 themeVariant 属性切换图标选择弹窗的主题样式。

```tsx
<WrappedEoIconSelect
  themeVariant="elevo"
  onChange={(e) => console.log(e.detail)}
/>
```
