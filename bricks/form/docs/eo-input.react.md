---
tagName: eo-input
displayName: WrappedEoInput
description: 通用输入框构件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoInput

> 通用输入框构件

## 导入

```tsx
import { WrappedEoInput } from "@easyops/wrapped-components";
```

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

| 事件     | detail                | 说明       |
| -------- | --------------------- | ---------- |
| onChange | `string` — 当前输入值 | 值改变事件 |

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

```tsx
<WrappedEoInput />
```

### Label

通过 `label` 属性为输入框设置标签文字。

```tsx
<WrappedEoInput label="输入框" />
```

### Value

通过 `value` 属性设置输入框的默认值。

```tsx
<WrappedEoInput value="Default Value" />
```

### Placeholder

通过 `placeholder` 属性设置占位提示文字。

```tsx
<WrappedEoInput placeholder="This is placeholder..." />
```

### Disabled

设置 `disabled` 属性禁用输入框。

```tsx
<WrappedEoInput value="Default Value" disabled />
```

### Readonly

设置 `readonly` 属性使输入框只读。

```tsx
<WrappedEoInput value="Read only value" readonly />
```

### Clearable

设置 `clearable` 属性在输入框非空时显示清除按钮。

```tsx
<WrappedEoInput value="Default Value" clearable />
```

### Max Length

通过 `maxLength` 属性限制用户最多输入的字符数。

```tsx
<WrappedEoInput placeholder="max length = 5" maxLength={5} />
```

### Type

通过 `type` 属性切换输入框类型，支持 `password`、`date`、`color`、`number`、`search` 等。

```tsx
<>
  <WrappedEoInput label="password" type="password" />
  <WrappedEoInput label="date" type="date" />
  <WrappedEoInput label="color" type="color" />
  <WrappedEoInput label="number" type="number" min={0} max={100} />
</>
```

### Size

通过 `size` 属性控制输入框大小，支持 `large`、`medium`（默认）和 `small`。

```tsx
<>
  <WrappedEoInput size="large" placeholder="large" />
  <WrappedEoInput size="medium" placeholder="medium" />
  <WrappedEoInput size="small" placeholder="small" />
</>
```

### Input Style

通过 `inputStyle` 属性自定义输入框的内联样式。

```tsx
<>
  <WrappedEoInput placeholder="width: 180px" inputStyle={{ width: "180px" }} />
  <WrappedEoInput placeholder="width: 250px" inputStyle={{ width: "250px" }} />
  <WrappedEoInput
    placeholder="border style"
    inputStyle={{ border: "1px solid #8b2121" }}
  />
</>
```

### Events

监听 `onChange` 事件获取输入框值变化。

```tsx
function Demo() {
  const [value, setValue] = React.useState("");
  return (
    <WrappedEoInput
      label="Event"
      value={value}
      onChange={(e) => setValue(e.detail)}
    />
  );
}
```

### Slots

通过 `prefix`、`suffix`、`addonBefore`、`addonAfter` 插槽在输入框不同位置插入自定义内容。

```tsx
<>
  <WrappedEoInput placeholder="prefix slot">
    <WrappedEoIcon slot="prefix" lib="antd" icon="search" theme="outlined" />
  </WrappedEoInput>
  <WrappedEoInput placeholder="suffix slot">
    <WrappedEoIcon slot="suffix" lib="antd" icon="search" theme="outlined" />
  </WrappedEoInput>
  <WrappedEoInput placeholder="addon slot">
    <span slot="addonBefore">https://</span>
    <span slot="addonAfter">.com</span>
  </WrappedEoInput>
</>
```

### With Form

在 `WrappedEoForm` 中使用，通过 `name`、`label` 属性集成表单功能，并可配合 `required`、`pattern`、`message` 属性实现表单校验。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoInput
    name="text"
    label="输入框"
    required
    pattern="^[A-Za-z]+"
    message={{
      required: "请输入内容",
      pattern: "只能输入字母",
    }}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Validator

通过 `validator` 属性自定义表单项校验逻辑，返回 `null` 表示校验通过，返回包含 `message` 的对象表示校验失败。

```tsx
<WrappedEoForm onValidateSuccess={(e) => console.log(e.detail)}>
  <WrappedEoInput
    name="username"
    label="用户名"
    validator={(value) =>
      value && value.length > 10 ? { message: "用户名不能超过10个字符" } : null
    }
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Methods

通过 `ref` 调用 `focusInput` 和 `blurInput` 方法控制输入框的焦点状态。

```tsx
function Demo() {
  const ref = React.useRef(null);
  return (
    <>
      <WrappedEoInput ref={ref} placeholder="点击按钮控制焦点" />
      <button onClick={() => ref.current?.focusInput()}>获取焦点</button>
      <button onClick={() => ref.current?.blurInput()}>失去焦点</button>
    </>
  );
}
```
