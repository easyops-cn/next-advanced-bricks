---
tagName: data-view.complex-search
displayName: WrappedDataViewComplexSearch
description: 大屏搜索构件
category: big-screen-content
source: "@next-bricks/data-view"
---

# WrappedDataViewComplexSearch

> 大屏搜索构件

## 导入

```tsx
import { WrappedDataViewComplexSearch } from "@easyops/wrapped-components";
```

## Props

| 属性            | 类型                          | 必填 | 默认值 | 说明             |
| --------------- | ----------------------------- | ---- | ------ | ---------------- |
| value           | `string \| undefined`         | 否   | -      | 初始值           |
| placeholder     | `string \| undefined`         | 否   | -      | 占位符           |
| options         | `OptionItem[]`                | 是   | -      | 下拉选项         |
| tooltipUseBrick | `ReactUseMultipleBricksProps` | 是   | -      | tooltip useBrick |

## Events

| 事件     | detail                                            | 说明            |
| -------- | ------------------------------------------------- | --------------- |
| onChange | `string` — 当前输入框的文本值                     | input值改变事件 |
| onSearch | `string` — 当前搜索的文本值                       | input值搜索事件 |
| onSelect | `OptionItem` — { icon: 图标配置, name: 选项名称 } | 下拉选择事件    |
| onFocus  | -                                                 | 聚焦事件        |
| onBlur   | -                                                 | 失焦事件        |

## Examples

### Basic

基本用法，展示带下拉选项的搜索框，支持搜索、选择和聚焦事件。

```tsx
<WrappedDataViewComplexSearch
  placeholder="Search"
  style={{ background: "#1c1e21", display: "block", height: "300px" }}
  options={[
    {
      name: "主机1",
      icon: { lib: "antd", icon: "account-book", theme: "outlined" },
    },
    {
      name: "主机2",
      icon: { lib: "antd", icon: "account-book", theme: "outlined" },
    },
  ]}
  onChange={(e) => console.log(e.detail)}
  onSelect={(e) => console.log(e.detail)}
  onSearch={(e) => console.log(e.detail)}
  onFocus={() => console.log("focus")}
  onBlur={() => console.log("blur")}
/>
```

### With Value and TooltipUseBrick

设置初始值，并通过 tooltipUseBrick 自定义下拉项的 tooltip 内容。

```tsx
<WrappedDataViewComplexSearch
  value="主机1"
  placeholder="请输入搜索内容"
  style={{ background: "#1c1e21", display: "block", height: "300px" }}
  options={[
    {
      name: "主机1",
      icon: { lib: "antd", icon: "account-book", theme: "outlined" },
      description: "这是主机1的描述",
    },
    {
      name: "主机2",
      icon: { lib: "antd", icon: "account-book", theme: "outlined" },
      description: "这是主机2的描述",
    },
  ]}
  tooltipUseBrick={{
    useBrick: [
      {
        brick: "div",
        properties: {
          textContent: "<% DATA.description %>",
          style: { color: "#fff", padding: "8px" },
        },
      },
    ],
  }}
  onSelect={(e) => console.log(e.detail)}
  onSearch={(e) => console.log(e.detail)}
/>
```
