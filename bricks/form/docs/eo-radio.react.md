---
tagName: eo-radio
displayName: WrappedEoRadio
description: 通用单选构件
category: form-input-basic
source: "@next-bricks/form"
---

# WrappedEoRadio

> 通用单选构件

## 导入

```tsx
import { WrappedEoRadio } from "@easyops/wrapped-components";
```

## Props

| 属性         | 类型                     | 必填 | 默认值      | 说明                   |
| ------------ | ------------------------ | ---- | ----------- | ---------------------- |
| name         | `string`                 | -    | -           | 字段名称               |
| label        | `string`                 | -    | -           | 单选框字段说明         |
| options      | `GeneralOption[]`        | -    | -           | 单选框选项表           |
| value        | `any`                    | -    | -           | 单选框当前选中值       |
| required     | `boolean`                | -    | -           | 是否必填               |
| message      | `Record<string, string>` | -    | -           | 校验文本信息           |
| disabled     | `boolean`                | -    | -           | 是否禁用               |
| type         | `RadioType`              | -    | `"default"` | 单选框样式类型         |
| ui           | `UIType`                 | -    | -           | UI样式                 |
| size         | `ComponentSize`          | -    | -           | 大小，只对按钮样式生效 |
| customStyle  | `React.CSSProperties`    | -    | -           | 自定义radio的外层样式  |
| useBrick     | `UseSingleBrickConf`     | -    | -           | 自定义radio的内容      |
| themeVariant | `"default" \| "elevo"`   | -    | -           | 主题变体               |

## Events

| 事件            | detail                                                                       | 说明             |
| --------------- | ---------------------------------------------------------------------------- | ---------------- |
| onValueChange   | `GeneralComplexOption \| undefined` — 当前选中项的完整选项对象               | 值变化事件       |
| onOptionsChange | `{ options: GeneralComplexOption[]; name: string }` — 最新的选项列表及字段名 | 选项列表变化事件 |

## Examples

### Basic

基本用法，展示简单的单选框列表。

```tsx
<WrappedEoRadio options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]} />
```

### Label

设置 label 属性为单选框添加字段说明。

```tsx
<WrappedEoRadio
  label="city"
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
/>
```

### Value

设置 value 属性指定默认选中项。

```tsx
<WrappedEoRadio
  options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  value="Guangzhou"
/>
```

### Options

多种选项格式：字符串数组、对象数组和布尔值数组。

```tsx
<>
  <WrappedEoRadio
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
    value="Guangzhou"
  />
  <WrappedEoRadio
    options={[
      { label: "Beijing", value: 0 },
      { label: "Shanghai", value: 1 },
      { label: "Guangzhou", value: 2 },
      { label: "Shenzhen", value: 3 },
    ]}
    value={2}
  />
  <WrappedEoRadio options={[true, false]} />
</>
```

### Emoji

按钮类型单选框支持 emoji 图标。

```tsx
<WrappedEoRadio
  name="overall"
  label="总体满意度"
  type="button"
  options={[
    { label: "差", emoji: "\u{1F614}", value: -1 },
    { label: "一般", emoji: "\u{1F610}", value: 0 },
    { label: "好", emoji: "\u{1F60A}", value: 1 },
  ]}
/>
```

### Disabled

禁用单个选项或整体禁用单选框，支持各种类型。

```tsx
<WrappedEoFlexLayout gap="20px" flexDirection="column">
  <WrappedEoRadio
    value={0}
    options={[
      { label: "Beijing", value: 0, disabled: true },
      { label: "Shanghai", value: 1 },
      { label: "Guangzhou", value: 2 },
      { label: "Shenzhen", value: 3 },
    ]}
  />
  <WrappedEoRadio
    disabled={true}
    value={1}
    options={[
      { label: "Beijing", value: 0 },
      { label: "Shanghai", value: 1 },
      { label: "Guangzhou", value: 2 },
      { label: "Shenzhen", value: 3 },
    ]}
  />
  <WrappedEoRadio
    label="Icon"
    type="default"
    disabled={true}
    value={0}
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
  <WrappedEoRadio
    label="Button"
    type="button"
    disabled={true}
    value="Beijing"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <WrappedEoRadio
    label="dashboard"
    type="button"
    ui="dashboard"
    value="Shanghai"
    options={[
      { label: "Beijing", value: "Beijing" },
      { label: "Shanghai", value: "Shanghai", disabled: true },
      { label: "Guangzhou", value: "Guangzhou" },
      { label: "Shenzhen", value: "Shenzhen" },
    ]}
  />
  <WrappedEoRadio
    label="Icon"
    type="icon"
    value={1}
    disabled={true}
    options={[
      { label: "Beijing", value: 0, icon: { icon: "area-chart", lib: "antd" } },
      { label: "Shanghai", value: 1, icon: { icon: "bar-chart", lib: "antd" } },
      {
        label: "Guangzhou",
        value: 2,
        icon: { icon: "area-chart", lib: "antd" },
      },
    ]}
  />
  <WrappedEoRadio
    label="Icon Cricle"
    type="icon-circle"
    value={0}
    disabled={true}
    options={[
      { label: "Beijing", value: 0, icon: { icon: "area-chart", lib: "antd" } },
      { label: "Shanghai", value: 1, icon: { icon: "bar-chart", lib: "antd" } },
      {
        label: "Guangzhou",
        value: 2,
        icon: { icon: "area-chart", lib: "antd" },
      },
    ]}
  />
  <WrappedEoRadio
    label="Icon Square"
    type="icon-square"
    value={2}
    disabled={true}
    options={[
      { label: "Beijing", value: 0, icon: { icon: "area-chart", lib: "antd" } },
      { label: "Shanghai", value: 1, icon: { icon: "bar-chart", lib: "antd" } },
      {
        label: "Guangzhou",
        value: 2,
        icon: { icon: "area-chart", lib: "antd" },
      },
    ]}
  />
</WrappedEoFlexLayout>
```

### Size

设置 size 属性控制按钮样式单选框的大小。

```tsx
<>
  <WrappedEoRadio
    label="large"
    size="large"
    type="button"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <div style={{ height: "20px" }} />
  <WrappedEoRadio
    label="medium"
    size="medium"
    type="button"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <div style={{ height: "20px" }} />
  <WrappedEoRadio
    label="small"
    size="small"
    type="button"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
</>
```

### Type

展示 default、button、icon、icon-circle、icon-square 等各种样式类型。

```tsx
<WrappedEoFlexLayout gap="20px" flexDirection="column">
  <WrappedEoRadio
    label="Default"
    type="default"
    value="Beijing"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <WrappedEoRadio
    label="Icon"
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
  <WrappedEoRadio
    label="Button"
    type="button"
    value="Shanghai"
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <WrappedEoRadio
    label="dashboard"
    type="button"
    ui="dashboard"
    value="Shanghai"
    options={[
      { label: "Beijing", value: "Beijing" },
      { label: "Shanghai", value: "Shanghai" },
      { label: "Guangzhou", value: "Guangzhou" },
      { label: "Shenzhen", value: "Shenzhen" },
    ]}
  />
  <WrappedEoRadio
    label="Icon"
    type="icon"
    value={1}
    options={[
      { label: "Beijing", value: 0, icon: { icon: "area-chart", lib: "antd" } },
      { label: "Shanghai", value: 1, icon: { icon: "bar-chart", lib: "antd" } },
      {
        label: "Guangzhou",
        value: 2,
        icon: { icon: "area-chart", lib: "antd" },
      },
    ]}
  />
  <WrappedEoRadio
    label="Icon Cricle"
    type="icon-circle"
    value={0}
    options={[
      { label: "Beijing", value: 0, icon: { icon: "area-chart", lib: "antd" } },
      { label: "Shanghai", value: 1, icon: { icon: "bar-chart", lib: "antd" } },
      {
        label: "Guangzhou",
        value: 2,
        icon: { icon: "area-chart", lib: "antd" },
      },
    ]}
  />
  <WrappedEoRadio
    label="Icon Square"
    type="icon-square"
    value={2}
    options={[
      { label: "Beijing", value: 0, icon: { icon: "area-chart", lib: "antd" } },
      { label: "Shanghai", value: 1, icon: { icon: "bar-chart", lib: "antd" } },
      {
        label: "Guangzhou",
        value: 2,
        icon: { icon: "area-chart", lib: "antd" },
      },
    ]}
  />
</WrappedEoFlexLayout>
```

### customStyle

使用 customStyle 自定义单选项的外层样式。

```tsx
<WrappedEoRadio
  label="自定义样式"
  options={["Beijing", "Shanghai", "Guangzhou"]}
  customStyle={{
    padding: "8px",
    border: "1px solid #d9d9d9",
    borderRadius: "4px",
  }}
/>
```

### useBrick

使用 useBrick 自定义单选框内容渲染（需搭配 type="custom"）。

```tsx
<WrappedEoRadio
  label="自定义内容"
  type="custom"
  value="a"
  options={[
    { label: "选项A", value: "a" },
    { label: "选项B", value: "b" },
  ]}
  useBrick={{
    brick: "span",
    properties: {
      textContent: "<% DATA.label %>",
      style: {
        color: "green",
        fontWeight: "bold",
      },
    },
  }}
/>
```

### themeVariant

设置主题变体为 elevo 风格。

```tsx
<WrappedEoRadio
  themeVariant="elevo"
  label="Elevo 风格"
  options={["Beijing", "Shanghai", "Guangzhou"]}
  value="Beijing"
/>
```

### Event

监听 onValueChange 和 onOptionsChange 事件，通过按钮动态修改选项触发 onOptionsChange 事件。

```tsx
function RadioEventDemo() {
  const [options, setOptions] = useState([
    { label: "Beijing", value: 0 },
    { label: "Shanghai", value: 1 },
    { label: "Guangzhou", value: 2 },
    { label: "Shenzhen", value: 3 },
  ]);

  return (
    <>
      <WrappedEoRadio
        options={options}
        onValueChange={(e) => console.log("change:", e.detail)}
        onOptionsChange={(e) => console.log("options.change:", e.detail)}
      />
      <WrappedEoButton
        textContent="Click to Change Radio Option"
        onClick={() =>
          setOptions([
            { label: "Beijing", value: 0 },
            { label: "Shanghai", value: 1 },
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

在表单中使用单选框，支持 required 校验和 message 自定义校验文本。

```tsx
<WrappedEoForm
  onValidateSuccess={(e) => console.log(e.detail)}
  onValuesChange={(e) => console.log(e.detail)}
>
  <WrappedEoRadio
    name="city"
    label="城市"
    required={true}
    message={{ required: "请选择一个城市" }}
    options={["Beijing", "Shanghai", "Guangzhou", "Shenzhen"]}
  />
  <WrappedEoSubmitButtons />
</WrappedEoForm>
```
