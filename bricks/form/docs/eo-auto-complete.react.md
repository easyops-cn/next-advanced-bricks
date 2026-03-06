---
tagName: eo-auto-complete
displayName: WrappedEoAutoComplete
description: 带候选项的输入框
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoAutoComplete

> 带候选项的输入框

## 导入

```tsx
import { WrappedEoAutoComplete } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型                          | 必填 | 默认值 | 说明                             |
| --------------- | ----------------------------- | ---- | ------ | -------------------------------- |
| name            | `string`                      | 否   | -      | 字段名称                         |
| placeholder     | `string`                      | 否   | -      | 占位说明                         |
| label           | `string`                      | 否   | -      | 字段文本                         |
| inputStyle      | `React.CSSProperties`         | 否   | -      | 输入框样式                       |
| disabled        | `boolean`                     | 否   | -      | 是否禁用                         |
| required        | `boolean`                     | 否   | -      | 是否必填                         |
| value           | `string`                      | 否   | -      | 输入框当前值                     |
| options         | `string[] \| OptionType[]`    | 否   | -      | 选项列表                         |
| filterByCaption | `boolean`                     | 否   | -      | 搜索时是否根据caption过滤options |
| validator       | `(value: any) => MessageBody` | 否   | -      | 表单项校验方法                   |
| pattern         | `string`                      | 否   | -      | 正则校验规则                     |
| message         | `Record<string, string>`      | 否   | -      | 校验文本信息                     |

## Events

| 事件     | detail                    | 说明       |
| -------- | ------------------------- | ---------- |
| onChange | `string` — 当前输入框的值 | 值改变事件 |

## Slots

| 名称            | 说明               |
| --------------- | ------------------ |
| options-toolbar | 下拉列表底部工具栏 |

## Examples

### Basic

展示带候选项输入框的最基本用法，通过字符串数组提供候选选项。

```tsx
<WrappedEoAutoComplete
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Caption

通过 `OptionType` 对象格式为每个选项添加 `caption` 附加说明文字。

```tsx
<WrappedEoAutoComplete
  options={[
    { label: "选项1", value: "1", caption: "说明1" },
    { label: "选项2", value: "2", caption: "说明2" },
    { label: "选项3", value: "3", caption: "说明3" },
  ]}
/>
```

### 分组

通过 `OptionGroup` 格式对选项进行分组展示，组内每个选项可包含 `label`、`value` 和 `caption`。

```tsx
<WrappedEoAutoComplete
  options={[
    { label: "选项1", value: "1", caption: "说明1" },
    { label: "选项2", value: "2", caption: "说明2" },
    {
      label: "分组1",
      options: [
        { label: "选项3-1", value: "3-1", caption: "说明3-1" },
        { label: "选项3-2", value: "3-2", caption: "说明3-2" },
      ],
    },
  ]}
/>
```

### filterByCaption

设置 `filterByCaption` 为 `true`，搜索时同时匹配选项的 `caption` 字段。

```tsx
<WrappedEoAutoComplete
  filterByCaption
  options={[
    { label: "选项1", value: "1", caption: "说明1" },
    { label: "选项2", value: "2", caption: "说明2" },
    {
      label: "分组1",
      options: [
        { label: "选项3-1", value: "3-1", caption: "说明3-1" },
        { label: "选项3-2", value: "3-2", caption: "说明3-2" },
      ],
    },
  ]}
/>
```

### Value

通过 `value` 属性设置输入框的默认值。

```tsx
<WrappedEoAutoComplete
  value="Beijing"
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Placeholder

通过 `placeholder` 属性设置输入框的占位提示文字。

```tsx
<WrappedEoAutoComplete
  placeholder="请输入城市名称"
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Input Style

通过 `inputStyle` 属性自定义输入框的内联样式。

```tsx
<WrappedEoAutoComplete
  inputStyle={{ width: "300px" }}
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Disabled

设置 `disabled` 属性禁用输入框。

```tsx
<WrappedEoAutoComplete
  disabled
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Events

监听 `onChange` 事件获取用户输入或选中的实时值。

```tsx
<WrappedEoAutoComplete
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  onChange={(e) => console.log(e.detail)}
/>
```

### With Form

在 `WrappedEoForm` 中使用，通过 `name`、`label` 属性集成表单功能，并可配合 `required`、`pattern`、`message` 属性实现表单校验。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoAutoComplete
    name="city"
    label="城市"
    required
    pattern="^[A-Za-z]+"
    message={{
      required: "请选择城市",
      pattern: "城市名称只能包含字母",
    }}
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Validator

通过 `validator` 属性自定义表单项的校验逻辑，返回 `null` 表示校验通过，返回包含 `message` 的对象表示校验失败。

```tsx
<WrappedEoForm onValidateSuccess={(e) => console.log(e.detail)}>
  <WrappedEoAutoComplete
    name="city"
    label="城市"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
    validator={(value) =>
      value && value.length > 10
        ? { message: "城市名称不能超过10个字符" }
        : null
    }
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```

### Options Toolbar Slot

通过 `options-toolbar` 插槽在下拉列表底部添加自定义工具栏内容。

```tsx
<WrappedEoAutoComplete
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
>
  <span
    slot="options-toolbar"
    style={{ padding: "4px 8px", color: "#999", fontSize: "12px" }}
  >
    自定义工具栏
  </span>
</WrappedEoAutoComplete>
```
