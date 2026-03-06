---
tagName: eo-checkbox
displayName: WrappedEoCheckbox
description: 表单复选框构件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoCheckbox

> 表单复选框构件

## 导入

```tsx
import { WrappedEoCheckbox } from "@easyops/wrapped-components";
```

## Props

| 属性         | 类型                     | 必填 | 默认值      | 说明                                                                  |
| ------------ | ------------------------ | ---- | ----------- | --------------------------------------------------------------------- |
| name         | `string`                 | -    | -           | 字段名称                                                              |
| label        | `string`                 | -    | -           | 字段说明                                                              |
| value        | `CheckboxValueType[]`    | -    | -           | 值                                                                    |
| options      | `CheckboxOptionType[]`   | -    | `[]`        | 多选框选项表                                                          |
| type         | `CheckboxType`           | -    | `"default"` | 类型                                                                  |
| disabled     | `boolean`                | -    | -           | 是否禁用                                                              |
| isCustom     | `boolean`                | -    | `false`     | 是否为自定义样式，仅在 type="icon" 时生效，启用后图标尺寸更大（52px） |
| required     | `boolean`                | -    | -           | 是否必填                                                              |
| message      | `Record<string, string>` | -    | -           | 校验文本                                                              |
| isGroup      | `boolean`                | -    | -           | 是否启用分组模式，为 true 时，则可设置分组数据 optionGroups           |
| optionGroups | `OptionGroup[]`          | -    | -           | 多选框选项分组数据，需要设置 isGroup 为 true 才生效                   |
| themeVariant | `"default" \| "elevo"`   | -    | -           | 主题变体                                                              |

## Events

| 事件            | detail                                                                                                               | 说明                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| onChange        | `CheckboxOptionType[]` — { value: 选中项的值, label: 选中项的标签, disabled: 是否禁用, checkboxColor: 复选框颜色 }[] | 复选框选中项发生变化时触发 |
| onOptionsChange | `OptionsChangeEventDetail` — { options: 最新的选项列表, name: 字段名称 }                                             | 复选框选项数据变化时触发   |

## Examples

### Basic

基本用法，展示简单的多选框列表。

```tsx
<WrappedEoCheckbox options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]} />
```

### Label

设置 label 属性为复选框添加字段说明。

```tsx
<WrappedEoCheckbox
  label="city"
  options={[
    "Beijing",
    "Shanghai",
    "Guangzhou",
    "Shenzhen",
    "Tianjin",
    "Hanzhou",
    "Xi'an",
    "Fuzhou",
    "Nanchan",
    "Changsha",
    "Shenyang",
    "Jinan",
    "Guiyang",
    "Wuhan",
  ]}
/>
```

### Value

设置 value 属性指定默认选中项。

```tsx
<WrappedEoCheckbox
  value={["Beijing", "Guangzhou"]}
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Options

多种选项格式：字符串数组、对象数组和布尔值数组。

```tsx
<>
  <WrappedEoCheckbox
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
    value={["Guangzhou"]}
  />
  <WrappedEoCheckbox
    options={[
      { label: "Beijing", value: 0 },
      { label: "Shanghai", value: 1 },
      { label: "Guangzhou", value: 2 },
      { label: "Shenzhen", value: 3 },
    ]}
    value={[2, 3]}
  />
  <WrappedEoCheckbox options={[true, false]} value={[true]} />
</>
```

### Disabled

禁用单个选项或整体禁用复选框。

```tsx
<>
  <WrappedEoCheckbox
    options={[
      { label: "Beijing", value: 0, disabled: true },
      { label: "Shanghai", value: 1 },
      { label: "Guangzhou", value: 2 },
      { label: "Shenzhen", value: 3 },
    ]}
    value={[0, 2]}
  />
  <div style={{ height: "20px" }} />
  <WrappedEoCheckbox
    disabled={true}
    value={[1]}
    options={[
      { label: "Beijing", value: 0 },
      { label: "Shanghai", value: 1 },
      { label: "Guangzhou", value: 2 },
      { label: "Shenzhen", value: 3 },
    ]}
  />
</>
```

### Type

展示 default 和 icon 两种类型的复选框样式。

```tsx
<>
  <WrappedEoCheckbox
    label="Default"
    type="default"
    options={[
      {
        label: "Python",
        value: 0,
        icon: { lib: "easyops", category: "colored-common", icon: "python" },
      },
      {
        label: "Javascript",
        value: 1,
        icon: {
          lib: "easyops",
          category: "program-language",
          icon: "javascript",
        },
      },
      {
        label: "Powershell",
        value: 2,
        icon: {
          lib: "easyops",
          category: "colored-common",
          icon: "powershell",
        },
      },
      {
        label: "Shell",
        value: 3,
        icon: { lib: "easyops", category: "colored-common", icon: "shell" },
      },
    ]}
  />
  <div style={{ height: "20px" }} />
  <WrappedEoCheckbox
    label="Icon"
    type="icon"
    options={[
      {
        label: "Python",
        value: 0,
        icon: { lib: "easyops", category: "colored-common", icon: "python" },
      },
      {
        label: "Javascript",
        value: 1,
        icon: {
          lib: "easyops",
          category: "program-language",
          icon: "javascript",
        },
      },
      {
        label: "Powershell",
        value: 2,
        icon: {
          lib: "easyops",
          category: "colored-common",
          icon: "powershell",
        },
      },
      {
        label: "Shell",
        value: 3,
        icon: { lib: "easyops", category: "colored-common", icon: "shell" },
      },
    ]}
  />
</>
```

### isCustom

启用自定义样式（仅在 type="icon" 时生效），图标尺寸更大。

```tsx
<WrappedEoCheckbox
  label="自定义图标样式"
  type="icon"
  isCustom={true}
  options={[
    {
      label: "Python",
      value: 0,
      icon: { lib: "easyops", category: "colored-common", icon: "python" },
    },
    {
      label: "Javascript",
      value: 1,
      icon: {
        lib: "easyops",
        category: "program-language",
        icon: "javascript",
      },
    },
  ]}
/>
```

### checkboxColor

为不同选项设置自定义颜色。

```tsx
<WrappedEoCheckbox
  options={[
    { label: "Beijing", value: 0, checkboxColor: "red" },
    { label: "Shanghai", value: 1, checkboxColor: "orange" },
    { label: "Guangzhou", value: 2, checkboxColor: "blue" },
    { label: "Shenzhen", value: 3, checkboxColor: "green" },
  ]}
  value={[2, 1]}
/>
```

### optionGroups

启用分组模式，将选项按组展示，支持全选/取消全选操作。

```tsx
<WrappedEoCheckbox
  isGroup={true}
  label="商品"
  name="goods"
  optionGroups={[
    {
      key: "fruits",
      name: "水果",
      options: [
        { label: "苹果", value: "apple" },
        { label: "香蕉", value: "banana" },
      ],
    },
    {
      key: "vegetables",
      name: "蔬菜",
      options: [{ label: "土豆", value: "potato" }],
    },
  ]}
  value={["banana", "potato"]}
  onChange={(e) => console.log(e.detail)}
/>
```

### themeVariant

设置主题变体为 elevo 风格。

```tsx
<WrappedEoCheckbox
  themeVariant="elevo"
  label="Elevo 风格"
  options={[
    { label: "Beijing", value: 0 },
    { label: "Shanghai", value: 1 },
    { label: "Guangzhou", value: 2 },
  ]}
  value={[0]}
/>
```

### Event

监听 onChange 和 onOptionsChange 事件，通过按钮动态修改选项触发 onOptionsChange 事件。

```tsx
function CheckboxEventDemo() {
  const [options, setOptions] = useState([
    { label: "Beijing", value: 0 },
    { label: "Shanghai", value: 1 },
    { label: "Guangzhou", value: 2 },
    { label: "Shenzhen", value: 3 },
  ]);

  return (
    <>
      <WrappedEoCheckbox
        options={options}
        onChange={(e) => console.log("change:", e.detail)}
        onOptionsChange={(e) => console.log("options.change:", e.detail)}
      />
      <WrappedEoButton
        textContent="Click to Change Checkbox Option"
        onClick={() =>
          setOptions([
            { label: "Beijing", value: 0 },
            {
              label: "Shanghai",
              value: 1,
              icon: { icon: "bar-chart", lib: "antd" },
            },
            { label: "Guangzhou", value: 2 },
            { label: "Shenzhen", value: 3 },
            { label: "Hangzhou", value: 4 },
          ])
        }
      />
    </>
  );
}
```

### With Form

在表单中使用复选框，支持 required 校验和 message 自定义校验文本。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoCheckbox
    name="city"
    label="城市"
    required={true}
    message={{ required: "请选择至少一个城市" }}
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```
