---
tagName: eo-submit-buttons
displayName: WrappedEoSubmitButtons
description: 表单提交按钮
category: form-input-basic
source: "@next-bricks/form"
---

# eo-submit-buttons

> 表单提交按钮

## Props

| 属性              | 类型                   | 必填 | 默认值   | 说明                                   |
| ----------------- | ---------------------- | ---- | -------- | -------------------------------------- |
| submitText        | `string`               | 是   | `"提交"` | 提交按钮的文字                         |
| cancelText        | `string`               | 否   | -        | 取消按钮的文字，不设置则不显示取消按钮 |
| disableAfterClick | `boolean`              | 否   | -        | 点击确定按钮后自动禁用                 |
| submitDisabled    | `boolean`              | 否   | -        | 禁用提交按钮                           |
| submitType        | `ButtonType`           | 否   | -        | 提交按钮类型                           |
| cancelType        | `ButtonType`           | 否   | -        | 取消按钮类型                           |
| themeVariant      | `"default" \| "elevo"` | 否   | -        | 主题变体                               |

## Events

| 事件   | detail | 说明                   |
| ------ | ------ | ---------------------- |
| submit | `void` | 点击提交按钮触发的事件 |
| cancel | `void` | 点击取消按钮触发的事件 |

## Examples

### Basic

展示提交按钮与取消按钮的基本用法，并监听点击事件。

```yaml preview
- brick: eo-submit-buttons
  properties:
    submitText: Submit
    cancelText: Cancel
  events:
    submit:
      - action: message.success
        args:
          - Submit
    cancel:
      - action: message.warn
        args:
          - Cancel
```

### Button Types

通过 submitType 和 cancelType 自定义按钮的样式类型。

```yaml preview
- brick: eo-submit-buttons
  properties:
    submitText: Submit
    cancelText: Cancel
    submitType: primary
    cancelType: default
```

### Disable Submit Button

展示 submitDisabled 禁用提交按钮的效果。

```yaml preview
- brick: eo-submit-buttons
  properties:
    submitText: Submit
    cancelText: Cancel
    submitDisabled: true
```

### Disable After Click

演示 disableAfterClick 在点击提交后自动禁用按钮，防止重复提交。

```yaml preview
- brick: eo-submit-buttons
  properties:
    submitText: 提交
    cancelText: 取消
    disableAfterClick: true
  events:
    submit:
      - action: message.success
        args:
          - 已提交，按钮已禁用
    cancel:
      - action: message.info
        args:
          - 已取消
```

### Theme Variant Elevo

展示 Elevo 主题变体下提交按钮的样式。

```yaml preview
- brick: eo-submit-buttons
  properties:
    submitText: 提交
    cancelText: 取消
    themeVariant: elevo
    submitType: primary
    cancelType: default
  events:
    submit:
      - action: message.success
        args:
          - 提交成功
    cancel:
      - action: message.info
        args:
          - 已取消
```

### In Form

与 eo-form 搭配使用，演示完整的表单提交流程。

```yaml preview
- brick: eo-form
  events:
    validate.success:
      - action: message.success
        args:
          - 表单提交成功
    validate.error:
      - action: message.error
        args:
          - 表单校验失败
  slots:
    "":
      bricks:
        - brick: eo-input
          properties:
            required: true
            name: name
            label: 姓名
        - brick: eo-select
          properties:
            required: true
            name: city
            label: 城市
            options:
              - label: 北京
                value: beijing
              - label: 上海
                value: shanghai
        - brick: eo-submit-buttons
          properties:
            submitText: 提交
            cancelText: 取消
```
