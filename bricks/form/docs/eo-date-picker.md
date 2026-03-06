---
tagName: eo-date-picker
displayName: WrappedEoDatePicker
description: 日期选择器
category: form-input-basic
source: "@next-bricks/form"
---

# eo-date-picker

> 日期选择器

## Props

| 属性               | 类型                     | 必填 | 默认值 | 说明                                                                               |
| ------------------ | ------------------------ | ---- | ------ | ---------------------------------------------------------------------------------- |
| name               | `string`                 | 否   | -      | 日期选择器字段名                                                                   |
| label              | `string`                 | 否   | -      | 日期选择器说明                                                                     |
| value              | `string`                 | 否   | -      | 日期选择器的初始值                                                                 |
| placeholder        | `string`                 | 否   | -      | 日期选择器占位说明                                                                 |
| message            | `Record<string, string>` | 否   | -      | 校验文本信息                                                                       |
| disabled           | `boolean`                | 否   | -      | 是否禁用                                                                           |
| required           | `boolean`                | 否   | -      | 是否必填                                                                           |
| showTime           | `boolean`                | 否   | -      | 是否显示时间，当设为 `true` 时，请同时设置 `format` 为 `YYYY-MM-DD HH:mm:ss`       |
| format             | `string`                 | 否   | -      | 显示预览的格式，具体配置参考 [dayjs](https://day.js.org/docs/zh-CN/display/format) |
| picker             | `PickerMode`             | 否   | -      | 设置选择器类型，可选值：`date` \| `week` \| `month` \| `quarter` \| `year`         |
| futureDateDisabled | `boolean`                | 否   | -      | 不可选择未来日期，优先级高于 `disabledDate`                                        |
| disabledDate       | `DisabledDateType`       | 否   | -      | 不可选择的日期                                                                     |
| useFastSelectBtn   | `boolean`                | 否   | -      | 启用快速切换按钮，显示上一个/当前/下一个的快速选项                                 |
| inputStyle         | `CSSProperties`          | 否   | -      | 输入框样式                                                                         |

## Events

| 事件   | detail                          | 说明                                      |
| ------ | ------------------------------- | ----------------------------------------- |
| change | `string` — 格式化后的日期字符串 | 日期变化时触发                            |
| ok     | `string` — 格式化后的日期字符串 | 点击确定按钮触发（showTime 为 true 使用） |

## Examples

### Basic

展示日期选择器的基本用法。

```yaml preview minHeight="450px"
- brick: eo-date-picker
```

### 日期时间选择

展示开启时间选择、指定格式并监听 ok 事件的用法。

```yaml preview minHeight="450px"
- brick: eo-date-picker
  events:
    ok:
      action: console.log
    change:
      action: console.log
  properties:
    showTime: true
    value: "2020-02-01 14:30:00"
    format: "YYYY-MM-DD HH:mm:ss"
    placeholder: 选择日期时间
```

### 选择器类型与快速切换

通过 picker 属性设置选择器类型（天/周/月/季度/年），并启用快速切换按钮；还可通过 inputStyle 自定义输入框宽度。

```yaml preview minHeight="550px"
- brick: eo-radio
  events:
    change:
      - target: "#datePicker"
        properties:
          picker: <% EVENT.detail.value %>
  properties:
    options:
      - label: 天
        value: date
      - label: 周
        value: week
      - label: 月
        value: month
      - label: 季度
        value: quarter
      - label: 年
        value: year
- brick: eo-date-picker
  properties:
    id: datePicker
    useFastSelectBtn: true
    inputStyle:
      width: 200px
```

### 禁用日期

通过 disabledDate 禁止特定日期或时间段，通过 futureDateDisabled 禁止选择未来日期。

```yaml preview minHeight="450px"
- brick: eo-date-picker
  events:
    ok:
      action: console.log
    change:
      action: console.log
  properties:
    disabledDate:
      - weekday: 4
      - date: 10-15
        year: 2010-2020
      - hour: 12-18
        minute: 0-29
        weekday: 3
    format: "YYYY-MM-DD HH:mm:ss"
    showTime: true
    value: "2019-10-01 00:00:00"
    futureDateDisabled: true
```

### 禁用状态

展示禁用状态下日期选择器的效果。

```yaml preview minHeight="450px"
- brick: eo-date-picker
  properties:
    disabled: true
    value: "2024-01-15"
    placeholder: 已禁用
```

### 表单集成

在表单中使用日期选择器，支持 label、name、required 及自定义校验信息。

```yaml preview minHeight="450px"
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-date-picker
      properties:
        label: 日期
        name: date
        required: true
        message:
          required: 请选择日期
    - brick: eo-submit-buttons
```
