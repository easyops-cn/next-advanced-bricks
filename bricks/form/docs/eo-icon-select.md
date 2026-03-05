---
tagName: eo-icon-select
displayName: WrappedEoIconSelect
description: 图标选择构件
category: form-input-basic
source: "@next-bricks/form"
---

# eo-icon-select

> 图标选择构件

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

| 事件   | detail                                                                                                  | 说明         |
| ------ | ------------------------------------------------------------------------------------------------------- | ------------ |
| change | `Icon \| undefined` — { lib: 图标库, icon: 图标名称, category: 图标分类, color: 图标颜色 } \| undefined | 值变化时触发 |

## Examples

### Basic

基础用法，点击图标选择器后打开图标选择弹窗，确认后通过 change 事件获取选中的图标。

```yaml preview minHeight="750px"
- brick: eo-icon-select
  events:
    change:
      action: console.log
      args:
        - "<% EVENT.detail %>"
```

### With Value

设置初始值，展示已选中的图标。

```yaml preview minHeight="750px"
- brick: eo-icon-select
  properties:
    value:
      lib: antd
      icon: star
      theme: filled
      color: "#faad14"
  events:
    change:
      action: console.log
```

### Disabled

设置 disabled 为 true 禁用图标选择器，用户无法打开选择弹窗。

```yaml preview
- brick: eo-icon-select
  properties:
    disabled: true
    value:
      lib: antd
      icon: heart
      theme: filled
      color: "#ff4d4f"
```

### With Form

在表单中使用图标选择器，配合 name、label、required、message 进行表单校验。

```yaml preview minHeight="750px"
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-icon-select
      properties:
        name: icon
        label: 图标
        required: true
        message:
          required: 请选择一个图标
    - brick: eo-submit-buttons
```

### ThemeVariant

通过 themeVariant 属性切换图标选择弹窗的主题样式。

```yaml preview minHeight="750px"
- brick: eo-icon-select
  properties:
    themeVariant: elevo
  events:
    change:
      action: console.log
```
