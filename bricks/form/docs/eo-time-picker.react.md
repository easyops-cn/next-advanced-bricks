---
tagName: eo-time-picker
displayName: WrappedEoTimePicker
description: 时间选择器
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoTimePicker

> 时间选择器

## 导入

```tsx
import { WrappedEoTimePicker } from "@easyops/wrapped-components";
```

## Props

| 属性        | 类型                       | 必填 | 默认值 | 说明                                                                                            |
| ----------- | -------------------------- | ---- | ------ | ----------------------------------------------------------------------------------------------- |
| name        | `string`                   | 否   | -      | 时间选择器字段名                                                                                |
| label       | `string`                   | 否   | -      | 时间选择器说明                                                                                  |
| value       | `string`                   | 否   | -      | 时间选择器的初始值                                                                              |
| placeholder | `string`                   | 否   | -      | 时间选择器占位说明                                                                              |
| message     | `Record<string, string>`   | 否   | -      | 校验文本信息                                                                                    |
| disabled    | `boolean`                  | 否   | -      | 是否禁用                                                                                        |
| required    | `boolean`                  | 否   | -      | 是否必填                                                                                        |
| configProps | `Partial<TimePickerProps>` | 否   | -      | 透传 antd TimePicker 属性，详见 [timePickerProps](https://ant.design/components/time-picker-cn) |

## Events

| 事件     | detail                                  | 说明                           |
| -------- | --------------------------------------- | ------------------------------ |
| onChange | `string` — 格式化后的时间字符串         | 时间变化时触发                 |
| onOpen   | `string` — 面板打开时的当前时间值字符串 | 面板打开时触发，传出当前时间值 |
| onClose  | `string` — 面板关闭时的当前时间值字符串 | 面板关闭时触发，传出当前时间值 |

## Examples

### Basic

展示时间选择器的基本用法，包含初始值和占位说明。

```tsx
<WrappedEoTimePicker label="时间" placeholder="选择时间" value="12:30:01" />
```

### 事件监听

展示监听 change、open、close 事件的用法。

```tsx
<WrappedEoTimePicker
  label="时间"
  placeholder="选择时间"
  onChange={(e) => console.log(e.detail)}
  onOpen={(e) => console.log(e.detail)}
  onClose={(e) => console.log(e.detail)}
/>
```

### 透传 antd 属性

通过 configProps 透传 antd TimePicker 属性，自定义时间格式等配置。

```tsx
<WrappedEoTimePicker
  label="时间（时分）"
  placeholder="选择时间"
  configProps={{ format: "HH:mm", allowClear: true }}
/>
```

### 禁用状态

展示禁用状态下时间选择器的效果。

```tsx
<WrappedEoTimePicker
  label="时间"
  disabled={true}
  value="09:00:00"
  placeholder="已禁用"
/>
```

### 表单集成

在表单中使用时间选择器，支持 label、name、required 及自定义校验信息。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoTimePicker
    label="时间"
    name="time"
    required={true}
    message={{ required: "请选择时间" }}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```
