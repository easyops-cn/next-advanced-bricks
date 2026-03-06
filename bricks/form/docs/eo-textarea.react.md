---
tagName: eo-textarea
displayName: WrappedEoTextarea
description: 通用多行文本输入框构件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoTextarea

> 通用多行文本输入框构件

## 导入

```tsx
import { WrappedEoTextarea } from "@easyops/wrapped-components";
```

## Props

| 属性          | 类型                     | 必填 | 默认值 | 说明                                                                        |
| ------------- | ------------------------ | ---- | ------ | --------------------------------------------------------------------------- |
| name          | `string`                 | 否   | -      | 字段名称                                                                    |
| label         | `string`                 | 否   | -      | 标签文字                                                                    |
| value         | `string`                 | 否   | -      | 值                                                                          |
| placeholder   | `string`                 | 否   | -      | 占位说明                                                                    |
| disabled      | `boolean`                | 否   | -      | 是否禁用                                                                    |
| minLength     | `number`                 | 否   | -      | 最小长度                                                                    |
| maxLength     | `number`                 | 否   | -      | 最大长度                                                                    |
| autoSize      | `AutoSize`               | 否   | -      | 大小自适应                                                                  |
| required      | `boolean`                | 否   | -      | 是否必填                                                                    |
| max           | `number`                 | 否   | -      | 表单校验最大长度                                                            |
| min           | `number`                 | 否   | -      | 表单校验最小长度                                                            |
| message       | `Record<string, string>` | 否   | -      | 校验信息                                                                    |
| textareaStyle | `React.CSSProperties`    | 否   | -      | 自定义样式                                                                  |
| variant       | `"default" \| "muted"`   | 否   | -      | 变体。`muted`：在 themeVariant 为 elevo 时可用，设置时输入框没有 box-shadow |
| themeVariant  | `"default" \| "elevo"`   | 否   | -      | 主题变体                                                                    |

## Events

| 事件     | detail                | 说明       |
| -------- | --------------------- | ---------- |
| onChange | `string` — 当前输入值 | 值改变事件 |

## Methods

| 方法            | 说明             |
| --------------- | ---------------- |
| focusTextarea() | 使文本域获得焦点 |

## Examples

### Basic

展示多行文本输入框的最基本用法。

```tsx
<WrappedEoTextarea label="多行输入框" placeholder="请输入内容" />
```

### Value

通过 `value` 属性设置文本域的默认值。

```tsx
<WrappedEoTextarea label="默认值" value="Default Value" />
```

### Disabled

设置 `disabled` 属性禁用文本域。

```tsx
<WrappedEoTextarea label="禁用状态" value="Default Value" disabled />
```

### Placeholder

通过 `placeholder` 属性设置文本域的占位提示文字。

```tsx
<WrappedEoTextarea placeholder="This is placeholder..." />
```

### MaxLength

通过 `maxLength` 属性限制输入的最大字符数。

```tsx
<WrappedEoTextarea
  label="最大长度"
  placeholder="max length = 10"
  maxLength={10}
/>
```

### AutoSize

通过 `autoSize` 属性让文本域高度随内容自动调整，支持设置 `minRows` 和 `maxRows` 限制行数范围。

```tsx
<>
  <WrappedEoTextarea placeholder="autoSize: true" autoSize={true} />
  <WrappedEoTextarea
    placeholder="autoSize: { minRows: 3 }"
    autoSize={{ minRows: 3 }}
  />
  <WrappedEoTextarea
    placeholder="autoSize: { minRows: 3, maxRows: 5 }"
    autoSize={{ minRows: 3, maxRows: 5 }}
  />
</>
```

### TextareaStyle

通过 `textareaStyle` 属性自定义文本域的内联样式。

```tsx
<>
  <WrappedEoTextarea
    placeholder="width: 180px"
    textareaStyle={{ width: "180px" }}
  />
  <WrappedEoTextarea
    placeholder="width: 250px"
    textareaStyle={{ width: "250px" }}
  />
  <WrappedEoTextarea
    placeholder="border style"
    textareaStyle={{ border: "1px solid #8b2121" }}
  />
</>
```

### Events

监听 `onChange` 事件获取用户输入的实时值。

```tsx
<WrappedEoTextarea
  label="Event"
  placeholder="请输入内容"
  onChange={(e) => console.log(e.detail)}
/>
```

### With Form

在 `WrappedEoForm` 中使用，通过 `name`、`label`、`required`、`min`、`max`、`message` 属性集成表单校验功能。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoTextarea
    label="描述"
    name="description"
    required
    min={5}
    max={200}
    message={{
      required: "请输入描述",
      min: "描述不能少于5个字符",
      max: "描述不能超过200个字符",
    }}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Methods

通过 `focusTextarea` 方法使文本域获得焦点。

```tsx
function Demo() {
  const ref = useRef(null);
  return (
    <>
      <WrappedEoTextarea
        ref={ref}
        label="文本域"
        placeholder="点击按钮使其获得焦点"
      />
      <WrappedEoButton onClick={() => ref.current?.focusTextarea()}>
        获取焦点
      </WrappedEoButton>
    </>
  );
}
```
