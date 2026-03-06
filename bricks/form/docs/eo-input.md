---
tagName: eo-input
displayName: WrappedEoInput
description: 通用输入框构件
category: form-input-basic
source: "@next-bricks/form"
---

# eo-input

> 通用输入框构件

## Props

| 属性        | 类型                          | 必填 | 默认值     | 说明                                                 |
| ----------- | ----------------------------- | ---- | ---------- | ---------------------------------------------------- |
| name        | `string`                      | 否   | -          | 字段名称                                             |
| label       | `string`                      | 否   | -          | 标签文字                                             |
| value       | `string`                      | 否   | -          | 输入框值                                             |
| placeholder | `string`                      | 否   | -          | 占位说明                                             |
| disabled    | `boolean`                     | 否   | -          | 是否禁用                                             |
| readonly    | `boolean`                     | 否   | -          | 是否只读                                             |
| clearable   | `boolean`                     | 否   | -          | 是否显示清除按钮                                     |
| autoFocus   | `boolean`                     | 否   | -          | 是否自动聚焦                                         |
| type        | `InputType`                   | 否   | `"text"`   | 类型                                                 |
| size        | `ComponentSize`               | 否   | `"medium"` | 大小                                                 |
| minLength   | `number`                      | 否   | -          | 最小长度                                             |
| maxLength   | `number`                      | 否   | -          | 最大长度（用户无法输入超过此最大长度的字符串）       |
| min         | `number`                      | 否   | -          | 表单校验最小长度（当 type 为 number 时，表示最小值） |
| max         | `number`                      | 否   | -          | 表单校验最大长度（当 type 为 number 时，表示最大值） |
| pattern     | `string`                      | 否   | -          | 正则校验规则                                         |
| required    | `boolean`                     | 否   | -          | 是否必填                                             |
| message     | `Record<string, string>`      | 否   | -          | 错误时显示消息                                       |
| inputStyle  | `React.CSSProperties`         | 否   | -          | 输入框样式                                           |
| validator   | `(value: any) => MessageBody` | 否   | -          | 表单项校验方法                                       |

## Events

| 事件   | detail                | 说明       |
| ------ | --------------------- | ---------- |
| change | `string` — 当前输入值 | 值改变事件 |

## Methods

| 方法       | 签名         | 说明             |
| ---------- | ------------ | ---------------- |
| focusInput | `() => void` | 使输入框获得焦点 |
| blurInput  | `() => void` | 使输入框失去焦点 |

## Slots

| 名称        | 说明           |
| ----------- | -------------- |
| addonBefore | 输入框前置标签 |
| addonAfter  | 输入框后置标签 |
| prefix      | 输入框前缀图标 |
| suffix      | 输入框后缀图标 |

## CSS Parts

| 名称          | 说明                                       |
| ------------- | ------------------------------------------ |
| addon-wrapper | 包裹输入组件、前缀、后缀、前置和后置的容器 |
| affix-wrapper | 包裹输入组件、前缀和后缀的容器             |
| input         | 输入组件                                   |
| clear-icon    | 清除按钮                                   |
| prefix        | 输入框前缀容器                             |
| suffix        | 输入框后缀容器                             |
| before-addon  | 输入框前置容器                             |
| after-addon   | 输入框后置容器                             |

## Examples

### Basic

展示通用输入框的最基本用法。

```yaml preview
- brick: eo-input
```

### Label

通过 `label` 属性为输入框设置标签文字。

```yaml preview
- brick: eo-input
  properties:
    label: 输入框
```

### Value

通过 `value` 属性设置输入框的默认值。

```yaml preview
- brick: eo-input
  properties:
    value: Default Value
```

### Placeholder

通过 `placeholder` 属性设置占位提示文字。

```yaml preview
- brick: eo-input
  properties:
    placeholder: This is placeholder...
```

### Disabled

设置 `disabled` 属性禁用输入框。

```yaml preview
- brick: eo-input
  properties:
    value: Default Value
    disabled: true
```

### Readonly

设置 `readonly` 属性使输入框只读。

```yaml preview
- brick: eo-input
  properties:
    value: Read only value
    readonly: true
```

### Clearable

设置 `clearable` 属性在输入框非空时显示清除按钮。

```yaml preview
- brick: eo-input
  properties:
    value: Default Value
    clearable: true
```

### Max Length

通过 `maxLength` 属性限制用户最多输入的字符数。

```yaml preview
- brick: eo-input
  properties:
    placeholder: max length = 5
    maxLength: 5
```

### Type

通过 `type` 属性切换输入框类型，支持 `password`、`date`、`color`、`number`、`search` 等。

```yaml preview
- brick: eo-input
  properties:
    label: password
    type: password
- brick: eo-input
  properties:
    label: date
    type: date
- brick: eo-input
  properties:
    label: color
    type: color
- brick: eo-input
  properties:
    label: number
    type: number
    min: 0
    max: 100
```

### Size

通过 `size` 属性控制输入框大小，支持 `large`、`medium`（默认）和 `small`。

```yaml preview
- brick: eo-input
  properties:
    size: large
    placeholder: large
- brick: eo-input
  properties:
    size: medium
    placeholder: medium
- brick: eo-input
  properties:
    size: small
    placeholder: small
```

### Input Style

通过 `inputStyle` 属性自定义输入框的内联样式。

```yaml preview
- brick: eo-input
  properties:
    placeholder: "width: 180px"
    inputStyle:
      width: 180px
- brick: eo-input
  properties:
    placeholder: "width: 250px"
    inputStyle:
      width: 250px
- brick: eo-input
  properties:
    placeholder: "border style"
    inputStyle:
      border: "1px solid #8b2121"
```

### Events

监听 `change` 事件获取输入框值变化。

```yaml preview
- brick: eo-input
  properties:
    label: Event
  events:
    change:
      action: message.success
      args:
        - <% EVENT.detail %>
```

### Slots

通过 `prefix`、`suffix`、`addonBefore`、`addonAfter` 插槽在输入框不同位置插入自定义内容。

```yaml preview gap
- brick: eo-input
  properties:
    placeholder: prefix slot
  slots:
    prefix:
      bricks:
        - brick: eo-icon
          properties:
            icon: search
            lib: antd
            theme: outlined
- brick: eo-input
  properties:
    placeholder: suffix slot
  slots:
    suffix:
      bricks:
        - brick: eo-icon
          properties:
            icon: search
            lib: antd
            theme: outlined
- brick: eo-input
  properties:
    placeholder: addon slot
  slots:
    addonBefore:
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: https://
    addonAfter:
      type: bricks
      bricks:
        - brick: span
          properties:
            textContent: .com
```

### With Form

在 `eo-form` 中使用，通过 `name`、`label` 属性集成表单功能，并可配合 `required`、`pattern`、`message` 属性实现表单校验。

```yaml preview
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-input
      properties:
        label: 输入框
        name: text
        required: true
        pattern: "^[A-Za-z]+"
        message:
          required: 请输入内容
          pattern: 只能输入字母
    - brick: eo-submit-buttons
```

### Validator

通过 `validator` 属性自定义表单项校验逻辑，返回 `null` 表示校验通过，返回包含 `message` 的对象表示校验失败。

```yaml preview
- brick: eo-form
  events:
    validate.success:
      - action: console.log
  children:
    - brick: eo-input
      properties:
        name: username
        label: 用户名
        validator: "<% (value) => value && value.length > 10 ? { message: '用户名不能超过10个字符' } : null %>"
    - brick: eo-submit-buttons
```
