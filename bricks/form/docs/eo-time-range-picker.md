---
tagName: eo-time-range-picker
displayName: WrappedEoTimeRangePicker
description: 时间区间选择器
category: form-input-basic
source: "@next-bricks/form"
---

# eo-time-range-picker

> 时间区间选择器

## Props

| 属性             | 类型                                    | 必填 | 默认值 | 说明                                                                                                       |
| ---------------- | --------------------------------------- | ---- | ------ | ---------------------------------------------------------------------------------------------------------- |
| name             | `string`                                | 否   | -      | 时间段选择器字段名                                                                                         |
| label            | `string`                                | 否   | -      | 时间段选择器说明                                                                                           |
| value            | `TimeRange`                             | 否   | -      | 时间段选择器的初始值，格式为 `{ startTime, endTime }`                                                      |
| required         | `boolean`                               | 否   | -      | 是否必填                                                                                                   |
| rangeType        | `RangeType`                             | 否   | -      | 时间段类型，可选值：`time` \| `hmTime` \| `date` \| `dateTime` \| `week` \| `month` \| `quarter` \| `year` |
| placeholder      | `string \| [string, string]`            | 否   | -      | 输入框提示文字，单时间段时为 `string`，范围时间段时为 `[string, string]`                                   |
| inputStyle       | `React.CSSProperties`                   | 否   | -      | 输入框样式                                                                                                 |
| selectNearDays   | `number`                                | 否   | -      | 仅在 `rangeType` 为 `date` 或 `dateTime` 时生效，限制只能选择最近 n 天（当前时间向前 n 天）                |
| emitChangeOnInit | `boolean`                               | 否   | `true` | 是否在初始化完成后额外触发一次 change 事件。默认为 `true` 以兼容历史行为。                                 |
| presetRanges     | `presetRangeType[]`                     | 否   | -      | 预设时间范围快捷选择。设置了 `selectNearDays` 时不生效；不同 `rangeType` 下可选值有限制。                  |
| validator        | `(value: any) => MessageBody \| string` | 否   | -      | 自定义校验函数，返回错误信息字符串或 MessageBody 对象，返回空字符串表示校验通过。                          |

## Events

| 事件   | detail                                                               | 说明             |
| ------ | -------------------------------------------------------------------- | ---------------- |
| change | `TimeRange` — { startTime: 开始时间字符串, endTime: 结束时间字符串 } | 时间段变化时触发 |

## Examples

### Basic

展示时间区间选择器的基本用法。

```yaml preview minHeight="400px"
- brick: eo-time-range-picker
  properties:
    label: 时间段
    name: time
```

### 区间类型

通过 rangeType 属性切换不同的时间段类型（时间/日期/日期时间/周/月/季度/年）。

```yaml preview minHeight="400px"
- brick: eo-radio
  properties:
    options:
      - time
      - date
      - dateTime
      - hmTime
      - week
      - month
      - quarter
      - year
  events:
    change:
      - target: "#rangePicker"
        properties:
          rangeType: <% EVENT.detail.value %>
- brick: eo-time-range-picker
  properties:
    label: 时间段
    name: time
    id: rangePicker
    rangeType: date
```

### 预设时间范围

通过 presetRanges 属性设置快捷选择按钮，方便用户快速选择常用时间段。

```yaml preview minHeight="400px"
- brick: eo-time-range-picker
  properties:
    label: 时间段
    name: time
    rangeType: week
    required: true
    presetRanges:
      - 本周
      - 本月
      - 本季度
      - 今年
```

### 最近 N 天

通过 selectNearDays 属性限制只能选择最近 n 天范围内的日期（rangeType 为 date 或 dateTime 时有效）。

```yaml preview minHeight="400px"
- brick: eo-time-range-picker
  events:
    change:
      action: console.log
  properties:
    label: 最近 10 天
    name: time
    selectNearDays: 10
    rangeType: date
```

### 初始值与输入框样式

通过 value 设置初始时间段，通过 inputStyle 自定义输入框样式。

```yaml preview minHeight="400px"
- brick: eo-time-range-picker
  properties:
    label: 时间段
    name: time
    rangeType: date
    value:
      startTime: "2024-01-01"
      endTime: "2024-01-31"
    inputStyle:
      width: 300px
    placeholder:
      - 开始日期
      - 结束日期
```

### 自定义校验

通过 validator 属性自定义校验逻辑，返回错误信息时显示校验失败。

```yaml preview minHeight="400px"
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
        - brick: eo-time-range-picker
          events:
            change:
              action: console.log
          properties:
            label: 时间段
            name: time
            required: true
            emitChangeOnInit: false
            validator: "<% (value) => value && value.startTime && value.endTime ? '' : '请选择完整的时间段' %>"
        - brick: eo-submit-buttons
```

### 表单集成

在表单中使用时间区间选择器，结合 name、label、required 进行完整的表单提交。

```yaml preview minHeight="400px"
- brick: eo-form
  events:
    validate.success:
      - action: console.log
    values.change:
      - action: console.log
  children:
    - brick: eo-time-range-picker
      properties:
        label: 时间段
        name: time
        required: true
    - brick: eo-submit-buttons
```
