---
tagName: eo-switch
displayName: WrappedEoSwitch
description: 开关
category: form-input-basic
source: "@next-bricks/form"
---

# eo-switch

> 开关

## Props

| 属性          | 类型                   | 必填 | 默认值 | 说明                                         |
| ------------- | ---------------------- | ---- | ------ | -------------------------------------------- |
| name          | `string`               | 否   | -      | 字段名称                                     |
| label         | `string`               | 否   | -      | 字段文本                                     |
| value         | `boolean`              | 否   | -      | 初始值                                       |
| disabled      | `boolean`              | 否   | -      | 是否禁用                                     |
| size          | `ComponentSize`        | 否   | -      | 按钮大小，目前只支持small和非small两种大小。 |
| checkedText   | `string`               | 否   | -      | 选中时的文本                                 |
| unCheckedText | `string`               | 否   | -      | 非选中时的文本                               |
| checkedIcon   | `GeneralIconProps`     | 否   | -      | 选中时的图标                                 |
| unCheckedIcon | `GeneralIconProps`     | 否   | -      | 非选中时的图标                               |
| themeVariant  | `"default" \| "elevo"` | 否   | -      | 主题变体                                     |

## Events

| 事件   | detail                                                  | 说明           |
| ------ | ------------------------------------------------------- | -------------- |
| switch | `boolean` — 开关当前状态，true 表示开启，false 表示关闭 | 开关改变时触发 |

## Examples

### Basic

```yaml preview
- brick: eo-switch
  events:
    switch:
      action: console.log
  properties:
    disabled: false
```

### Label

```yaml preview
- brick: eo-switch
  events:
    switch:
      action: console.log
  properties:
    disabled: false
    label: switch
```

### Value

通过 `value` 属性设置开关的初始状态。

```yaml preview
- brick: eo-switch
  properties:
    value: true
    label: switch
```

### Disabled

```yaml preview
- brick: eo-switch
  properties:
    disabled: true
    value: true
    label: switch
```

### Size

```yaml preview
- brick: eo-switch
  properties:
    disabled: false
    value: true
    label: switch
    size: small
```

### Customizations

通过 `checkedText`、`unCheckedText`、`checkedIcon`、`unCheckedIcon` 属性自定义开关的文本和图标。

```yaml preview
- brick: eo-switch
  properties:
    checkedText: 123
    unCheckedText: 456
    disabled: false
    size: small
    label: text
    checkedIcon:
      icon: plus-circle
      lib: antd
      theme: outlined
    unCheckedIcon:
      icon: plus-circle
      lib: antd
```

### Theme Variant

```yaml preview
- brick: eo-switch
  properties:
    themeVariant: elevo
    label: switch
    value: true
```

### Event

```yaml preview
- brick: eo-switch
  events:
    switch:
      action: console.log
  properties:
    disabled: false
```

### With Form

```yaml preview
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-switch
      properties:
        name: switch
        label: 开关
    - brick: eo-submit-buttons
```
