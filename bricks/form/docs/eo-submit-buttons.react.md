---
tagName: eo-submit-buttons
displayName: WrappedEoSubmitButtons
description: 表单提交按钮
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoSubmitButtons

> 表单提交按钮

## 导入

```tsx
import { WrappedEoSubmitButtons } from "@easyops/wrapped-components";
```

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

| 事件     | detail | 说明                   |
| -------- | ------ | ---------------------- |
| onSubmit | `void` | 点击提交按钮触发的事件 |
| onCancel | `void` | 点击取消按钮触发的事件 |

## Examples

### Basic

展示提交按钮与取消按钮的基本用法，并监听点击事件。

```tsx
<WrappedEoSubmitButtons
  submitText="Submit"
  cancelText="Cancel"
  onSubmit={() => console.log("Submit")}
  onCancel={() => console.log("Cancel")}
/>
```

### Button Types

通过 submitType 和 cancelType 自定义按钮的样式类型。

```tsx
<WrappedEoSubmitButtons
  submitText="Submit"
  cancelText="Cancel"
  submitType="primary"
  cancelType="default"
/>
```

### Disable Submit Button

展示 submitDisabled 禁用提交按钮的效果。

```tsx
<WrappedEoSubmitButtons
  submitText="Submit"
  cancelText="Cancel"
  submitDisabled
/>
```

### Disable After Click

演示 disableAfterClick 在点击提交后自动禁用按钮，防止重复提交。

```tsx
<WrappedEoSubmitButtons
  submitText="提交"
  cancelText="取消"
  disableAfterClick
  onSubmit={() => console.log("已提交，按钮已禁用")}
  onCancel={() => console.log("已取消")}
/>
```

### Theme Variant Elevo

展示 Elevo 主题变体下提交按钮的样式。

```tsx
<WrappedEoSubmitButtons
  submitText="提交"
  cancelText="取消"
  themeVariant="elevo"
  submitType="primary"
  cancelType="default"
  onSubmit={() => console.log("提交成功")}
  onCancel={() => console.log("已取消")}
/>
```

### In Form

与 WrappedEoForm 搭配使用，演示完整的表单提交流程。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log("表单提交成功", e.detail)}
  onValidateError={(e) => console.log("表单校验失败", e.detail)}
>
  <WrappedEoInput required name="name" label="姓名" />
  <WrappedEoSelect
    required
    name="city"
    label="城市"
    options={[
      { label: "北京", value: "beijing" },
      { label: "上海", value: "shanghai" },
    ]}
  />
  <WrappedEoSubmitButtons submitText="提交" cancelText="取消" />
</WrappedEoForm>
```
