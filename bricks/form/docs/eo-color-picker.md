---
tagName: eo-color-picker
displayName: WrappedEoColorPicker
description: 颜色选择器
category: form-input-basic
source: "@next-bricks/form"
---

# eo-color-picker

> 颜色选择器

## Props

| 属性         | 类型                             | 必填 | 默认值   | 说明                                                                                             |
| ------------ | -------------------------------- | ---- | -------- | ------------------------------------------------------------------------------------------------ |
| name         | `string`                         | 否   | -        | 字段名称                                                                                         |
| label        | `string`                         | 否   | -        | 字段说明                                                                                         |
| value        | `string`                         | 否   | -        | 值                                                                                               |
| defaultValue | `string \| Color`                | 否   | -        | 颜色默认的值                                                                                     |
| required     | `boolean`                        | 否   | -        | 是否必填                                                                                         |
| allowClear   | `boolean`                        | 否   | -        | 允许清除选择的颜色                                                                               |
| size         | `"small" \| "middle" \| "large"` | 否   | `middle` | 设置触发器大小                                                                                   |
| showText     | `boolean`                        | 否   | -        | 显示颜色文本                                                                                     |
| disabled     | `boolean`                        | 否   | -        | 是否禁用                                                                                         |
| format       | `"rgb" \| "hex" \| "hsb"`        | 否   | `hex`    | 颜色格式                                                                                         |
| configProps  | `Partial<ColorPickerProps>`      | 否   | -        | 透传 antd ColorPicker 属性 [ColorPickerProps](https://ant.design/components/color-picker-cn#api) |

## Events

| 事件   | detail                                                                                          | 说明                                       |
| ------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------ |
| change | `string \| undefined` — 选中的颜色值，格式由 format 属性决定（hex/rgb/hsb），清除时为 undefined | 颜色变化事件, 返回值格式和`format`格式一致 |

## Examples

### Basic

基础用法，选择颜色后通过 change 事件获取颜色值。

```yaml preview
brick: eo-color-picker
events:
  change:
    action: console.log
```

### Size

通过 size 属性设置颜色选择器触发器的尺寸大小。

```yaml preview
- brick: eo-flex-layout
  properties:
    justifyContent: start
    gap: 20px
  slots:
    "":
      bricks:
        - brick: eo-color-picker
          properties:
            size: small
            value: "#ff4d4f"
        - brick: eo-color-picker
          properties:
            size: middle
            value: "#36b545"
        - brick: eo-color-picker
          properties:
            size: large
            value: "#1677ff"
```

### ShowText

设置 showText 为 true，在颜色选择器旁边显示当前颜色的文本值。

```yaml preview
- brick: eo-color-picker
  properties:
    showText: true
    value: "#1677ff"
  events:
    change:
      action: console.log
```

### AllowClear

设置 allowClear 为 true，允许用户清除已选颜色；结合 defaultValue 设置初始颜色。

```yaml preview
- brick: eo-color-picker
  properties:
    allowClear: true
    defaultValue: "#f5a623"
  events:
    change:
      action: console.log
```

### Formats

通过 format 属性控制颜色输出格式，支持 hex、rgb 和 hsb 三种格式。

```yaml preview
- brick: eo-flex-layout
  properties:
    justifyContent: start
    gap: 20px
  slots:
    "":
      bricks:
        - brick: eo-color-picker
          properties:
            format: hex
            value: "#FCFA0E"
            showText: true
        - brick: eo-color-picker
          properties:
            format: rgb
            value: "rgb(80, 227, 194)"
            showText: true
        - brick: eo-color-picker
          properties:
            format: hsb
            value: "hsb(215, 91%, 100%)"
            showText: true
```

### Disabled

设置 disabled 为 true 禁用颜色选择器，用户无法进行交互。

```yaml preview
- brick: eo-color-picker
  properties:
    disabled: true
    value: "#1677ff"
    showText: true
```

### ConfigProps

通过 configProps 透传 antd ColorPicker 的高级属性，例如设置预设颜色。

```yaml preview
- brick: eo-color-picker
  properties:
    showText: true
    configProps:
      presets:
        - label: 推荐颜色
          colors:
            - "#F5222D"
            - "#FA8C16"
            - "#FADB14"
            - "#52C41A"
            - "#1677FF"
            - "#722ED1"
  events:
    change:
      action: console.log
```

### With Form

在表单中使用颜色选择器，配合 name、label、required 进行表单校验。

```yaml preview
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    validate.error:
      - action: console.log
  children:
    - brick: eo-color-picker
      properties:
        name: color
        label: 颜色
        required: true
        defaultValue: "#1677FF"
        showText: true
      events:
        change:
          action: console.log
    - brick: eo-submit-buttons
```
