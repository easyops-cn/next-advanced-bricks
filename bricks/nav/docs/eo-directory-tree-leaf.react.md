---
tagName: eo-directory-tree-leaf
displayName: WrappedEoDirectoryTreeLeaf
description: 目录树叶子节点
category: ""
source: "@next-bricks/nav"
---

# WrappedEoDirectoryTreeLeaf

> 目录树叶子节点

## 导入

```tsx
import { WrappedEoDirectoryTreeLeaf } from "@easyops/wrapped-components";
```

## Props

| 属性     | 类型                            | 必填 | 默认值 | 说明             |
| -------- | ------------------------------- | ---- | ------ | ---------------- |
| depth    | `number`                        | 是   | `0`    | 深度             |
| selected | `boolean \| undefined`          | 否   | —      | 是否选中         |
| icon     | `GeneralIconProps \| undefined` | 否   | —      | 节点图标         |
| faded    | `boolean \| undefined`          | 否   | —      | 节点是否淡化显示 |

## Events

| 事件     | detail | 说明             |
| -------- | ------ | ---------------- |
| onSelect | `void` | 节点被选中时触发 |

## Slots

| 名称     | 说明         |
| -------- | ------------ |
| （默认） | 节点标签内容 |
| suffix   | 节点后缀内容 |

## Examples

### Basic

展示基础叶子节点，包含标签和后缀内容，点击可触发选择事件。

```tsx
<WrappedEoDirectoryTreeLeaf
  style={{ width: 200 }}
  onSelect={() => console.log("selected")}
>
  <span>第一层级</span>
  <WrappedEoTag slot="suffix" color="red">
    suffixBrick
  </WrappedEoTag>
</WrappedEoDirectoryTreeLeaf>
```

### With Icon

展示带有节点图标的叶子节点。

```tsx
<WrappedEoDirectoryTreeLeaf
  style={{ width: 200 }}
  icon={{ lib: "antd", icon: "file", theme: "outlined" }}
  selected={true}
  onSelect={(e) => console.log(e.detail)}
>
  <span>文件节点</span>
  <WrappedEoTag slot="suffix" color="green">
    已选中
  </WrappedEoTag>
</WrappedEoDirectoryTreeLeaf>
```

### Faded State

展示淡化显示的叶子节点，用于表示禁用或不可用状态。

```tsx
<WrappedEoDirectoryTreeLeaf style={{ width: 200 }} faded={true} depth={0}>
  <span>淡化节点</span>
</WrappedEoDirectoryTreeLeaf>
```
